import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import io from 'socket.io-client';

let socket;

export const connectSocket = createAsyncThunk(
  'chat/connectSocket',
  async (_, { dispatch }) => {
    socket = io('https://niko-kadi.onrender.com'); // Replace with your server URL
    console.log('Socket connected');
    
    socket.on('newMessage', (message) => {
      dispatch(addMessage(message));
    });
    
    socket.on('userJoined', (data) => {
      dispatch(addMessage({ userId: 'System', message: `${data.username} joined the room` }));
    });
    
    socket.on('userLeft', (data) => {
      dispatch(addMessage({ userId: 'System', message: `${data.username} left the room` }));
    });
    
    return true;
  }
);

export const joinRoom = createAsyncThunk(
  'chat/joinRoom',
  async ({ roomId, userId, username }) => {
    socket.emit('joinRoom', { roomId, userId, username });
    return { roomId, userId, username };
  }
);

export const leaveRoom = createAsyncThunk(
  'chat/leaveRoom',
  async ({ roomId, userId, username }) => {
    socket.emit('leaveRoom', { roomId, userId, username });
    return { roomId, userId, username };
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ roomId, userId, message, username }) => {
    socket.emit('sendMessage', { roomId, userId, message, username });
    return { userId, message, username };
  }
);

export const requestPeers = createAsyncThunk(
  'chat/requestPeers',
  async ({ roomId }) => {
    socket.emit('requestPeers', { roomId });
    return new Promise((resolve) => {
      socket.once('peerList', (peerList) => resolve(peerList));
    });
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    connected: false,
    roomId: null,
    userId: null,
    username: null,
    messages: [],
    audioStreams: {},
    peers: [],
    peerConnections: {}, // Changed to an object
  },
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setAudioStream: (state, action) => {
      console.log("Setting audio stream for:", action.payload.userId);
      state.audioStreams[action.payload.userId] = action.payload.stream;
    },
    removeAudioStream: (state, action) => {
      delete state.audioStreams[action.payload];
    },
    addPeerConnection: (state, action) => {
      state.peerConnections[action.payload] = true;
    },
    removePeerConnection: (state, action) => {
      delete state.peerConnections[action.payload];
    },
    setPeers: (state, action) => {
      state.peers = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectSocket.fulfilled, (state) => {
        state.connected = true;
      })
      .addCase(joinRoom.fulfilled, (state, action) => {
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
      .addCase(requestPeers.fulfilled, (state, action) => {
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