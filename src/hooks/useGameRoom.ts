import { useState, useEffect, useCallback, useRef } from 'react';
import { Room, Card } from '../types';
import { getRoomDetails, getGameData, connectSocketService, socketService, joinRoom as socketJoinRoom } from '../utils/api';
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
  if (!roomData) {
    console.warn('[useGameRoom] processRoomData called with empty roomData');
    return { clientRoom: null as any, fullRoom: null };
  }

  // If server returns a wrapper like { success: true, data: { ... } }
  if (roomData && typeof roomData === 'object' && 'data' in roomData && roomData.data) {
    roomData = roomData.data;
  }

  const clientRoom = roomData.clientRoom || roomData || null;
  if (clientRoom && clientRoom.playerList && Array.isArray(clientRoom.playerList)) {
    clientRoom.playerList.forEach((player: any) => {
      if (player.hand) {
        player.hand = parseHand(player.hand);
      }
    });
  }

  return { clientRoom, fullRoom: roomData.fullRoom ?? roomData };
}

export const useGameRoom = (roomId: string | undefined, user?: { id: string; username: string } | null) => {
  const [backendRoom, setBackendRoom] = useState<BackendRoomResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchInProgressRef = useRef(false);

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
    // Prevent concurrent requests to avoid thrashing
    if (fetchInProgressRef.current) {
      console.log('[useGameRoom] Fetch already in progress, skipping');
      return;
    }
    
    fetchInProgressRef.current = true;
    try {
      const gameData = await getGameData(roomId);
      const processed = processRoomData(gameData);
      // Only update if the room data looks valid (has roomId and owner)
      if (processed.clientRoom && processed.clientRoom.roomId && processed.clientRoom.owner) {
        setBackendRoom(processed);
      } else {
        console.warn('[useGameRoom] Ignoring invalid gameData response:', gameData);
      }
    } catch (err: any) {
      console.error('Failed to fetch game data:', err);
    } finally {
      fetchInProgressRef.current = false;
    }
  }, [roomId]);

  useEffect(() => {
    fetchRoomData();
  }, [fetchRoomData]);

  // Subscribe to server-push game updates via socketService
  useEffect(() => {
    if (!roomId) return;

    let unsub: (() => void) | null = null;

    const setupSocket = async () => {
      try {
        await connectSocketService();

        // If we have a user, ensure we join the room so server will broadcast updates to us
        if (user?.id && user?.username) {
          try {
            await socketJoinRoom(roomId, user.id, user.username);
          } catch (e) {
            // non-fatal; we may still receive broadcasts depending on server
            console.warn('Failed to join room via socketService:', e);
          }
        }

        unsub = socketService.onGameStateUpdated((data: any) => {
          try {
            const processed = processRoomData(data);
            // Only update when processed data contains a valid clientRoom
            if (processed.clientRoom && processed.clientRoom.roomId && processed.clientRoom.owner) {
              setBackendRoom(processed);
            } else {
              console.warn('[useGameRoom] Ignoring invalid game state update from socket:', data);
            }
          } catch (err) {
            console.error('Error processing game state update:', err);
          }
        });
      } catch (err) {
        console.warn('SocketService connect failed:', err);
      }
    };

    setupSocket();

    return () => {
      if (unsub) unsub();
    };
  }, [roomId, user]);

  // Polling is handled by GameRoomPage via updateGameState (fetchGameData)
  // No need for duplicate polling here

  return {
    room: backendRoom?.clientRoom || null,
    fullRoom: backendRoom?.fullRoom,
    isLoading,
    error,
    refetch: fetchRoomData,
    updateGameState: fetchGameData
  };
};