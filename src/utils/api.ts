import axios from 'axios';
import { API_ROUTES } from './constants';
import { Room, GameStats, GameMove, Card } from '../types';

// Response type for makeMove
export interface MakeMoveResponse {
  awaitingSpecialAction?: boolean;
  specialCard?: string | null;
  message?: string;
}

const api = axios.create({
  timeout: 10000,
});

// Room Management
export const createRoom = async (numPlayers: number, numToDeal: number, userId: string, username: string): Promise<Room> => {
  const response = await api.post(API_ROUTES.createRoom, {
    numPlayers,
    numToDeal,
    owner: userId,
    ownerName: username
  });
  return response.data;
};

export const joinRoom = async (roomId: string, userId: string, username: string, roomCode?: string): Promise<Room> => {
  const response = await api.post(API_ROUTES.joinRoom(roomId), {
    userId,
    username,
    roomCode
  });
  return response.data;
};

export const getRoomDetails = async (roomId: string): Promise<Room> => {
  const response = await api.get(API_ROUTES.getRoomDetails(roomId));
  return response.data;
};

export const getUserRooms = async (userId: string): Promise<Room[]> => {
  const response = await api.get(API_ROUTES.getUserRooms(userId));
  return response.data;
};

export const terminateRoom = async (roomId: string, userId: string): Promise<void> => {
  await api.delete(API_ROUTES.terminateRoom(roomId), {
    data: { userId }
  });
};

// Game Actions
export const startGame = async (roomId: string, userId: string): Promise<void> => {
  await api.post(API_ROUTES.startGame(roomId), { userId });
};

export const getGameData = async (roomId: string): Promise<Room> => {
  const response = await api.get(API_ROUTES.getGameData(roomId));
  return response.data;
};

export const makeMove = async (roomId: string, move: GameMove): Promise<MakeMoveResponse> => {
  const response = await api.post(API_ROUTES.makeMove(roomId), move);
  return response.data;
};

export const declareNikoKadi = async (roomId: string, userId: string): Promise<void> => {
  await api.post(API_ROUTES.nikoKadi(roomId), { userId });
};

export const callNikoKadi = async (roomId: string, userId: string, targetPlayerId: string): Promise<void> => {
  await api.post(API_ROUTES.nikoKadi(roomId), {
    userId,
    targetPlayerId
  });
};

export const changeSuit = async (roomId: string, userId: string, newSuit: string): Promise<void> => {
  await api.post(API_ROUTES.changeSuit(roomId), {
    userId,
    newSuit
  });
};

export const answerQuestion = async (roomId: string, userId: string, answer: string): Promise<void> => {
  await api.post(API_ROUTES.answerQuestion(roomId), {
    userId,
    answer
  });
};

export const dropAce = async (roomId: string, userId: string, cards: Card[]): Promise<void> => {
  await api.post(API_ROUTES.dropAce(roomId), {
    userId,
    cards
  });
};

// Statistics (mock for now)
export const getGameStats = async (): Promise<GameStats> => {
  // In real implementation, this would fetch from API
  return {
    totalGames: Math.floor(Math.random() * 10000) + 5000,
    activeGames: Math.floor(Math.random() * 100) + 20,
    playersOnline: Math.floor(Math.random() * 500) + 100,
    gamesPlayed: 0,
    gamesWon: 0,
  };
};