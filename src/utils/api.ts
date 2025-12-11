import io, { Socket } from 'socket.io-client';
import { API_BASE_URL } from './constants';
// Import your types if needed
// import { Room, GameMove, Card, GameStats } from '../types';

export interface MakeMoveResponse {
  awaitingSpecialAction?: boolean;
  specialCard?: string | null;
  message?: string;
}

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  /**
   * Initialize and connect to the WebSocket server
   */
  connect(url: string = `${API_BASE_URL}`): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      try {
        this.socket = io(url, {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          transports: ['websocket', 'polling'],
        });

        this.socket.on('connect', () => {
          console.log('✅ Connected to server');
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('❌ Disconnected from server');
          this.emitLocalEvent('socket:disconnected');
        });

        this.socket.on('connect_error', (error) => {
          console.error('⚠️ Connection error:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // ===== ROOM MANAGEMENT =====

  /**
   * Create a new room
   */
  createRoom(
    numPlayers: number,
    numToDeal: number,
    userId: string,
    username: string
  ): Promise<any> {
    const payload = {
      numPlayers,
      numToDeal,
      owner: userId,
      ownerName: username,
    };

    console.log('[SocketService] createRoom -> emitting', payload);
    return this.emitWithResponse('room:create', payload)
      .then((res) => {
        console.log('[SocketService] createRoom <- response', res);
        return res;
      })
      .catch((err) => {
        console.error('[SocketService] createRoom <- error', err);
        throw err;
      });
  }

  /**
   * Join an existing room
   */
  joinRoom(
    roomId: string,
    userId: string,
    username: string,
    roomCode?: string
  ): Promise<any> {
    return this.emitWithResponse('room:join', {
      roomId,
      userId,
      username,
      roomCode,
    });
  }

  /**
   * Get room details
   */
  getRoomDetails(roomId: string): Promise<any> {
    return this.emitWithResponse('room:get-details', { roomId });
  }

  /**
   * Get all rooms for a user
   */
  getUserRooms(userId: string): Promise<any[]> {
    return this.emitWithResponse('room:list-by-user', { userId });
  }

  /**
   * List all available rooms
   */
  listAvailableRooms(): Promise<any[]> {
    return this.emitWithResponse('room:list-available', {});
  }

  /**
   * Terminate a room
   */
  terminateRoom(roomId: string, userId: string): Promise<void> {
    return this.emitWithResponse('game:terminate', { roomId, userId });
  }

  // ===== GAME ACTIONS =====

  /**
   * Start the game
   * Accepts optional userId for backward compatibility with call sites
   */
  startGame(roomId: string, userId?: string): Promise<void> {
    return this.emitWithResponse('room:start-game', { roomId, userId });
  }

  /**
   * Get current game data
   */
  getGameData(roomId: string): Promise<any> {
    return this.emitWithResponse('game:get-data', { roomId });
  }

  /**
   * Make a move in the game
   */
  makeMove(
    roomId: string,
    userId: string,
    action: string,
    cards: any[]
  ): Promise<MakeMoveResponse> {
    return this.emitWithResponse('game:move', {
      roomId,
      userId,
      action,
      cards,
    });
  }

  /**
   * Declare Niko Kadi (player is card)
   */
  declareNikoKadi(roomId: string, userId: string): Promise<void> {
    return this.emitWithResponse('game:nikokadi', { roomId, userId });
  }

  /**
   * Call Niko Kadi on another player
   */
  callNikoKadi(
    roomId: string,
    userId: string,
    targetPlayerId: string
  ): Promise<void> {
    return this.emitWithResponse('game:nikokadi', {
      roomId,
      userId,
      targetPlayerId,
    });
  }

  /**
   * Change the suit
   */
  changeSuit(roomId: string, userId: string, newSuit: string): Promise<void> {
    return this.emitWithResponse('game:change-suit', {
      roomId,
      userId,
      newSuit,
    });
  }

  /**
   * Answer a question card
   */
  answerQuestion(
    roomId: string,
    userId: string,
    answer: string
  ): Promise<void> {
    return this.emitWithResponse('game:answer-question', {
      roomId,
      userId,
      cards: [],
      action: answer,
    });
  }

  /**
   * Drop an ace
   */
  dropAce(roomId: string, userId: string, cards: any[]): Promise<void> {
    return this.emitWithResponse('game:drop-ace', {
      roomId,
      userId,
      drop: cards,
    });
  }

  // ===== COMMUNICATION =====

  /**
   * Send a chat message to a room
   */
  sendMessage(content: string, roomId: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected');
      return;
    }
    this.socket.emit('chat:message', { content, roomId });
  }

  /**
   * Send raw audio payload to room
   */
  sendAudio(roomId: string, username: string, userId: string, audio: any): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected (audio)');
      return;
    }
    this.socket.emit('audio', { roomId, username, userId, audio });
  }

  // ===== WEBRTC SIGNALING =====

  /**
   * Send WebRTC offer
   */
  sendOffer(targetSocketId: string, offer: any, mediaType?: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected');
      return;
    }
    this.socket.emit('webrtc:offer', { targetSocketId, offer, mediaType });
  }

  /**
   * Send WebRTC answer
   */
  sendAnswer(targetSocketId: string, answer: any): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected');
      return;
    }
    this.socket.emit('webrtc:answer', { targetSocketId, answer });
  }

  /**
   * Send ICE candidate
   */
  sendIceCandidate(targetSocketId: string, candidate: any): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected');
      return;
    }
    this.socket.emit('webrtc:ice-candidate', { targetSocketId, candidate });
  }

  /**
   * Request list of peers for this room
   */
  getPeers(roomId: string): Promise<any> {
    return this.emitWithResponse('webrtc:get-peers', { roomId });
  }

  // ===== EVENT LISTENERS =====

  /**
   * Listen for game state updates (broadcast to all room players)
   */
  onGameStateUpdated(callback: (data: any) => void): () => void {
    return this.addEventListener('game:state-updated', callback);
  }

  /**
   * Listen for game start
   */
  onGameStarted(callback: (data: any) => void): () => void {
    return this.addEventListener('game:started', callback);
  }

  /**
   * Listen for game termination
   */
  onGameTerminated(callback: (data: any) => void): () => void {
    return this.addEventListener('game:terminated', callback);
  }

  /**
   * Listen for user joining room
   */
  onUserJoined(callback: (data: any) => void): () => void {
    return this.addEventListener('user-joined', callback);
  }

  /**
   * Listen for user leaving room
   */
  onUserLeft(callback: (data: any) => void): () => void {
    return this.addEventListener('user-left', callback);
  }

  /**
   * Listen for chat messages
   */
  onChatMessage(callback: (data: any) => void): () => void {
    return this.addEventListener('chat:message', callback);
  }

  /**
   * Listen for full room users list
   */
  onRoomUsers(callback: (data: any) => void): () => void {
    return this.addEventListener('room-users', callback);
  }

  /**
   * Listen for raw audio messages
   */
  onAudio(callback: (data: any) => void): () => void {
    return this.addEventListener('audio', callback);
  }

  /**
   * Listen for WebRTC offer
   */
  onWebRTCOffer(callback: (data: any) => void): () => void {
    // server broadcasts `webrtc:offer-received` to the target peer
    return this.addEventListener('webrtc:offer-received', callback);
  }

  /**
   * Listen for WebRTC answer
   */
  onWebRTCAnswer(callback: (data: any) => void): () => void {
    // server broadcasts `webrtc:answer-received` to the target peer
    return this.addEventListener('webrtc:answer-received', callback);
  }

  /**
   * Listen for ICE candidate
   */
  onWebRTCIceCandidate(callback: (data: any) => void): () => void {
    // server broadcasts `webrtc:ice-candidate-received` to the target peer
    return this.addEventListener('webrtc:ice-candidate-received', callback);
  }

  /**
   * Listen for connection state updates
   */
  onWebRTCConnectionState(callback: (data: any) => void): () => void {
    return this.addEventListener('webrtc:connection-state-update', callback);
  }

  /**
   * Listen for peer disconnect notifications
   */
  onWebRTCPeerDisconnected(callback: (data: any) => void): () => void {
    return this.addEventListener('webrtc:peer-disconnected', callback);
  }

  /**
   * Return the raw socket instance (nullable) for libraries that require direct access.
   * Use sparingly — prefer the typed helpers on this service.
   */
  getRawSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Listen for socket connection
   */
  onConnected(callback: () => void): () => void {
    return this.addEventListener('socket:connected', callback);
  }

  /**
   * Listen for socket disconnection
   */
  onDisconnected(callback: () => void): () => void {
    return this.addEventListener('socket:disconnected', callback);
  }

  // ===== PRIVATE HELPER METHODS =====

  /**
   * Emit event and wait for response (Promise-based)
   */
  private emitWithResponse(event: string, payload: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.socket?.connected) {
          console.warn(`[SocketService] socket not connected - attempting auto-connect before emitting '${event}'`);
          try {
            await this.connect();
            console.log('[SocketService] auto-connect successful');
          } catch (connErr) {
            console.error('[SocketService] auto-connect failed', connErr);
            reject(new Error('Socket not connected'));
            return;
          }
        }

        console.log(`[SocketService] emitting ${event} ->`, payload);

        const timeout = setTimeout(() => {
          reject(new Error(`${event} request timed out`));
        }, 10000);

        this.socket!.emit(event, payload, (response: any) => {
          clearTimeout(timeout);
          console.log(`[SocketService] ${event} <- response`, response);
          // Some server handlers reply with { success: true } and no `data` property.
          // When `success` exists, treat it as the canonical flag; otherwise assume
          // the raw response is the payload.
          if (response && typeof response === 'object' && 'success' in response) {
            if (response.success) {
              if (response.data === undefined) {
                // Warn to aid debugging when server responds with success but no data
                console.warn(`[SocketService] ${event} returned success without data`);
                resolve(response);
              } else {
                resolve(response.data);
              }
            } else {
              reject(new Error(response.error || 'Unknown error'));
            }
          } else {
            // No explicit success flag — resolve with whatever the server sent.
            resolve(response);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Add event listener with cleanup function
   */
  private addEventListener(
    event: string,
    callback: Function
  ): () => void {
    if (!this.socket) {
      console.warn(`Socket not initialized for event: ${event}`);
      return () => {};
    }

    this.socket.on(event, callback as any);

    // Return unsubscribe function
    return () => {
      this.socket?.off(event, callback as any);
    };
  }

  /**
   * Emit local event (not sent to server)
   */
  private emitLocalEvent(event: string): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback());
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();

// Convenience wrappers (so existing imports keep working) - these call into socketService
export const connectSocketService = (url?: string) => socketService.connect(url);
export const disconnectSocketService = () => socketService.disconnect();
export const isSocketConnected = () => socketService.isConnected();

export const createRoom = (numPlayers: number, numToDeal: number, userId: string, username: string) => socketService.createRoom(numPlayers, numToDeal, userId, username);
export const joinRoom = (roomId: string, userId: string, username: string, roomCode?: string) => socketService.joinRoom(roomId, userId, username, roomCode);
export const getRoomDetails = (roomId: string) => socketService.getRoomDetails(roomId);
export const getUserRooms = (userId: string) => socketService.getUserRooms(userId);
export const listAvailableRooms = () => socketService.listAvailableRooms();
export const terminateRoom = (roomId: string, userId: string) => socketService.terminateRoom(roomId, userId);

export const startGame = (roomId: string, userId?: string) => socketService.startGame(roomId, userId);
export const getGameData = (roomId: string) => socketService.getGameData(roomId);
export const makeMove = (roomId: string, userId: string, action: string, cards: any[]) => socketService.makeMove(roomId, userId, action, cards);
export const declareNikoKadi = (roomId: string, userId: string) => socketService.declareNikoKadi(roomId, userId);
export const callNikoKadi = (roomId: string, userId: string, targetPlayerId: string) => socketService.callNikoKadi(roomId, userId, targetPlayerId);
export const changeSuit = (roomId: string, userId: string, newSuit: string) => socketService.changeSuit(roomId, userId, newSuit);
export const answerQuestion = (roomId: string, userId: string, answer: string) => socketService.answerQuestion(roomId, userId, answer);
export const dropAce = (roomId: string, userId: string, cards: any[]) => socketService.dropAce(roomId, userId, cards);

// Chat
export const sendMessage = (content: string, roomId: string) => socketService.sendMessage(content, roomId);

// Audio helper
export const sendAudio = (roomId: string, username: string, userId: string, audio: any) => socketService.sendAudio(roomId, username, userId, audio);

// WebRTC helpers
export const sendOffer = (targetSocketId: string, offer: any, mediaType?: string) => socketService.sendOffer(targetSocketId, offer, mediaType);
export const sendAnswer = (targetSocketId: string, answer: any) => socketService.sendAnswer(targetSocketId, answer);
export const sendIceCandidate = (targetSocketId: string, candidate: any) => socketService.sendIceCandidate(targetSocketId, candidate);
export const getPeers = (roomId: string) => socketService.getPeers(roomId);
export const getRawSocket = () => socketService.getRawSocket();

// Listener wrapper exports (forward to singleton socketService)
export const onGameStateUpdated = (cb: (data: any) => void) => socketService.onGameStateUpdated(cb);
export const onGameStarted = (cb: (data: any) => void) => socketService.onGameStarted(cb);
export const onGameTerminated = (cb: (data: any) => void) => socketService.onGameTerminated(cb);
export const onUserJoined = (cb: (data: any) => void) => socketService.onUserJoined(cb);
export const onUserLeft = (cb: (data: any) => void) => socketService.onUserLeft(cb);
export const onChatMessage = (cb: (data: any) => void) => socketService.onChatMessage(cb);
export const onRoomUsers = (cb: (data: any) => void) => socketService.onRoomUsers(cb);
export const onAudio = (cb: (data: any) => void) => socketService.onAudio(cb);
export const onWebRTCOffer = (cb: (data: any) => void) => socketService.onWebRTCOffer(cb);
export const onWebRTCAnswer = (cb: (data: any) => void) => socketService.onWebRTCAnswer(cb);
export const onWebRTCIceCandidate = (cb: (data: any) => void) => socketService.onWebRTCIceCandidate(cb);
export const onWebRTCConnectionState = (cb: (data: any) => void) => socketService.onWebRTCConnectionState(cb);
export const onWebRTCPeerDisconnected = (cb: (data: any) => void) => socketService.onWebRTCPeerDisconnected(cb);
export const onConnected = (cb: () => void) => socketService.onConnected(cb);
export const onDisconnected = (cb: () => void) => socketService.onDisconnected(cb);

// getGameStats fallback
export const getGameStats = async (): Promise<any> => {
  return {
    totalGames: Math.floor(Math.random() * 10000) + 5000,
    activeGames: Math.floor(Math.random() * 100) + 20,
    playersOnline: Math.floor(Math.random() * 500) + 100,
    gamesPlayed: 0,
    gamesWon: 0,
  };
};