/*
  Minimal Audio/Video WebRTC service using socket.io for signaling.
  - Uses `socket` (socket.io client) for signaling events:
    'webrtc:offer', 'webrtc:answer', 'webrtc:ice-candidate'
  - Intended to be safe and defensive so it doesn't break the app
*/

import type { Socket } from 'socket.io-client';

type RemoteStreamCallback = (peerId: string, stream: MediaStream) => void;
type OfferHandler = (from: string, fromUsername: string, offer: any, mediaType?: string) => Promise<void>;

export interface PeerInfo {
  socketId: string;
  username?: string;
}

export class AudioVideoService {
  private socket: Socket;
  private localStream: MediaStream | null = null;
  private peers: Map<string, RTCPeerConnection> = new Map();
  private remoteStreams: Map<string, MediaStream> = new Map();

  // Callbacks that consumers can set
  public onRemoteStream: RemoteStreamCallback | null = null;
  public onOfferReceived: OfferHandler | null = null;
  public onPeerDisconnected: ((peerId: string) => void) | null = null;

  constructor(socket: Socket) {
    this.socket = socket;

    // Bind signaling handlers (server broadcasts to the target peer)
    this.socket.on('webrtc:offer-received', this._onOffer);
    this.socket.on('webrtc:answer-received', this._onAnswer);
    this.socket.on('webrtc:ice-candidate-received', this._onIceCandidate);
    this.socket.on('webrtc:peer-disconnected', (payload: any) => {
      const id = payload?.peerId;
      if (id) {
        this._cleanupPeer(id);
        this.onPeerDisconnected && this.onPeerDisconnected(id);
      }
    });
  }

  async initializeLocalStream(opts: { audio?: boolean; video?: boolean } = { audio: true, video: false }) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: !!opts.audio, video: !!opts.video });
      return this.localStream;
    } catch (err) {
      console.error('AudioVideoService: failed to getUserMedia', err);
      throw err;
    }
  }

  getLocalStream() {
    return this.localStream;
  }

  async createAndSendOffer(target: string, mediaType: 'audio' | 'video' | 'both' | string = 'audio', metadata: any = {}) {
    if (!this.localStream) {
      await this.initializeLocalStream({ audio: true, video: false });
    }

    const pc = this._createPeerConnection(target);

    // Add local tracks
    this.localStream!.getTracks().forEach(track => pc.addTrack(track, this.localStream!));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    this.socket.emit('webrtc:offer', { targetSocketId: target, offer: pc.localDescription, mediaType, metadata });
  }

  async handleOfferReceived(from: string, offer: any, mediaType?: string) {
    if (!this.localStream) {
      await this.initializeLocalStream({ audio: true, video: false });
    }

    const pc = this._createPeerConnection(from);

    // Add local tracks
    this.localStream!.getTracks().forEach(track => pc.addTrack(track, this.localStream!));

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    this.socket.emit('webrtc:answer', { targetSocketId: from, answer: pc.localDescription });
  }

  cleanup() {
    // Close all peer connections
    this.peers.forEach((pc, id) => {
      try { pc.close(); } catch (e) {}
    });
    this.peers.clear();

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = null;
    }

    // Remove signaling handlers
    try {
      this.socket.off('webrtc:offer-received', this._onOffer);
      this.socket.off('webrtc:answer-received', this._onAnswer);
      this.socket.off('webrtc:ice-candidate-received', this._onIceCandidate);
    } catch (e) {}
  }

  async getPeersInRoom(roomId: string): Promise<PeerInfo[]> {
    return new Promise((resolve) => {
      try {
        this.socket.emit('webrtc:get-peers', { roomId }, (res: any) => {
          if (res?.success && Array.isArray(res.peers)) resolve(res.peers);
          else resolve([]);
        });
      } catch (e) {
        resolve([]);
      }
    });
  }

  // ===== Internal helpers =====
  private _createPeerConnection(peerId: string) {
    if (this.peers.has(peerId)) return this.peers.get(peerId)!;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });

    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        try { this.socket.emit('webrtc:ice-candidate', { targetSocketId: peerId, candidate: ev.candidate }); } catch (e) {}
      }
    };

    pc.ontrack = (ev) => {
      const remoteStream = ev.streams && ev.streams[0] ? ev.streams[0] : new MediaStream(ev.track ? [ev.track] : []);
      this.remoteStreams.set(peerId, remoteStream);
      this.onRemoteStream && this.onRemoteStream(peerId, remoteStream);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        this._cleanupPeer(peerId);
        this.onPeerDisconnected && this.onPeerDisconnected(peerId);
      }
    };

    this.peers.set(peerId, pc);
    return pc;
  }

  private _onOffer = async (payload: any) => {
    const { from, offer, mediaType, fromUsername } = payload || {};
    if (!from || !offer) return;
    if (this.onOfferReceived) {
      await this.onOfferReceived(from, fromUsername || '', offer, mediaType);
    } else {
      // default auto-answer behaviour
      await this.handleOfferReceived(from, offer, mediaType);
    }
  };

  private _onAnswer = async (payload: any) => {
    const { from, answer } = payload || {};
    if (!from || !answer) return;
    const pc = this.peers.get(from);
    if (!pc) return;
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (e) { console.warn('Failed to set remote description for answer', e); }
  };

  private _onIceCandidate = (payload: any) => {
    const { from, candidate } = payload || {};
    if (!from || !candidate) return;
    const pc = this.peers.get(from);
    if (!pc) return;
    try { pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch (e) { console.warn('Failed to add ICE', e); }
  };

  private _cleanupPeer(peerId: string) {
    const pc = this.peers.get(peerId);
    if (pc) {
      try { pc.close(); } catch (e) {}
      this.peers.delete(peerId);
    }
    const rs = this.remoteStreams.get(peerId);
    if (rs) {
      rs.getTracks().forEach(t => t.stop());
      this.remoteStreams.delete(peerId);
    }
  }
}

export default AudioVideoService;
