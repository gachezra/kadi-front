import io, { Socket } from 'socket.io-client';
import { API_BASE_URL } from './constants';

/**
 * Standard Socket.io callback response format per SOCKET_API_SPEC
 */
export interface SocketResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  roomUsers?: any[];
}

export interface MakeMoveResponse extends SocketResponse<any> {}

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private joinRoomAttempts: Map<string, number> = new Map(); // Track join attempts per user
  private joinInProgress: Set<string> = new Set(); // Track in-progress joins

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
          console.log('[SocketService] Connected:', this.socket?.id);
          resolve();
        });

        this.socket.on('error', (err: any) => {
          console.error('[SocketService] error:', err);
        });

        this.socket.on('disconnect', () => {
          console.log('[SocketService] Disconnected');
          this.emitLocalEvent('socket:disconnected');
        });

        this.socket.on('connect_error', (error) => {
          console.error('[SocketService] connect_error:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // ===== ROOM MANAGEMENT =====

  /**
   * room:create - Create a new game room
   */
  createRoom(
    numPlayers: number,
    numToDeal: number,
    owner: string,
    ownerName: string
  ): Promise<any> {
    const payload = { numPlayers, numToDeal, owner, ownerName };
    return this.emitWithResponse('room:create', payload);
  }

  /**
   * room:join - Join an existing room
   */
  joinRoom(
    roomId: string,
    userId: string,
    username: string,
    roomCode?: string
  ): Promise<any> {
    // Input validation
    if (!roomId || !userId || !username) {
      return Promise.reject(new Error('Missing required parameters: roomId, userId, username'));
    }

    if (roomId.trim().length === 0 || userId.trim().length === 0 || username.trim().length === 0) {
      return Promise.reject(new Error('Parameters cannot be empty strings'));
    }

    const joinKey = `${roomId}:${userId}`;

    // Prevent concurrent join requests for the same user-room combo
    if (this.joinInProgress.has(joinKey)) {
      return Promise.reject(new Error('Join request already in progress'));
    }

    // Rate limiting: check if user has attempted to join too many times recently
    const now = Date.now();
    const lastAttempt = this.joinRoomAttempts.get(userId) || 0;
    if (now - lastAttempt < 2000) {
      // Prevent rapid fire join attempts (minimum 2 seconds between attempts)
      return Promise.reject(new Error('Please wait before trying to join another room'));
    }

    this.joinInProgress.add(joinKey);
    this.joinRoomAttempts.set(userId, now);

    const payload = { roomId, userId, username, roomCode };
    return this.emitWithResponse('room:join', payload).finally(() => {
      // Clean up in-progress tracking
      this.joinInProgress.delete(joinKey);
    });
  }

  /**
   * room:get-details - Get full room details
   */
  getRoomDetails(roomId: string): Promise<any> {
    const payload = { roomId };
    return this.emitWithResponse('room:get-details', payload);
  }

  /**
   * room:list-available - List all available rooms
   */
  listAvailableRooms(): Promise<any[]> {
    return this.emitWithResponse('room:list-available', {});
  }

  /**
   * stats:get-game-stats - Get global game statistics
   */
  getGameStats(): Promise<any> {
    return this.emitWithResponse('stats:get-game-stats', {});
  }

  /**
   * room:list-by-user - Get rooms for a user
   */
  getUserRooms(userId: string): Promise<any[]> {
    const payload = { userId };
    return this.emitWithResponse('room:list-by-user', payload);
  }

  /**
   * room:start-game - Start the game
   */
  startGame(roomId: string): Promise<any> {
    const payload = { roomId };
    return this.emitWithResponse('room:start-game', payload);
  }

  // ===== GAME ACTIONS =====

  /**
   * game:move - Play a card or perform a turn action
   */
  makeMove(
    roomId: string,
    userId: string,
    action: string,
    cards: any[] = []
  ): Promise<MakeMoveResponse> {
    const payload = { roomId, userId, action, cards };
    return this.emitWithResponse('game:move', payload);
  }

  /**
   * game:get-data - Fetch current game state
   */
  getGameData(roomId: string): Promise<any> {
    const payload = { roomId };
    return this.emitWithResponse('game:get-data', payload);
  }

  /**
   * game:nikokadi - Declare or call Niko Kadi
   */
  nikoKadi(roomId: string, userId: string, targetPlayerId?: string): Promise<any> {
    const payload: any = { roomId, userId };
    if (targetPlayerId) payload.targetPlayerId = targetPlayerId;
    return this.emitWithResponse('game:nikokadi', payload);
  }

  /**
   * game:change-suit - Change the suit
   */
  changeSuit(roomId: string, userId: string, newSuit: string): Promise<any> {
    const payload = { roomId, userId, newSuit };
    return this.emitWithResponse('game:change-suit', payload);
  }

  /**
   * game:answer-question - Answer a question card
   */
  answerQuestion(roomId: string, userId: string, answer: string): Promise<any> {
    const payload = { roomId, userId, cards: [], action: answer };
    return this.emitWithResponse('game:answer-question', payload);
  }

  /**
   * game:drop-ace - Drop an ace
   */
  dropAce(roomId: string, userId: string, drop: any): Promise<any> {
    const payload = { roomId, userId, drop };
    return this.emitWithResponse('game:drop-ace', payload);
  }

  /**
   * game:terminate - Terminate the game
   */
  terminateRoom(roomId: string, userId: string): Promise<any> {
    const payload = { roomId, userId };
    return this.emitWithResponse('game:terminate', payload);
  }

  // ===== CHAT & AUDIO =====

  /**
   * chat:message - Send a chat message (fire-and-forget)
   */
  sendMessage(content: string, roomId: string, userId?: string, username?: string): void {
    if (!this.socket?.connected) {
      console.warn('[SocketService] Socket not connected for chat');
      return;
    }
    this.socket.emit('chat:message', { content, roomId, userId, username });
  }

  /**
   * audio - Send audio stream (fire-and-forget)
   */
  sendAudio(roomId: string, username: string, userId: string, audio: any): void {
    if (!this.socket?.connected) {
      console.warn('[SocketService] Socket not connected for audio');
      return;
    }
    this.socket.emit('audio', { roomId, username, userId, audio });
  }

  // ===== WEBRTC SIGNALING =====

  /**
   * webrtc:get-peers - Get list of peers in a room
   */
  getPeers(roomId: string): Promise<any> {
    const payload = { roomId };
    return this.emitWithResponse('webrtc:get-peers', payload);
  }

  /**
   * webrtc:offer - Send WebRTC offer
   */
  sendOffer(targetSocketId: string, offer: any, mediaType?: string): Promise<any> {
    const payload = { targetSocketId, offer, mediaType };
    return this.emitWithResponse('webrtc:offer', payload);
  }

  /**
   * webrtc:answer - Send WebRTC answer
   */
  sendAnswer(targetSocketId: string, answer: any): Promise<any> {
    const payload = { targetSocketId, answer };
    return this.emitWithResponse('webrtc:answer', payload);
  }

  /**
   * webrtc:ice-candidate - Send ICE candidate
   */
  sendIceCandidate(targetSocketId: string, candidate: any): Promise<any> {
    const payload = { targetSocketId, candidate };
    return this.emitWithResponse('webrtc:ice-candidate', payload);
  }

  /**
   * webrtc:connection-state - Report connection state
   */
  sendConnectionState(targetSocketId: string, state: string): Promise<any> {
    const payload = { targetSocketId, state };
    return this.emitWithResponse('webrtc:connection-state', payload);
  }

  /**
   * webrtc:disconnect-peer - Gracefully disconnect from peer (fire-and-forget)
   */
  disconnectPeer(targetSocketId: string): void {
    if (!this.socket?.connected) {
      console.warn('[SocketService] Socket not connected for peer disconnect');
      return;
    }
    this.socket.emit('webrtc:disconnect-peer', { targetSocketId });
  }

  // ===== EVENT LISTENERS =====

  onGameStateUpdated(callback: (data: any) => void): () => void {
    return this.addEventListener('game:state-updated', callback);
  }

  onGameStarted(callback: (data: any) => void): () => void {
    return this.addEventListener('game:started', callback);
  }

  onGameTerminated(callback: (data: any) => void): () => void {
    return this.addEventListener('game:terminated', callback);
  }

  onUserJoined(callback: (data: any) => void): () => void {
    return this.addEventListener('user-joined', callback);
  }

  onUserLeft(callback: (data: any) => void): () => void {
    return this.addEventListener('user-left', callback);
  }

  onRoomUsers(callback: (data: any) => void): () => void {
    return this.addEventListener('room-users', callback);
  }

  onChatMessage(callback: (data: any) => void): () => void {
    return this.addEventListener('chat:message', callback);
  }

  onAudio(callback: (data: any) => void): () => void {
    return this.addEventListener('audio', callback);
  }

  onWebRTCOfferReceived(callback: (data: any) => void): () => void {
    return this.addEventListener('webrtc:offer-received', callback);
  }

  onWebRTCAnswerReceived(callback: (data: any) => void): () => void {
    return this.addEventListener('webrtc:answer-received', callback);
  }

  onWebRTCIceCandidateReceived(callback: (data: any) => void): () => void {
    return this.addEventListener('webrtc:ice-candidate-received', callback);
  }

  onWebRTCConnectionState(callback: (data: any) => void): () => void {
    return this.addEventListener('webrtc:connection-state-update', callback);
  }

  onWebRTCPeerDisconnected(callback: (data: any) => void): () => void {
    return this.addEventListener('webrtc:peer-disconnected', callback);
  }

  onConnected(callback: () => void): () => void {
    return this.addEventListener('socket:connected', callback);
  }

  onDisconnected(callback: () => void): () => void {
    return this.addEventListener('socket:disconnected', callback);
  }

  getRawSocket(): Socket | null {
    return this.socket;
  }

  // ===== PRIVATE HELPERS =====

  private emitWithResponse(event: string, payload: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.socket?.connected) {
          console.log(`[SocketService] Socket not connected, attempting auto-connect for '${event}'`);
          try {
            await this.connect();
          } catch (connErr) {
            console.error('[SocketService] Auto-connect failed:', connErr);
            reject(new Error('Socket not connected'));
            return;
          }
        }

        const timeout = setTimeout(() => {
          reject(new Error(`${event} timed out after 10s`));
        }, 10000);

        this.socket!.emit(event, payload, (response: any) => {
          clearTimeout(timeout);
          console.log(`[SocketService] ${event} response:`, response);

          if (response && typeof response === 'object' && 'success' in response) {
            if (response.success) {
              // Return data if present, otherwise return the whole response
              resolve(response.data !== undefined ? response.data : response);
            } else {
              reject(new Error(response.error || 'Unknown error'));
            }
          } else {
            // No explicit success flag — resolve with raw response
            resolve(response);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  private addEventListener(event: string, callback: Function): () => void {
    if (!this.socket) {
      console.warn(`[SocketService] Socket not initialized for event: ${event}`);
      return () => {};
    }

    this.socket.on(event, callback as any);

    return () => {
      this.socket?.off(event, callback as any);
    };
  }

  private emitLocalEvent(event: string): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => cb());
    }
  }
}

// Singleton instance
export const socketService = new SocketService();

// Convenience wrappers
export const connectSocketService = (url?: string) => socketService.connect(url);
export const disconnectSocketService = () => socketService.disconnect();
export const isSocketConnected = () => socketService.isConnected();

// Room management
export const createRoom = (numPlayers: number, numToDeal: number, owner: string, ownerName: string) =>
  socketService.createRoom(numPlayers, numToDeal, owner, ownerName);
export const joinRoom = (roomId: string, userId: string, username: string, roomCode?: string) =>
  socketService.joinRoom(roomId, userId, username, roomCode);
export const getRoomDetails = (roomId: string) => socketService.getRoomDetails(roomId);
export const getUserRooms = (userId: string) => socketService.getUserRooms(userId);
export const listAvailableRooms = () => socketService.listAvailableRooms();
export const getGameStats = () => socketService.getGameStats();
export const startGame = (roomId: string) => socketService.startGame(roomId);

// Game actions
export const makeMove = (roomId: string, userId: string, action: string, cards?: any[]) =>
  socketService.makeMove(roomId, userId, action, cards);
export const getGameData = (roomId: string) => socketService.getGameData(roomId);
export const nikoKadi = (roomId: string, userId: string, targetPlayerId?: string) =>
  socketService.nikoKadi(roomId, userId, targetPlayerId);
export const changeSuit = (roomId: string, userId: string, newSuit: string) =>
  socketService.changeSuit(roomId, userId, newSuit);
export const answerQuestion = (roomId: string, userId: string, answer: string) =>
  socketService.answerQuestion(roomId, userId, answer);
export const dropAce = (roomId: string, userId: string, drop: any) =>
  socketService.dropAce(roomId, userId, drop);
export const terminateRoom = (roomId: string, userId: string) =>
  socketService.terminateRoom(roomId, userId);

// Chat & audio
export const sendMessage = (content: string, roomId: string, userId?: string, username?: string) =>
  socketService.sendMessage(content, roomId, userId, username);
export const sendAudio = (roomId: string, username: string, userId: string, audio: any) =>
  socketService.sendAudio(roomId, username, userId, audio);

// WebRTC
export const getPeers = (roomId: string) => socketService.getPeers(roomId);
export const sendOffer = (targetSocketId: string, offer: any, mediaType?: string) =>
  socketService.sendOffer(targetSocketId, offer, mediaType);
export const sendAnswer = (targetSocketId: string, answer: any) =>
  socketService.sendAnswer(targetSocketId, answer);
export const sendIceCandidate = (targetSocketId: string, candidate: any) =>
  socketService.sendIceCandidate(targetSocketId, candidate);
export const sendConnectionState = (targetSocketId: string, state: string) =>
  socketService.sendConnectionState(targetSocketId, state);
export const disconnectPeer = (targetSocketId: string) =>
  socketService.disconnectPeer(targetSocketId);

// Listeners
export const onGameStateUpdated = (cb: (data: any) => void) => socketService.onGameStateUpdated(cb);
export const onGameStarted = (cb: (data: any) => void) => socketService.onGameStarted(cb);
export const onGameTerminated = (cb: (data: any) => void) => socketService.onGameTerminated(cb);
export const onUserJoined = (cb: (data: any) => void) => socketService.onUserJoined(cb);
export const onUserLeft = (cb: (data: any) => void) => socketService.onUserLeft(cb);
export const onRoomUsers = (cb: (data: any) => void) => socketService.onRoomUsers(cb);
export const onChatMessage = (cb: (data: any) => void) => socketService.onChatMessage(cb);
export const onAudio = (cb: (data: any) => void) => socketService.onAudio(cb);
export const onWebRTCOfferReceived = (cb: (data: any) => void) => socketService.onWebRTCOfferReceived(cb);
export const onWebRTCAnswerReceived = (cb: (data: any) => void) => socketService.onWebRTCAnswerReceived(cb);
export const onWebRTCIceCandidateReceived = (cb: (data: any) => void) => socketService.onWebRTCIceCandidateReceived(cb);
export const onWebRTCConnectionState = (cb: (data: any) => void) => socketService.onWebRTCConnectionState(cb);
export const onWebRTCPeerDisconnected = (cb: (data: any) => void) => socketService.onWebRTCPeerDisconnected(cb);
export const onConnected = (cb: () => void) => socketService.onConnected(cb);
export const onDisconnected = (cb: () => void) => socketService.onDisconnected(cb);
export const getRawSocket = () => socketService.getRawSocket();
