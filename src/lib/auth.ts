import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";

export function signUp(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logOut() {
  return signOut(auth);
}

export function listenAuth(callback: (uid: string | null) => void) {
  return onAuthStateChanged(auth, (user) => callback(user?.uid ?? null));
}

export function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}
