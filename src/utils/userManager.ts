import { v4 as uuidv4 } from 'uuid';
import { User } from '../types';

const USER_STORAGE_KEY = 'nikokadi_user';

export const generateUserId = (): string => {
  return uuidv4();
};

export const getUserFromStorage = (): User | null => {
  try {
    const userData = localStorage.getItem(USER_STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error reading user from localStorage:', error);
    return null;
  }
};

export const saveUserToStorage = (user: User): void => {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
};

export const initializeUser = (): User => {
  let user = getUserFromStorage();
  
  if (!user) {
    user = {
      id: generateUserId(),
      username: `Player_${Math.random().toString(36).substring(2, 8)}`,
    };
    saveUserToStorage(user);
  }
  
  return user;
};

export const updateUsername = (username: string): User | null => {
  const user = getUserFromStorage();
  if (user) {
    user.username = username;
    saveUserToStorage(user);
    return user;
  }
  return null;
};

export const clearUserData = (): void => {
  localStorage.removeItem(USER_STORAGE_KEY);
};