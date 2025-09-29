import { useState, useEffect } from 'react';
import { User } from '../types';
import { initializeUser, updateUsername as updateUsernameUtil, getUserFromStorage } from '../utils/userManager';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initUser = async () => {
      try {
        const userData = initializeUser();
        setUser(userData);
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initUser();
  }, []);

  const updateUsername = (newUsername: string) => {
    const updatedUser = updateUsernameUtil(newUsername);
    if (updatedUser) {
      setUser(updatedUser);
    }
  };

  const refreshUser = () => {
    const userData = getUserFromStorage();
    setUser(userData);
  };

  return {
    user,
    isLoading,
    updateUsername,
    refreshUser
  };
};