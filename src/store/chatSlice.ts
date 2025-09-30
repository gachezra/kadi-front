import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import io, { Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { ChatMessage, User } from '../types';

// --- Type Definitions ---

interface JoinRoomPayload {
  roomId: string;
  userId: string;
  username: string;
}

interface SendMessagePayload {
    roomId: string;
    userId: string;
    username: string;
    message: string;
}

interface SetAudioStreamPayload {
  userId: string;
  stream: MediaStream;
}

interface ChatState {
  connected: boolean;
  roomId: string | null;
  userId: string | null;
  username: string | null;
  messages: ChatMessage[];
  audioStreams: { [key: string]: MediaStream };
  peers: User[];
  peerConnections: { [key: string]: boolean };
}

// --- Initial State ---
const initialState: ChatState = {
  connected: false,
  roomId: null,
  userId: null,
  username: null,
  messages: [],
  audioStreams: {},
  peers: [],
  peerConnections: {},
};

let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

// --- Async Thunks ---
export const connectSocket = createAsyncThunk(
  'chat/connectSocket',
  async (payload: { username: string, roomId: string }, { dispatch }) => {
    socket = io('https://niko-kadi.onrender.com');
    console.log('Socket connecting...');

    socket.on('connect', () => {
      console.log('Socket connected, joining room...');
      socket.emit('join', { username: payload.username, room: payload.roomId });
    });

    socket.on('message', (message: ChatMessage) => {
      dispatch(addMessage(message));
    });

    socket.on('user-joined', (data: { username: string, userId: string }) => {
      dispatch(addMessage({ userId: 'System', username: 'System', message: `${data.username} joined the room` }));
    });

    socket.on('user-left', (data: { username: string, userId: string }) => {
      dispatch(addMessage({ userId: 'System', username: 'System', message: `${data.username} left the room` }));
    });

    socket.on('room-users', (users: User[]) => {
        dispatch(setPeers(users));
    });

    return true;
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (payload: SendMessagePayload) => {
    socket.emit('message', { 
        room: payload.roomId, 
        content: payload.message 
    });
    // Return the message for optimistic update
    return { userId: payload.userId, username: payload.username, message: payload.message, content: payload.message, timestamp: Date.now() };
  }
);


// --- Slice Definition ---
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    setAudioStream: (state, action: PayloadAction<SetAudioStreamPayload>) => {
      console.log("Setting audio stream for:", action.payload.userId);
      state.audioStreams[action.payload.userId] = action.payload.stream;
    },
    removeAudioStream: (state, action: PayloadAction<string>) => {
      delete state.audioStreams[action.payload];
    },
    addPeerConnection: (state, action: PayloadAction<string>) => {
      state.peerConnections[action.payload] = true;
    },
    removePeerConnection: (state, action: PayloadAction<string>) => {
      delete state.peerConnections[action.payload];
    },
    setPeers: (state, action: PayloadAction<User[]>) => {
        state.peers = action.payload;
    },
    disconnectSocket: (state) => {
        if(socket) {
            socket.disconnect();
        }
        return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectSocket.fulfilled, (state, action) => {
        state.connected = true;
        // @ts-ignore
        state.roomId = action.meta.arg.roomId;
        // @ts-ignore
        state.username = action.meta.arg.username;
      })
      .addCase(sendMessage.fulfilled, (state, action: PayloadAction<ChatMessage>) => {
        state.messages.push(action.payload);
      });
  },
});

export const {
  addMessage,
  setAudioStream,
  removeAudioStream,
  addPeerConnection,
  removePeerConnection,
  setPeers,
  disconnectSocket
} = chatSlice.actions;

export { socket };

export default chatSlice.reducer;
