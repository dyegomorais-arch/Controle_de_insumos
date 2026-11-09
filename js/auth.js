import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

export const login = (email, senha) => signInWithEmailAndPassword(auth, email, senha);
export const logout = () => signOut(auth);
export const onUser = (cb) => onAuthStateChanged(auth, cb);
export const currentEmail = () => (auth.currentUser ? auth.currentUser.email : "");
