import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDU0YlLxJWU-oMjHD1bcVn_kWyKhBQ8vBQ",
  authDomain: "wedsnap-7.firebaseapp.com",
  projectId: "wedsnap-7",
  storageBucket: "wedsnap-7.firebasestorage.app",
  messagingSenderId: "790521488690",
  appId: "1:790521488690:web:f49016c4cecec76030632b"
};

const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);
export const db = getFirestore(app); 