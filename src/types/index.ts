export interface Card {
  suit: string;
  value: string;
}

export interface Player {
  userId: string;
  username: string;
  hand: Card[];
}

export interface GameMove {
  action: 'drop' | 'pick';
  userId: string;
  cards?: string[];
  answer?: string;
  newSuit?: string;
}

export interface Room {
  roomId: string;
  roomCode: string;
  owner: string;
  ownerName: string;
  numPlayers: number;
  numToDeal: number;
  playerList: Player[];
  currentPlayer: number;
  gameDirection: 'forward' | 'backward';
  topCard: string;
  stack: string[];
  deckCount?: number;
  winner?: string | null;
  createdAt: string;
  lastActiveAt: string;
  isCard: string[];
  isTerminated: boolean;
  terminatedAt: string | null;
  awaitingSpecialAction: null | string;
  currentSuit: string | null;
  feedingCount: number;
  playerCardsDropped: Record<string, string[]>;
  playerTotalCardsDropped: Record<string, number>;
  skipCount: number;
  specialCard: string | null;
  status?: 'waiting' | 'playing' | 'finished';
}

export interface GameStats {
  totalGames: number;
  activeGames: number;
  playersOnline: number;
  gamesPlayed: number;
  gamesWon: number;
}

export interface ChatMessage {
  userId: string;
  username: string;
  content: string; 
  timestamp: number;
}

export interface User {
  id: string;
  userId: string;
  username: string;
}