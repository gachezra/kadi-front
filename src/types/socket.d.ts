// Socket payload and event types used by the client

export interface RoomCreatePayload {
  numPlayers: number;
  numToDeal: number;
  owner: string;
  ownerName: string;
}

export interface RoomJoinPayload {
  roomId: string;
  userId?: string;
  username?: string;
  roomCode?: string;
}

export interface RoomSummary {
  roomId: string;
  numPlayers: number;
  numToDeal: number;
  owner: string;
  ownerName: string;
  players?: Array<{ id: string; username?: string; socketId?: string }>;
  status?: 'waiting' | 'in-progress' | 'finished';
}

export interface ChatMessage {
  id?: string;
  userId?: string;
  username?: string;
  content: string;
  createdAt?: string | number;
  system?: boolean;
}

export interface AudioPayload {
  roomId: string;
  username: string;
  userId: string;
  audio: any;
  timestamp?: number;
}

export interface GameMovePayload {
  roomId: string;
  userId: string;
  action: string;
  cards: any[];
}

export interface MakeMoveResponse {
  awaitingSpecialAction?: boolean;
  specialCard?: string | null;
  message?: string;
}

export type AwaitingActionType = 'pick-suit' | 'answer-question' | 'drop-ace' | string;

export interface AwaitingAction {
  type: AwaitingActionType;
  playerId: string;
  options?: any[];
  question?: string;
  specialCard?: string;
  data?: any;
}

export interface LastMove {
  playerId: string;
  action: string;
  cards?: any[];
  timestamp?: number;
}

export interface PlayerState {
  id: string;
  username: string;
  hand?: any[];
  score?: number;
  status?: string;
}

export interface GameState {
  roomId: string;
  players: PlayerState[];
  turnPlayerId: string;
  table: any[];
  deckCount: number;
  lastMove?: LastMove;
  awaitingAction?: AwaitingAction;
  status?: 'waiting' | 'in-progress' | 'finished';
  [key: string]: any;
}

// WebRTC types
export interface WebRTCPeerInfo {
  socketId: string;
  username?: string;
}

export interface WebRTCOfferPayload {
  targetSocketId: string;
  offer: any; // RTCSessionDescriptionInit
  mediaType?: 'audio' | 'video' | 'both';
}

export interface WebRTCAnswerPayload {
  targetSocketId: string;
  answer: any; // RTCSessionDescriptionInit
}

export interface WebRTCIceCandidatePayload {
  targetSocketId: string;
  candidate: any; // RTCIceCandidateInit
}

export interface ConnectionStatePayload {
  targetSocketId: string;
  state: string;
}

export interface DisconnectPeerPayload {
  targetSocketId: string;
}

export interface RoomUsersEntry {
  userId: string;
  username: string;
  socketId: string;
}

export interface RoomUsersBroadcast extends Array<RoomUsersEntry> {}

export interface UserJoinedPayload {
  username: string;
  userId: string;
  socketId: string;
  timestamp: number;
}

export interface UserLeftPayload {
  username: string;
  userId: string;
  socketId: string;
  timestamp: number;
}

// Generic server ack wrapper
export interface ServerAck<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  roomUsers?: RoomUsersBroadcast;
}
