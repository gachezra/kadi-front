# Data Points — Socket message mapping

This document maps how the client sends and receives data to/from the WebSocket server (via `src/utils/api.ts`). It focuses on message names, payload shapes, expected responses, and the "special action" flows (aces, pick-suit, answer-question, awaiting special actions, declare/call Niko Kadi, drop ace, etc.). This file intentionally ignores authentication and persistence implementation details.

---

## Conventions used by the client (`SocketService.emitWithResponse`)
- Client emits events using `socket.emit(event, payload, callback)` and the helper `emitWithResponse`.
- The helper resolves the server callback. If the server responds with `{ success, data }`, `data` is returned; if `{ success: false, error }` is returned the promise rejects. If no `success` flag exists, the raw response is returned.
- For non-ack emits (fire-and-forget) the client uses plain `socket.emit(event, payload)` (e.g., `chat:message`, `audio`).

---

## Outgoing events (client -> server)
Below are the canonical events the client sends and expected payloads.

- `room:create`
  - Payload: { numPlayers: number, numToDeal: number, owner: string, ownerName: string }
  - Response: server-specific room object or `{ success, data }` wrapper.

- `room:join`
  - Payload: { roomId: string, userId?: string, username?: string, roomCode?: string }
  - Response: room state (players, owner, optional game state) or error.

- `room:get-details`
  - Payload: { roomId: string }
  - Response: full room details.

- `room:list-by-user`
  - Payload: { userId: string }
  - Response: array of rooms for the user.

- `room:list-available`
  - Payload: {}
  - Response: array of available rooms.

- `game:terminate`
  - Payload: { roomId: string, userId: string }
  - Response: confirmation or error.

- `room:start-game`
  - Payload: { roomId: string, userId?: string }
  - Response: confirmation or initial game state.

- `game:get-data`
  - Payload: { roomId: string }
  - Response: current game state.

- `game:move`
  - Payload: { roomId: string, userId: string, action: string, cards: any[] }
  - Response: Usually a small control object; client expects `MakeMoveResponse` shape (see below).
  - Notes: `action` is a domain string (e.g., "play", "pass", "pick-up", etc.) defined by the server.

- `game:nikokadi`
  - Payload (declare): { roomId: string, userId: string }
  - Payload (call): { roomId: string, userId: string, targetPlayerId: string }
  - Response: confirmation or game state update.

- `game:change-suit`
  - Payload: { roomId: string, userId: string, newSuit: string }
  - Response: confirmation and broadcasted game state.

- `game:answer-question`
  - Payload: { roomId: string, userId: string, cards: [], action: string } // `action` holds the answer string
  - Response: confirmation and game state update.

- `game:drop-ace`
  - Payload: { roomId: string, userId: string, drop: any[] }
  - Response: confirmation and updated game state.

- Chat and audio
  - `chat:message` (fire-and-forget)
    - Payload: { content: string, roomId: string }
    - No guaranteed callback; server will broadcast to room.
  - `audio` (binary / blob payload)
    - Payload: { roomId: string, username: string, userId: string, audio: any }

- WebRTC / signaling
  - `webrtc:offer` -> { targetSocketId, offer, mediaType? }
  - `webrtc:answer` -> { targetSocketId, answer }
  - `webrtc:ice-candidate` -> { targetSocketId, candidate }
  - `webrtc:get-peers` -> { roomId } (expects list of peers)

---

## Standard response shape: `MakeMoveResponse` (from client helper)
Declared in the client as:

```ts
interface MakeMoveResponse {
  awaitingSpecialAction?: boolean; // server wants more input from the player
  specialCard?: string | null;    // reference to the special card that triggered the action
  message?: string;               // optional human-readable message
}
```

The server may also reply using `{ success: boolean, data: any }` wrappers. Client helpers will unwrap `data` if `success` is true.

---

## Incoming events (server -> client)
These are the event names the client subscribes to (see `addEventListener` wrappers in `src/utils/api.ts`):

- `game:state-updated`
  - Payload: full game state snapshot.
  - Typical fields (server-defined): {
      roomId, players: [{ id, username, hand?, score? }],
      turnPlayerId, table: any[], deckCount, lastMove?, awaitingAction?: { type, playerId, data? }
    }
  - The `awaitingAction` block (if present) signals the UI which player must respond and what options are available.

- `game:started`
  - Payload: initial game state (hands dealt, first turn, trump/lead info if applicable).

- `game:terminated`
  - Payload: final scores, winner info, and optional summary.

- `user-joined`
  - Payload: { id: string, username?: string }
  - Action: show system message / update player list.

- `user-left`
  - Payload: { id: string, username?: string }

- `chat:message`
  - Payload: { id: string, userId?: string, username?: string, content: string, createdAt?: string, system?: boolean }

- `room-users`
  - Payload: [ { id: string, username?: string } ]

- `audio`
  - Payload: binary payload wrapper { roomId, username, userId, audio }

- WebRTC events
  - `webrtc:offer-received` -> { fromSocketId, offer, mediaType? }
  - `webrtc:answer-received` -> { fromSocketId, answer }
  - `webrtc:ice-candidate-received` -> { fromSocketId, candidate }
  - `webrtc:peer-disconnected` -> { socketId }

- Local socket lifecycle events (client-level wrapper)
  - `socket:connected` (no payload)
  - `socket:disconnected` (no payload)

---

## Special action flows (detailed)
Below are the expected sequences and what the client should do for each "special" action. Since the server is authoritative, the client must follow server prompts (MakeMoveResponse or `game:state-updated` messages).

1) Awaiting Special Action (generic)
- Trigger: client emits `game:move` or another game action and server responds with `MakeMoveResponse.awaitingSpecialAction === true` OR server broadcasts `game:state-updated` containing `awaitingAction` for the current player.
- Client behavior: show a modal / UI prompt to the player describing the required input (choose suit, answer question, select a card, etc.).
- Next client call: depends on `awaitingAction.type` (see examples below). After user input, call the appropriate emit (`game:change-suit`, `game:answer-question`, `game:drop-ace`, or `game:move` with the follow-up action).

2) Pick Suit
- Trigger: a special card requires choosing a suit (or server asks for `change-suit`).
- Server prompt shape (examples):
  - `MakeMoveResponse.awaitingSpecialAction = true` and `specialCard = "ACE_OF_SPADES"` (or similar), OR
  - `game:state-updated` contains `awaitingAction: { type: 'pick-suit', playerId, options: ['hearts','clubs','diamonds','spades'] }`.
- Client call: `game:change-suit(roomId, userId, newSuit)` where `newSuit` is one of the provided options.
- Server response: broadcasts updated `game:state-updated` to all players.

3) Answer Question (question card)
- Trigger: a card requires a text answer or selection.
- Server prompt shape: `awaitingAction: { type: 'answer-question', playerId, question: string, options?: string[] }` or `MakeMoveResponse.awaitingSpecialAction` with `specialCard` indicating the question card.
- Client call: `game:answer-question(roomId, userId, answerString)` (note: client helper sends payload with `action` set to the answer).
- Server: validates answer, updates game state, broadcasts `game:state-updated`.

4) Drop Ace
- Trigger: player must drop an ace (or multiple aces).
- Client call: `game:drop-ace(roomId, userId, cardsArray)` where `cardsArray` contains the ace card objects/ids.
- Server: processes drop and emits updated state.

5) Declare / Call Niko Kadi
- Declare: `game:nikokadi(roomId, userId)` when a player declares they are "Niko Kadi".
- Call: `game:nikokadi(roomId, userId, targetPlayerId)` to call another player.
- Server: verifies and broadcasts result.

6) Generic follow-up moves
- Some server rules require the client to emit additional `game:move` actions after intermediate steps. The server signals these via `awaitingSpecialAction` or `awaitingAction` payloads — client must follow those instructions.

---

## Example payloads
- Client -> server: play a card
```json
{ "roomId": "room123", "userId": "u42", "action": "play", "cards": [ { "suit": "hearts", "rank": "7" } ] }
```

- Server -> client: chat message
```json
{ "id": "m1", "userId": "u42", "username": "alice", "content": "hello", "createdAt": "2025-12-11T12:34:56Z" }
```

- Server -> client: awaiting pick-suit
```json
{
  "awaitingAction": {
    "type": "pick-suit",
    "playerId": "u42",
    "options": ["hearts","clubs","diamonds","spades"],
    "specialCard": "QUEEN_OF_HEARTS"
  }
}
```

- Client -> server: change suit
```json
{ "roomId": "room123", "userId": "u42", "newSuit": "spades" }
```

---

## Error handling and timeouts
- Client `emitWithResponse` uses a 10s timeout. Timeouts throw and should be surfaced to the UI to allow retry.
- Server responses may be `{ success: false, error: 'reason' }` — the client rejects the promise with that error.

---

## Notes & extension points
- The server is authoritative for action strings (the `action` field in `game:move`). If you add new special actions server-side, ensure the server: (1) emits an `awaitingAction` block describing the required client input, and (2) documents the expected client emit name/payload.
- If you prefer structured action types, consider unifying `MakeMoveResponse` with an explicit `awaitingAction` object `{ type: string, metadata?: any }` to avoid guessing from `specialCard`.

---

If you want, I can also:
- generate TypeScript typings for each event payload into `src/types/socket.d.ts`, or
- extract concrete `awaitingAction` examples from the backend (if you can provide server code or docs).

