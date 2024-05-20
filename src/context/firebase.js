// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyArTb-6ReM_0CWN1ul3OFErq3OjQSt87ao",

  authDomain: "kadi-9b2c2.firebaseapp.com",

  databaseURL: "https://kadi-9b2c2-default-rtdb.firebaseio.com",

  projectId: "kadi-9b2c2",

  storageBucket: "kadi-9b2c2.appspot.com",

  messagingSenderId: "327498845642",

  appId: "1:327498845642:web:c878aa21bbaeedd7b0d333",

  measurementId: "G-SZD4GTVW9N"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
