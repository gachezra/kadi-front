export const API_BASE_URL = "https://sebastian-judicative-valorie.ngrok-free.dev";

export const COLORS = {
  bg: {
    primary: '#0a0c10',
    secondary: '#151515',
    accent: '#1c1c1e',
    cards: '#232946',
    glass: 'rgba(44, 43, 54, 0.8)',
  },
  text: {
    primary: '#f5f5f5',
    secondary: '#b0a7b3',
    accent: '#ffd700',
  },
  functional: {
    success: '#1ad95d',
    warning: '#f2cc0f',
    danger: '#d83149',
    info: '#4ecca3',
    whatsapp: '#25d366',
  },
  card: {
    bg: '#2f2d40',
    selected: '#948979',
    border: '#ceb89b',
  }
};

export const CARD_SUITS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

export const SUIT_COLORS = {
  hearts: '#d83149',
  diamonds: '#d83149',
  clubs: '#0a0c10',
  spades: '#0a0c10'
};

export const API_ROUTES = {
  // User Management
  getUserDetails: `${API_BASE_URL}/api/users/user`,
  updateUser: (userId: string) => `${API_BASE_URL}/api/users/user/${userId}`,
  updateUserAvatar: (userId: string) => `${API_BASE_URL}/api/users/user/${userId}/avatar`,
  getUserGameStats: (userId: string) => `${API_BASE_URL}/api/users/user/${userId}/gamestats`,
  
  // Room Management
  createRoom: `${API_BASE_URL}/api/rooms`,
  getUserRooms: (userId: string) => `${API_BASE_URL}/api/rooms/user/${userId}`,
  joinRoom: (roomId: string) => `${API_BASE_URL}/api/rooms/${roomId}/join`,
  terminateRoom: (roomId: string) => `${API_BASE_URL}/api/rooms/${roomId}/terminate`,
  getRoomDetails: (roomId: string) => `${API_BASE_URL}/api/rooms/${roomId}`,
  
  // Game Actions
  startGame: (roomId: string) => `${API_BASE_URL}/api/rooms/${roomId}/start`,
  getGameData: (roomId: string) => `${API_BASE_URL}/api/rooms/${roomId}/gameData`,
  makeMove: (roomId: string) => `${API_BASE_URL}/api/rooms/${roomId}/moves`,
  nikoKadi: (roomId: string) => `${API_BASE_URL}/api/rooms/${roomId}/nikokadi`,
  changeSuit: (roomId: string) => `${API_BASE_URL}/api/rooms/${roomId}/changeSuit`,
  answerQuestion: (roomId: string) => `${API_BASE_URL}/api/rooms/${roomId}/answerQuestion`,
  dropAce: (roomId: string) => `${API_BASE_URL}/api/rooms/${roomId}/dropAce`,
};