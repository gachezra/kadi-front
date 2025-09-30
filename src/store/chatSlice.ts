import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import io, { Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { ChatMessage } from '../types';

// --- Type Definitions ---
interface UserData {
  userId: string;
  username: string;
}

interface JoinRoomPayload {
  roomId: string;
  userId: string;
  username: string;
}

interface SendMessagePayload extends JoinRoomPayload {
    message: string;
}

interface RequestPeersPayload {
  roomId: string;
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
  peers: string[];
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
  async (_, { dispatch }) => {
    socket = io('https://niko-kadi.onrender.com');
    // console.log('Socket connected');

    socket.on('message', (message: ChatMessage) => {
      dispatch(addMessage(message));
    });

    socket.on('userJoined', (data: UserData) => {
      dispatch(addMessage({ userId: 'System', username: 'System', message: `${data.username} joined the room` }));
    });

    socket.on('userLeft', (data: UserData) => {
      dispatch(addMessage({ userId: 'System', username: 'System', message: `${data.username} left the room` }));
    });

    return true;
  }
);

export const joinRoom = createAsyncThunk(
  'chat/joinRoom',
  async (payload: JoinRoomPayload) => {
    socket.emit('joinRoom', payload);
    return payload;
  }
);

export const leaveRoom = createAsyncThunk(
  'chat/leaveRoom',
  async (payload: JoinRoomPayload) => {
    socket.emit('leaveRoom', payload);
    return payload;
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (payload: SendMessagePayload) => {
    socket.emit('sendMessage', payload);
    return { userId: payload.userId, username: payload.username, message: payload.message };
  }
);

export const requestPeers = createAsyncThunk<string[], RequestPeersPayload>(
  'chat/requestPeers',
  async (payload) => {
    socket.emit('requestPeers', payload);
    return new Promise((resolve) => {
      socket.once('peerList', (peerList: string[]) => resolve(peerList));
    });
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
    setPeers: (state, action: PayloadAction<string[]>) => {
      state.peers = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectSocket.fulfilled, (state) => {
        state.connected = true;
      })
      .addCase(joinRoom.fulfilled, (state, action: PayloadAction<JoinRoomPayload>) => {
        state.roomId = action.payload.roomId;
        state.userId = action.payload.userId;
        state.username = action.payload.username;
      })
      .addCase(leaveRoom.fulfilled, (state) => {
        state.roomId = null;
        state.userId = null;
        state.username = null;
        state.messages = [];
        state.audioStreams = {};
        state.peers = [];
        state.peerConnections = {};
      })
      .addCase(sendMessage.fulfilled, (state, action: PayloadAction<ChatMessage>) => {
        state.messages.push(action.payload);
      })
      .addCase(requestPeers.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.peers = action.payload;
      });
  },
});

export const {
  addMessage,
  setAudioStream,
  removeAudioStream,
  addPeerConnection,
  removePeerConnection,
  setPeers
} = chatSlice.actions;

export { socket };

export default chatSlice.reducer;
