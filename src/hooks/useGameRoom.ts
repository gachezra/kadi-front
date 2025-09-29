import { useState, useEffect, useCallback } from 'react';
import { Room, Card } from '../types';
import { getRoomDetails, getGameData } from '../utils/api';
import toast from 'react-hot-toast';

type BackendRoomResponse = {
  clientRoom: Room;
  fullRoom?: any;
};

const parseHand = (hand: any[]): Card[] => {
  if (!hand || !Array.isArray(hand)) return [];
  return hand.map(cardString => {
    if (typeof cardString !== 'string' || cardString.length < 2) {
      return { suit: '', value: '' };
    }
    const suit = cardString.slice(-1);
    const value = cardString.slice(0, -1);
    return { suit, value };
  });
};

const processRoomData = (roomData: any): BackendRoomResponse => {
  const clientRoom = roomData.clientRoom || roomData;
  if (clientRoom.playerList && Array.isArray(clientRoom.playerList)) {
    clientRoom.playerList.forEach((player: any) => {
      if (player.hand) {
        player.hand = parseHand(player.hand);
      }
    });
  }
  return { clientRoom, fullRoom: roomData.fullRoom };
}

export const useGameRoom = (roomId: string | undefined) => {
  const [backendRoom, setBackendRoom] = useState<BackendRoomResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoomData = useCallback(async () => {
    if (!roomId) return;
    try {
      setError(null);
      const roomData = await getRoomDetails(roomId);
      setBackendRoom(processRoomData(roomData));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch room data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  const fetchGameData = useCallback(async () => {
    if (!roomId) return;
    try {
      const gameData = await getGameData(roomId);
      setBackendRoom(processRoomData(gameData));
    } catch (err: any) {
      console.error('Failed to fetch game data:', err);
    }
  }, [roomId]);

  useEffect(() => {
    fetchRoomData();
  }, [fetchRoomData]);

  useEffect(() => {
    if (!roomId || backendRoom?.clientRoom?.status !== 'playing') return;
    const interval = setInterval(() => {
      fetchGameData();
    }, 5000);
    return () => clearInterval(interval);
  }, [roomId, backendRoom?.clientRoom?.status, fetchGameData]);

  return {
    room: backendRoom?.clientRoom || null,
    fullRoom: backendRoom?.fullRoom,
    isLoading,
    error,
    refetch: fetchRoomData,
    updateGameState: fetchGameData
  };
};