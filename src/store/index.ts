import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './chatSlice';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['chat/setAudioStream'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.stream'],
        // Ignore these paths in the state
        ignoredPaths: ['chat.audioStreams'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;