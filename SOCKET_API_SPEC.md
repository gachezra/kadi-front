# Socket.io API Specification — NikoKadi Server

**Document Version:** 1.1  
**Last Updated:** December 11, 2025  
**Target Client:** Web-based NikoKadi client (React, Vue, etc.)

This document defines the complete Socket.io event interface between the NikoKadi Node.js/Socket.io backend server and the frontend client. All payloads, responses, and broadcasts are documented here.

---

## Changelog

- v1.1 (2025-12-11):
  - Added `audio` event spec and clarified audio payload formats.
  - Documented `room-users` broadcast is emitted after successful `room:join`.
  - Clarified `game:nikokadi` `targetPlayerId` semantics (optional call variant).
  - Clarified `game:answer-question` `action` field meaning (answer string or answer ID).

---

## Connection & Authentication

**Server URL:** `https://kadi.pexmon.one` (CORS-enabled)

**Socket.io Configuration (Client):**
```js
import io from 'socket.io-client';

const socket = io('https://kadi.pexmon.one', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});
```

**Note:** Authentication is handled via HTTP routes (`/api/users/*`). WebSocket connection itself is unauthenticated; ensure user identity is established before game operations.

---

## Event Patterns

### Emit with Callback (Client → Server → Client)
```js
socket.emit('event:name', payload, (response) => {
  if (response.success) {
    // Handle response.data
  } else {
    // Handle error: response.error
  }
});
```

### Fire-and-Forget Emit (Client → Server)
```js
socket.emit('event:name', payload);
// No callback expected
```

### Broadcast Listen (Server → All Room Clients)
```js
socket.on('event:name', (payload) => {
  // Handle payload
});
```

---

## Client Emit Events (Client → Server)

### ROOM MANAGEMENT

#### `room:create`
**Description:** Create a new game room.

**Payload:**
```ts
{
  numPlayers: number,      // Total players expected (2-4, typically)
  numToDeal: number,       // Cards to deal per player (7, 13, etc.)
  owner: string,           // Owner's user ID
  ownerName: string        // Owner's display name
}
```

**Response:**
```ts
{
  success: boolean,
  data: {
    roomId: string,
    numPlayers: number,
    numToDeal: number,
    owner: string,
    ownerName: string,
    players: any[],
    status: string,        // 'waiting' | 'in-progress' | 'finished'
    ...                     // Other room metadata
  },
  error?: string           // Only if success === false
}
```

---

#### `room:join`
**Description:** Join an existing room.

**Payload:**
```ts
{
  roomId: string,
  userId?: string,         // Player's user ID
  username?: string,       // Player's display name
  roomCode?: string        // Optional room access code
}
```

**Response:**
```ts
{
  success: boolean,
  data: any,               // Room state from controller
  roomUsers: Array<{
    userId: string,
    username: string,
    socketId: string       // Socket.io connection ID
  }>,
  error?: string
}
```

**Server Broadcast (to room):**
- Event: `user-joined`
- Payload:
```ts
{
  username: string,
  userId: string,
  socketId: string,
  timestamp: number        // Unix timestamp (ms)
}
```

**Server Broadcast (to room):**
- Event: `room-users`
- Payload:
```ts
Array<{
  userId: string,
  username: string,
  socketId: string
}>
```

---

#### `room:get-details`
**Description:** Fetch full room details.

**Payload:**
```ts
{
  roomId: string
}
```

**Response:**
This comes out as room.fullRoom & room.clientRoom
```ts
{
  success: boolean,
  data: any,               // Full room object
  error?: string
}
```

---

#### `room:list-available`
**Description:** List all available (open/not-full) rooms.

**Payload:**
```ts
{}
```

**Response:**
```ts
{
  success: boolean,
  data: Array<any>,        // Array of room objects
  error?: string
}
```

---

#### `room:list-by-user`
**Description:** Get all rooms owned/joined by a user.

**Payload:**
```ts
{
  userId: string
}
```

**Response:**
```ts
{
  success: boolean,
  data: Array<any>,        // Array of room objects
  error?: string
}
```

---

#### `room:start-game`
**Description:** Start the game in a room (typically only room owner can do this).

**Payload:**
```ts
{
  roomId: string
}
```

**Response:**
```ts
{
  success: boolean,
  data: any,               // Updated room/game state
  error?: string
}
```

**Server Broadcast (to room):**
- Event: `game:started`
- Payload:
```ts
{
  message: string,         // "Game started"
  room: any                // Initial game state (hands, turn, etc.)
}
```

---

### GAME ACTIONS

#### `game:move`
**Description:** Play a card or perform a turn action.

**Payload:**
```ts
{
  roomId: string,
  userId: string,
  action: string,          // E.g., "play", "pass", "pick-up", "declare"
  cards: any[]             // Cards involved in the move (objects or IDs)
}
```

**Response:**
```ts
{
  success: boolean,
  data: any,               // Updated game state or control response
  error?: string
}
```

**Server Broadcast (to room):**
- Event: `game:state-updated`
- Payload: Full game state snapshot (see below)

---

#### `game:get-data`
**Description:** Fetch current game state (without making a move).

**Payload:**
```ts
{
  roomId: string
}
```

**Response:**
```ts
{
  success: boolean,
  data: {
    roomId: string,
    players: Array<{
      id: string,
      username: string,
      hand?: any[],
      score?: number,
      ...
    }>,
    turnPlayerId: string,
    table: any[],           // Cards on table/play area
    deckCount: number,
    lastMove?: any,
    awaitingAction?: {
      type: string,         // 'pick-suit' | 'answer-question' | 'drop-ace' | etc.
      playerId: string,
      options?: any[],
      question?: string,
      data?: any
    },
    ...                      // Other game metadata
  },
  error?: string
}
```

---

#### `game:nikokadi`
**Description:** Declare "Niko Kadi" (I have the special card) or call another player.

**Payload:**
```ts
{
  roomId: string,
  userId: string,
  targetPlayerId?: string  // Optional: if calling another player
}
```

**Response:**
```ts
{
  success: boolean,
  data: any,               // Updated game state
  error?: string
}
```

**Server Broadcast (to room):**
- Event: `game:state-updated`
- Payload: Full game state snapshot

**Note:** The server accepts an optional `targetPlayerId` when a player "calls" another player. If `targetPlayerId` is present the server may treat the request as a "call" rather than a "declare"; currently the server accepts the field but applies game logic uniformly — front-end should include `targetPlayerId` only when explicitly making a call.

---

#### `game:change-suit`
**Description:** Choose a suit (typically after playing a special card like an Ace or Queen).

**Payload:**
```ts
{
  roomId: string,
  userId: string,
  newSuit: string          // 'hearts' | 'diamonds' | 'clubs' | 'spades'
}
```

**Response:**
```ts
{
  success: boolean,
  data: any,               // Updated game state
  error?: string
}
```

**Server Broadcast (to room):**
- Event: `game:state-updated`
- Payload: Full game state snapshot

---

#### `game:answer-question`
**Description:** Answer a question card (text or selection).

**Payload:**
```ts
{
  roomId: string,
  userId: string,
  cards: any[],            // Cards (if any) associated with answer
  action: string           // The answer string or answer ID
}
```

**Response:**
```ts
{
  success: boolean,
  data: any,               // Updated game state
  error?: string
}
```

**Server Broadcast (to room):**
- Event: `game:state-updated`
- Payload: Full game state snapshot

**Clarification:** The `action` field here carries the player's answer. It can be a free-text answer string or a pre-defined answer ID depending on the UI flow. The server uses this value as the canonical answer payload.

---

#### `game:drop-ace`
**Description:** Drop (play) an ace card(s).

**Payload:**
```ts
{
  roomId: string,
  userId: string,
  drop: any[]              // Array of ace card objects/IDs to drop
}
```

**Response:**
```ts
{
  success: boolean,
  data: any,               // Updated game state
  error?: string
}
```

**Server Broadcast (to room):**
- Event: `game:state-updated`
- Payload: Full game state snapshot

---

#### `game:terminate`
**Description:** Terminate/end the game (usually by room owner).

**Payload:**
```ts
{
  roomId: string,
  userId: string
}
```

**Response:**
```ts
{
  success: boolean,
  data: any,               // Final game state or summary
  error?: string
}
```

**Server Broadcast (to room):**
- Event: `game:terminated`
- Payload:
```ts
{
  message: string,         // "Game terminated"
  winner?: string,
  scores?: any,
  ...
}
```

---

### WEBRTC AUDIO/VIDEO SIGNALING

#### `webrtc:get-peers`
**Description:** Request list of peers (other players in the room).

**Payload:**
```ts
{
  roomId: string
}
```

**Response:**
```ts
{
  success: boolean,
  peers: Array<{
    socketId: string,      // Peer's Socket.io ID
    username: string       // Peer's display name
  }>,
  error?: string
}
```

---

#### `webrtc:offer`
**Description:** Send WebRTC offer (SDP) to a peer.

**Payload:**
```ts
{
  targetSocketId: string,  // Recipient peer's Socket.io ID
  offer: {                 // RTCSessionDescriptionInit
    type: 'offer',
    sdp: string            // SDP string
  },
  mediaType?: string       // Optional: 'audio' | 'video' | 'both' (default: 'both')
}
```

**Response:**
```ts
{
  success: boolean,
  message: string,         // "Offer sent"
  error?: string
}
```

**Server Broadcast (to target peer only):**
- Event: `webrtc:offer-received`
- Payload:
```ts
{
  from: string,            // Sender's Socket.io ID
  fromUsername: string,
  offer: {
    type: 'offer',
    sdp: string
  },
  mediaType: string,
  timestamp: number        // Unix timestamp (ms)
}
```

---

#### `webrtc:answer`
**Description:** Send WebRTC answer (SDP) to a peer.

**Payload:**
```ts
{
  targetSocketId: string,  // Recipient peer's Socket.io ID
  answer: {                // RTCSessionDescriptionInit
    type: 'answer',
    sdp: string            // SDP string
  }
}
```

**Response:**
```ts
{
  success: boolean,
  message: string,         // "Answer sent"
  error?: string
}
```

**Server Broadcast (to target peer only):**
- Event: `webrtc:answer-received`
- Payload:
```ts
{
  from: string,            // Sender's Socket.io ID
  answer: {
    type: 'answer',
    sdp: string
  },
  timestamp: number        // Unix timestamp (ms)
}
```

---

#### `webrtc:ice-candidate`
**Description:** Send ICE candidate for peer connection.

**Payload:**
```ts
{
  targetSocketId: string,  // Recipient peer's Socket.io ID
  candidate: {             // RTCIceCandidate (candidate + sdpMLineIndex + sdpMid)
    candidate: string,     // ICE candidate string
    sdpMLineIndex?: number,
    sdpMid?: string,
    usernameFragment?: string
  }
}
```

**Response:**
```ts
{
  success: boolean,
  message: string,         // "Candidate sent"
  error?: string
}
```

**Server Broadcast (to target peer only):**
- Event: `webrtc:ice-candidate-received`
- Payload:
```ts
{
  from: string,            // Sender's Socket.io ID
  candidate: {
    candidate: string,
    sdpMLineIndex?: number,
    sdpMid?: string,
    usernameFragment?: string
  },
  timestamp: number        // Unix timestamp (ms)
}
```

---

#### `webrtc:connection-state`
**Description:** Report peer connection state changes (for tracking/debugging).

**Payload:**
```ts
{
  targetSocketId: string,  // Peer's Socket.io ID
  state: string            // E.g., 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed'
}
```

**Response:**
```ts
{
  success: boolean,
  error?: string
}
```

**Server Broadcast (to target peer):**
- Event: `webrtc:connection-state-update`
- Payload:
```ts
{
  from: string,            // Sender's Socket.io ID
  state: string,           // Connection state
  timestamp: number        // Unix timestamp (ms)
}
```

---

#### `webrtc:disconnect-peer`
**Description:** Gracefully disconnect from a peer.

**Payload (Fire-and-Forget):**
```ts
{
  targetSocketId: string   // Peer to disconnect from
}
```

**Server Broadcast (to target peer):**
- Event: `webrtc:peer-disconnected`
- Payload:
```ts
{
  from: string,            // Peer who disconnected
  timestamp: number        // Unix timestamp (ms)
}
```

---

### CHAT & MESSAGING

#### `chat:message` (Fire-and-Forget)
**Description:** Send a chat message to the room.

**Payload:**
```ts
{
  content: string,         // Message text
  roomId: string           // Target room
}
```

**No callback expected.**

**Server Broadcast (to room):**
- Event: `chat:message`
- Payload:
```ts
{
  content: string,
  username: string,
  userId: string,
  socketId: string,
  timestamp: number        // Unix timestamp (ms)
}
```

---

### AUDIO STREAM

#### `audio` (Fire-and-Forget)
**Description:** Stream audio data to room (typically used for voice chat or audio pipeline).

**Payload:**
```ts
{
  roomId: string,
  username: string,
  userId: string,
  audio: any               // Audio data (Blob, ArrayBuffer, or base64-encoded string)
}
```

**No callback expected.**

**Server Broadcast (to room):**
- Event: `audio`
- Payload:
```ts
{
  roomId: string,
  username: string,
  userId: string,
  audio: any,              // Prefer ArrayBuffer or Blob for binary; small base64 chunks acceptable.
  timestamp: number        // Unix timestamp (ms)
}
```

**Notes & Best Practices:**
- For binary audio use `ArrayBuffer` or `Blob` and prefer small chunks (e.g., 100-500ms) to avoid large messages and socket backpressure.
- Consider using WebRTC data/audio tracks for real-time voice; `audio` event is suitable for short clips, encoded messages, or server-side processing pipelines.

---

## Server Broadcast Events (Server → Client)

These events are broadcast by the server; clients should register listeners for them.

### Game State & Lifecycle

#### `game:state-updated`
**Broadcast to:** All players in the room.

**Payload (Full Game State):**
```ts
{
  roomId: string,
  players: Array<{
    id: string,
    username: string,
    hand?: any[],          // Cards in hand (may be hidden from other players)
    score?: number,
    status?: string,       // 'active' | 'folded' | 'won' | etc.
    ...
  }>,
  turnPlayerId: string,    // Whose turn it is
  table: any[],            // Cards on the table/play area
  deckCount: number,       // Cards remaining in deck
  lastMove?: {             // Last action taken
    playerId: string,
    action: string,
    cards?: any[],
    timestamp: number
  },
  awaitingAction?: {       // Next required action (if any)
    type: string,          // 'pick-suit' | 'answer-question' | 'drop-ace' | etc.
    playerId: string,      // Who must act
    options?: any[],       // Available choices
    question?: string,     // For 'answer-question' type
    specialCard?: string,  // Reference to the special card
    data?: any             // Additional context
  },
  status: string,          // Room status: 'waiting' | 'in-progress' | 'finished'
  ...                      // Other game metadata
}
```

---

#### `game:started`
**Broadcast to:** All players in the room.

**Payload:**
```ts
{
  message: string,         // "Game started"
  room: {
    // Full initial game state (see game:state-updated)
    players: any[],
    turnPlayerId: string,
    table: any[],
    deckCount: number,
    ...
  }
}
```

---

#### `game:terminated`
**Broadcast to:** All players in the room.

**Payload:**
```ts
{
  message: string,         // "Game terminated"
  winner?: string,         // Winning player ID (if applicable)
  scores?: any,            // Final scores
  ...                      // Other summary info
}
```

---

### Room & User Management

#### `user-joined`
**Broadcast to:** All players in the room.

**Payload:**
```ts
{
  username: string,
  userId: string,
  socketId: string,
  timestamp: number        // Unix timestamp (ms)
}
```

---

#### `user-left`
**Broadcast to:** All remaining players in the room.

**Payload:**
```ts
{
  username: string,
  userId: string,
  socketId: string,
  timestamp: number        // Unix timestamp (ms)
}
```

---

#### `room-users`
**Broadcast to:** All players in the room (after a user joins).

**Payload:**
```ts
Array<{
  userId: string,
  username: string,
  socketId: string
}>
```

---

### Chat & Audio

#### `chat:message`
**Broadcast to:** All players in the room.

**Payload:**
```ts
{
  content: string,
  username: string,
  userId: string,
  socketId: string,
  timestamp: number        // Unix timestamp (ms)
}
```

---

#### `audio`
**Broadcast to:** All players in the room.

**Payload:**
```ts
{
  roomId: string,
  username: string,
  userId: string,
  audio: any,              // Audio data
  timestamp: number        // Unix timestamp (ms)
}
```

---

### WebRTC Signaling

#### `webrtc:offer-received`
**Broadcast to:** Target peer (direct, not room broadcast).

**Payload:**
```ts
{
  from: string,            // Sender's Socket.io ID
  fromUsername: string,
  offer: {
    type: 'offer',
    sdp: string
  },
  mediaType: string,       // 'audio' | 'video' | 'both'
  timestamp: number        // Unix timestamp (ms)
}
```

---

#### `webrtc:answer-received`
**Broadcast to:** Target peer (direct, not room broadcast).

**Payload:**
```ts
{
  from: string,            // Sender's Socket.io ID
  answer: {
    type: 'answer',
    sdp: string
  },
  timestamp: number        // Unix timestamp (ms)
}
```

---

#### `webrtc:ice-candidate-received`
**Broadcast to:** Target peer (direct, not room broadcast).

**Payload:**
```ts
{
  from: string,            // Sender's Socket.io ID
  candidate: {
    candidate: string,
    sdpMLineIndex?: number,
    sdpMid?: string,
    usernameFragment?: string
  },
  timestamp: number        // Unix timestamp (ms)
}
```

---

#### `webrtc:connection-state-update`
**Broadcast to:** Target peer (direct, not room broadcast).

**Payload:**
```ts
{
  from: string,            // Sender's Socket.io ID
  state: string,           // Connection state
  timestamp: number        // Unix timestamp (ms)
}
```

---

#### `webrtc:peer-disconnected`
**Broadcast to:** Target peer(s) (direct, not room broadcast).

**Payload:**
```ts
{
  from: string,            // Peer who disconnected
  reason?: string,         // Optional: e.g., "User disconnected"
  timestamp: number        // Unix timestamp (ms)
}
```

---

## Client Lifecycle Events

These are **not** server broadcasts but rather Socket.io built-in events and client-side wrapper patterns.

```js
// Built-in Socket.io events
socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  // reason: 'io server disconnect' | 'io client disconnect' | 'transport close' | etc.
  console.log('Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

---

## Error Handling

All callback responses follow this pattern:

**Success:**
```ts
{
  success: true,
  data: any,
  roomUsers?: any[]        // Optional, room-specific
}
```

**Failure:**
```ts
{
  success: false,
  error: string            // Human-readable error message
}
```

**Client should:**
1. Always check `response.success` before using `response.data`.
2. If `success === false`, display `response.error` to the user or log it.
3. Implement timeout logic (typically 10-30 seconds) in case the server doesn't respond.

---

## Example Flows

### 1. Create & Join Room, Start Game

```js
// Step 1: Create room
socket.emit('room:create', {
  numPlayers: 3,
  numToDeal: 7,
  owner: 'user123',
  ownerName: 'Alice'
}, (res) => {
  if (res.success) {
    const roomId = res.data.roomId;
    // Step 2: Join the room
    socket.emit('room:join', {
      roomId,
      userId: 'user123',
      username: 'Alice'
    }, (res) => {
      if (res.success) {
        // Wait for other players to join...
        // Listen for user-joined events
      }
    });
  }
});

// Step 3: Once players have joined, owner starts the game
socket.emit('room:start-game', { roomId }, (res) => {
  if (res.success) {
    // Listen for game:started broadcast
  }
});
```

### 2. Play a Card & Handle Game State

```js
socket.on('game:state-updated', (gameState) => {
  // Update UI with new game state
  console.log('Current turn:', gameState.turnPlayerId);
  console.log('Cards on table:', gameState.table);
  
  // If awaiting an action, prompt player
  if (gameState.awaitingAction) {
    if (gameState.awaitingAction.type === 'pick-suit') {
      // Show suit picker UI
    } else if (gameState.awaitingAction.type === 'answer-question') {
      // Show question prompt
    }
  }
});

// Player plays a card
socket.emit('game:move', {
  roomId: 'room123',
  userId: 'user456',
  action: 'play',
  cards: [{ suit: 'hearts', rank: '7' }]
}, (res) => {
  if (res.success) {
    console.log('Move accepted');
    // Wait for game:state-updated to see the result
  }
});
```

### 3. WebRTC Audio Connection

```js
// Get peers in the room
socket.emit('webrtc:get-peers', { roomId }, (res) => {
  if (res.success) {
    const peers = res.peers;
    
    // For each peer, create a peer connection and send offer
    for (const peer of peers) {
      const peerConnection = new RTCPeerConnection();
      
      // Add audio tracks (if user granted permission)
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStream.getTracks().forEach(track => peerConnection.addTrack(track, audioStream));
      
      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      // Send offer to peer
      socket.emit('webrtc:offer', {
        targetSocketId: peer.socketId,
        offer: peerConnection.localDescription,
        mediaType: 'audio'
      }, (res) => {
        if (res.success) {
          console.log('Offer sent to', peer.username);
        }
      });
      
      // Listen for answer
      socket.on('webrtc:answer-received', async (msg) => {
        if (msg.from === peer.socketId) {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(msg.answer));
        }
      });
      
      // Listen for ICE candidates
      socket.on('webrtc:ice-candidate-received', (msg) => {
        if (msg.from === peer.socketId) {
          peerConnection.addIceCandidate(new RTCIceCandidate(msg.candidate));
        }
      });
    }
  }
});
```

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| **Cannot connect** | CORS misconfiguration or wrong server URL | Verify server `origin` in CORS config matches client domain. Check network tab. |
| **Event not received** | Callback not passed or fire-and-forget mismatch | Ensure callback is passed to ack events; ensure non-ack events don't expect callback. |
| **`game:state-updated` not broadcasting** | Client not subscribed or event listener attached late | Attach all event listeners before emitting events. |
| **WebRTC offer rejected** | SDP format invalid or peer not ready | Ensure SDP is a valid string; verify peer connection setup. |
| **Timeout on callback** | Server crashed, event handler error, or network latency | Check server logs; implement client timeout/retry. |

---

## Version Notes

- **Socket.io:** v4.x
- **Node.js:** 14.x or later
- **Last Updated:** December 11, 2025

For updates or clarifications, refer to the backend `app.js` or `DATA_POINTS.md`.
