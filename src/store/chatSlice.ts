import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';
import {
  connectSocketService,
  disconnectSocketService,
  joinRoom as apiJoinRoom,
  sendMessage as apiSendMessage,
  onChatMessage,
  onUserJoined,
  onUserLeft,
  onRoomUsers,
} from '../utils/api';

type ChatMessage = {
  id: string;
  userId?: string;
  username?: string;
  content: string;
  createdAt?: string;
  system?: boolean;
};

type ChatState = {
  connected: boolean;
  roomId?: string;
  messages: ChatMessage[];
  users: { id: string; username?: string }[];
};

const initialState: ChatState = {
  connected: false,
  roomId: undefined,
  messages: [],
  users: [],
};

// Module-level array to keep unsubscribe handlers returned by listener wrappers
let offHandlers: Array<() => void> = [];

export const connectSocket = createAsyncThunk(
  'chat/connectSocket',
  async (
    payload: { roomId: string; userId?: string; username?: string },
    { dispatch }
  ) => {
    // Clear any existing listeners to prevent duplicate subscriptions
    offHandlers.forEach((off) => {
      try { off(); } catch (e) {}
    });
    offHandlers = [];

    await connectSocketService();

    // IMPORTANT: Register all listeners BEFORE joining to avoid race conditions (per blueprint)
    offHandlers.push(
      onChatMessage((msg: ChatMessage) => {
        dispatch(addMessage(msg));
      })
    );

    offHandlers.push(
      onRoomUsers((users: Array<{ id: string; username?: string }>) => {
        dispatch(setUsers(users));
      })
    );

    offHandlers.push(
      onUserJoined((user: { id: string; username?: string }) => {
        dispatch(addMessage({
          id: `sys-join-${user.id}-${Date.now()}`,
          content: `${user.username ?? 'A user'} joined the room`,
          system: true,
        }));
      })
    );

    offHandlers.push(
      onUserLeft((user: { id: string; username?: string }) => {
        dispatch(addMessage({
          id: `sys-left-${user.id}-${Date.now()}`,
          content: `${user.username ?? 'A user'} left the room`,
          system: true,
        }));
      })
    );

    // NOW join the room on the server (server may respond or broadcast room state)
    try {
      await apiJoinRoom(payload.roomId, payload.userId, payload.username);
    } catch (e) {
      // joinRoom may throw if server rejects; but listeners are ready
      console.warn('joinRoom failed', e);
    }

    return { roomId: payload.roomId };
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (
    payload: { roomId: string; message: string; userId: string; id?: string; username?: string },
    {}) => {
    // Use the socket wrapper to emit message with userId and username
    await apiSendMessage(payload.message, payload.roomId, payload.userId, payload.username);
    return {
      id: payload.id ?? `local-${Date.now()}`,
      content: payload.message,
      username: payload.username,
      userId: payload.userId,
      createdAt: new Date().toISOString(),
    } as ChatMessage;
  }
);

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage(state, action: PayloadAction<ChatMessage>) {
      state.messages.push(action.payload);
    },
    setUsers(state, action: PayloadAction<Array<{ id: string; username?: string }>>) {
      state.users = action.payload;
    },
    clearChat(state) {
      state.messages = [];
      state.users = [];
      state.connected = false;
      state.roomId = undefined;
    },
    disconnectSocketClient(state) {
      // perform cleanup in extra reducer / thunk side-effect below
      state.connected = false;
      state.roomId = undefined;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(connectSocket.fulfilled, (state, action) => {
      state.connected = true;
      state.roomId = action.payload.roomId;
    });

    // Don't add message optimistically - let the server broadcast handle it
    // to avoid duplicates
  },
});

export const { addMessage, setUsers, clearChat, disconnectSocketClient } = chatSlice.actions;

export const disconnectSocket = () => async (dispatch: any) => {
  // call all unsubscribe handlers
  try {
    offHandlers.forEach((off) => {
      try {
        off();
      } catch (e) {
        // ignore
      }
    });
  } finally {
    offHandlers = [];
  }

  try {
    await disconnectSocketService();
  } catch (e) {
    // ignore
  }

  dispatch(clearChat());
};

export const selectChat = (state: RootState) => state.chat;

export default chatSlice.reducer;

