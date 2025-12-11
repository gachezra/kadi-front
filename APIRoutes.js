export const host = "https://niko-kadi.onrender.com";

export const createRoomRoute = `${host}/api/rooms`;
export const getUserRoomsRoute = (userId) => `${host}/api/rooms/user/${userId}`;
export const joinRoomRoute = (roomId) => `${host}/api/rooms/${roomId}/join`;
export const terminateRoomRoute = (roomId) => `${host}/api/rooms/${roomId}/terminate`;

export const startGameRoute = (roomId) => `${host}/api/rooms/${roomId}/start`;
export const getGameDataRoute = (roomId) => `${host}/api/rooms/${roomId}/gameData`;

export const getRoomDetailsRoute = (roomId) => `${host}/api/rooms/${roomId}`;

export const makeMoveRoute = (roomId) => `${host}/api/rooms/${roomId}/moves`;
export const isCardRoute = (roomId) => `${host}/api/rooms/${roomId}/nikokadi`;

export const changeSuitRoute = (roomId) => `${host}/api/rooms/${roomId}/changeSuit`;
export const answerQuestionCardRoute = (roomId) => `${host}/api/rooms/${roomId}/answerQuestion`;
export const dropAceRoute = (roomId) => `${host}/api/rooms/${roomId}/dropAce`;
