import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import io from 'socket.io-client';

let socket;

export const connectSocket = createAsyncThunk('chat/connectSocket', async (_, { dispatch }) => {
  socket = io('https://your-server-url'); // Replace with your server URL
  console.log('Socket connected');

  socket.on('offer', ({ source, sdp }) => {
    dispatch(handleOffer({ source, sdp }));
  });

  socket.on('answer', ({ source, sdp }) => {
    dispatch(handleAnswer({ source, sdp }));
  });

  socket.on('iceCandidate', ({ source, candidate }) => {
    dispatch(handleIceCandidate({ source, candidate }));
  });

  socket.on('peerList', (peerList) => {
    dispatch(setPeers(peerList));
  });

  return true;
});

export const joinRoom = createAsyncThunk('chat/joinRoom', async ({ roomId, userId, username }) => {
  socket.emit('joinRoom', { roomId, userId, username });
  return { roomId, userId, username };
});

export const startAudioStream = createAsyncThunk('chat/startAudioStream', async (_, { dispatch, getState }) => {
  const state = getState().chat;

  // Audio constraints to set bitrate >= 64 kbps
  const audioConstraints = {
    audio: {
      sampleRate: 48000,
      channelCount: 1,
      bitrate: 64000, // Set the minimum bitrate
    },
  };

  const localStream = await navigator.mediaDevices.getUserMedia(audioConstraints);

  dispatch(setAudioStream({ userId: state.userId, stream: localStream }));

  state.peers.forEach((peerId) => {
    const peerConnection = dispatch(createPeerConnection(peerId));
    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));
  });
});

export const createPeerConnection = (peerId) => (dispatch, getState) => {
  const peerConnection = new RTCPeerConnection();

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('iceCandidate', { target: peerId, candidate: event.candidate });
    }
  };

  peerConnection.ontrack = (event) => {
    dispatch(setAudioStream({ userId: peerId, stream: event.streams[0] }));
  };

  peerConnection.createOffer()
    .then((offer) => peerConnection.setLocalDescription(offer))
    .then(() => {
      socket.emit('offer', { target: peerId, sdp: peerConnection.localDescription });
    });

  return peerConnection;
};

export const handleOffer = createAsyncThunk('chat/handleOffer', async ({ source, sdp }, { dispatch, getState }) => {
  const state = getState().chat;
  const peerConnection = dispatch(createPeerConnection(source));

  await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  socket.emit('answer', { target: source, sdp: answer });
});

export const handleAnswer = createAsyncThunk('chat/handleAnswer', async ({ source, sdp }, { getState }) => {
  const state = getState().chat;
  const peerConnection = state.peerConnections[source];
  await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
});

export const handleIceCandidate = createAsyncThunk('chat/handleIceCandidate', async ({ source, candidate }, { getState }) => {
  const state = getState().chat;
  const peerConnection = state.peerConnections[source];
  if (peerConnection) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }
});

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
    peerConnections: {},
  },
  reducers: {
    setAudioStream: (state, action) => {
      state.audioStreams[action.payload.userId] = action.payload.stream;
    },
    setPeers: (state, action) => {
      state.peers = action.payload;
    },
    addPeerConnection: (state, action) => {
      state.peerConnections[action.payload.peerId] = action.payload.peerConnection;
    },
    removeAudioStream: (state, action) => {
      delete state.audioStreams[action.payload];
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
      });
  },
});

export const { setAudioStream, setPeers, addPeerConnection, removeAudioStream } = chatSlice.actions;

export { socket };

export default chatSlice.reducer;
