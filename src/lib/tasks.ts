import { db } from "./firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

export function tasksCol(uid: string) {
  return collection(db, "users", uid, "tasks");
}

export async function addTask(uid: string, title: string) {
  return addDoc(tasksCol(uid), {
    title,
    done: false,
    createdAt: serverTimestamp(),
  });
}

export async function toggleTask(uid: string, taskId: string, done: boolean) {
  return updateDoc(doc(db, "users", uid, "tasks", taskId), { done });
}

export async function removeTask(uid: string, taskId: string) {
  return deleteDoc(doc(db, "users", uid, "tasks", taskId));
}

export function listenTasks(uid: string, cb: (tasks: any[]) => void) {
  const q = query(tasksCol(uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
