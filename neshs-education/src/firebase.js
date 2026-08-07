import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCjQDoTNxOkQ9jyYDMx2FMY6UWRkpX_pGA",
  authDomain: "neshs-drive-lms.firebaseapp.com",
  projectId: "neshs-drive-lms",
  storageBucket: "neshs-drive-lms.firebasestorage.app",
  messagingSenderId: "122108992766",
  appId: "1:122108992766:web:3cee23619f9baa1dafd9af",
  measurementId: "G-1RL3D909H2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export { signInWithPopup, signOut };