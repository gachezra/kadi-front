import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import Cookies from 'js-cookie';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "./firebase";

const UserContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const createUser = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const savePlayer = async (userName, email, password) => {
    try {
      const res = await axios.post('https://example.com/api/data', { userName, email, password });
      console.log("Player data saved successfully:", res.data);

      Cookies.set('userData', { uid: res.data.uid, accessToken: res.data.accessToken, username: userName });
    } catch (error) {
      console.error("Error saving player data:", error);
    }
  };

  const fetchPlayerData = async (email) => {
    try {
      const userData = Cookies.getJSON('userData');
      const response = await axios.get(`https://example.com/api/data?email=${email}`, {
        headers: {
          Authorization: `Bearer ${userData.accessToken}`
        }
      });
      console.log("Player data fetched successfully:", response.data);

      // Save fetched player data in a cookie for later use
      Cookies.set('playerData', response.data);

    } catch (error) {
      console.error("Error fetching player data:", error);
    }
  };

  const loginUser = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Google Sign In Successful:", result);
      setUser(result.user);
      const userData = Cookies.getJSON('userData');
      if (userData) {
        // Use access token for database operations
        // Example: axios.post('https://example.com/api/data', data, { headers: { Authorization: `Bearer ${userData.accessToken}` } });
      }
    } catch (err) {
      console.error("Error during Google Sign In:", err);
    }
  };

  const logoutUser = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("currentUser=", currentUser);
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider
      value={{ user, createUser, loginUser, logoutUser, googleLogin, savePlayer, fetchPlayerData }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(UserContext);
};