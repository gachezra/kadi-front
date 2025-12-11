# WebSocket Client Implementation - Quick Reference

## 1. Basic Setup (In your App.tsx or main component)

```typescript
import { socketService } from './services/socketService';
import { useEffect } from 'react';

export function App() {
  useEffect(() => {
    // Connect to WebSocket server
    socketService.connect('https://your-server-url.com');

    // Set up real-time listeners
    const unsubGameState = socketService.onGameStateUpdated((data) => {
      console.log('Game state updated:', data);
      // Update your state management
      updateGameState(data);
    });

    const unsubGameStart = socketService.onGameStarted((data) => {
      console.log('Game started:', data);
      startGameUI(data);
    });

    const unsubUserJoined = socketService.onUserJoined((data) => {
      console.log('User joined:', data);
      addPlayerToList(data);
    });

    // Cleanup listeners on unmount
    return () => {
      unsubGameState();
      unsubGameStart();
      unsubUserJoined();
      socketService.disconnect();
    };
  }, []);

  return <YourApp />;
}
```

---

## 2. Creating a Room

```typescript
const handleCreateRoom = async () => {
  try {
    const room = await socketService.createRoom(
      4,           // numPlayers
      5,           // numToDeal
      userId,      // owner userId
      username     // owner username
    );
    
    console.log('Room created:', room);
    navigate(`/game/${room.roomId}`);
  } catch (error) {
    console.error('Failed to create room:', error);
    showErrorToast(error.message);
  }
};
```

---

## 3. Joining a Room

```typescript
const handleJoinRoom = async (roomId: string, roomCode?: string) => {
  try {
    const room = await socketService.joinRoom(
      roomId,
      userId,
      username,
      roomCode
    );
    
    console.log('Joined room:', room);
    setCurrentRoom(room);
  } catch (error) {
    console.error('Failed to join room:', error);
    if (error.message === 'Room is full') {
      showErrorToast('This room is full');
    }
  }
};
```

---

## 4. Making a Move During Game

```typescript
const handleMakeMove = async (roomId: string, action: string, cards: Card[]) => {
  try {
    const response = await socketService.makeMove(
      roomId,
      userId,
      action,
      cards
    );
    
    // Check if special action is required
    if (response.awaitingSpecialAction) {
      showSpecialActionUI(response.specialCard);
    }
    
    // Game state will be updated automatically via 'game:state-updated' event
    Replace file with updated consolidated quick reference including all socket emits and troubleshooting steps.
const handleOfferPeer = async (targetPeerId: string, offer: RTCSessionDescription) => {
  socketService.sendOffer(targetPeerId, offer);
};

// Listen for offers
useEffect(() => {
  const unsubOffer = socketService.onWebRTCOffer(({ offer, from }) => {
    handleIncomingOffer(offer, from);
  });

  const unsubAnswer = socketService.onWebRTCAnswer(({ answer, from }) => {
    handleIncomingAnswer(answer, from);
  });

  const unsubIce = socketService.onWebRTCIceCandidate(({ candidate, from }) => {
    addIceCandidate(candidate, from);
  });

  return () => {
    unsubOffer();
    unsubAnswer();
    unsubIce();
  };
}, []);
```

---

## 12. Error Handling Best Practices

```typescript
const handleGameAction = async (actionFn: () => Promise<any>) => {
  try {
    if (!socketService.isConnected()) {
      throw new Error('Not connected to server');
    }

    const result = await actionFn();
    showSuccessToast('Action completed');
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('timed out')) {
      showErrorToast('Request timed out. Please check your connection.');
    } else if (errorMessage.includes('Socket not connected')) {
      showErrorToast('Lost connection to server. Reconnecting...');
    } else {
      showErrorToast(errorMessage);
    }
    
    throw error;
  }
};
```

---

## 13. React Hook for Socket Service

```typescript
// Create a custom hook for easier usage
export function useSocketService() {
  useEffect(() => {
    socketService.connect();
    
    return () => {
      socketService.disconnect();
    };
  }, []);

  return socketService;
}

// Usage in component
function GameComponent() {
  const socket = useSocketService();
  
  const handleMove = async () => {
    const result = await socket.makeMove(...);
  };
}
```

---

## 14. State Management Integration (Redux Example)

```typescript
import { useDispatch } from 'react-redux';

function GameRoom({ roomId }) {
  const dispatch = useDispatch();

  useEffect(() => {
    socketService.onGameStateUpdated((data) => {
      // Dispatch Redux action
      dispatch(updateGameState(data));
    });

    socketService.onUserJoined((data) => {
      dispatch(addPlayerToRoom(data));
    });

    socketService.onUserLeft((data) => {
      dispatch(removePlayerFromRoom(data));
    });
  }, [dispatch]);

  return <GameUI />;
}
```

---

## 15. Common Pitfalls to Avoid

❌ **Don't**
```typescript
// Don't call socket methods before connecting
socketService.makeMove(...);

// Don't forget to unsubscribe from listeners
socketService.onGameStateUpdated((data) => {
  setGameState(data);
});

// Don't assume socket is always connected
socketService.sendMessage(...);
```

✅ **Do**
```typescript
// Wait for connection
await socketService.connect();
await socketService.makeMove(...);

// Always unsubscribe
const unsub = socketService.onGameStateUpdated((data) => {
  setGameState(data);
});
return unsub;

// Check connection status
if (socketService.isConnected()) {
  socketService.sendMessage(...);
}
```

---

## 16. TypeScript Types (Add to your types file)

```typescript
export interface SocketResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface GameStateUpdate {
  roomId: string;
  players: Player[];
  currentTurn: string;
  gameState: any;
  specialCard?: string;
}

export interface UserJoinedEvent {
  username: string;
  userId: string;
  socketId: string;
  timestamp: number;
}

export interface ChatMessage {
  content: string;
  username: string;
  userId: string;
  socketId: string;
  timestamp: number;
}
```

---

## Summary

**Key Points:**
- ✅ All methods return Promises (same as HTTP)
- ✅ Automatic reconnection built-in
- ✅ Listeners for real-time updates
- ✅ Connection state checking
- ✅ Timeout protection (10 seconds)
- ✅ Error handling with detailed messages
- ⚡ Much faster than HTTP polling
