the plan was made by an ai, heres it: {## 0) O que você precisa entender (o básico do Firebase sem enrolação)

* **Firebase Authentication**: cuida de **quem é o usuário** (criar conta, login, logout). ([Firebase][1])
* **Firestore**: banco NoSQL na nuvem. Você salva “documentos” dentro de “coleções”. ([Firebase][2])
* **Security Rules**: é o “porteiro” do Firestore. Sem regras boas, qualquer um pode ler/escrever tudo se estiver autenticado (ou pior). ([Firebase][3])
* No **Expo**, o caminho mais comum é usar o **Firebase Web/JS SDK** (`firebase` do npm). ([npm][4])

---

## 1) Setup no Firebase Console (passo-a-passo do que clicar)

1. **Criar projeto** no Firebase. ([Firebase][5])
2. **Authentication → Sign-in method → Email/Password → Enable**. ([Firebase][6])
3. **Firestore Database → Create database** (modo de teste só pra começar; depois você troca as rules). ([Firebase][2])
4. **Adicionar app** no projeto:

   * No Firebase Console: “Project settings” → “Your apps” → escolha **Web app** (mesmo sendo mobile). Pegue o `firebaseConfig`. ([Firebase][5])

---

## 2) Instalar no app (Expo)

```bash
npm i firebase
```

O pacote oficial é esse mesmo. ([npm][4])

---

## 3) Guardar config no `.env` do Expo (do jeito certo)

No Expo, use variáveis com prefixo **EXPO_PUBLIC_** pra ficarem acessíveis no app. ([Expo Documentation][7])

`.env`

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

---

## 4) Arquivo `src/lib/firebase.ts` (1 vez só, sem gambiarra)

Firebase tem que ser inicializado **uma vez** e reutilizado.

```ts
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

Referência do setup/initialize (JS SDK modular). ([Firebase][5])

---

## 5) Auth (cadastro, login, logout) — o mínimo que funciona bem

Crie `src/lib/auth.ts`:

```ts
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
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
```

Essas funções são as oficiais do fluxo email/senha. ([Firebase][6])

### Erros comuns (pra não ficar cego)

O Firebase retorna códigos tipo `auth/invalid-email`, `auth/wrong-password`, etc. Você trata e mostra uma msg humana. (A doc do password auth cobre o fluxo e configurações/policies). ([Firebase][6])

---

## 6) Modelagem do Firestore (a que evita dor de cabeça)

Use subcoleção por usuário:

* `users/{uid}/tasks/{taskId}`
* Cada task:

  * `title: string`
  * `done: boolean`
  * `createdAt: serverTimestamp()`

Isso simplifica query e principalmente **rules**.

---

## 7) CRUD de tasks (Firestore)

Crie `src/lib/tasks.ts`:

```ts
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
```

`addDoc`, `updateDoc`, `deleteDoc`, `onSnapshot`, `query/orderBy` são o core do CRUD + lista em tempo real. ([Firebase][2])

---

## 8) Security Rules (isso aqui é obrigatório pra “cada usuário só vê o seu”)

No Firestore Rules, algo nesse espírito:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Isso é exatamente o padrão de “amarrar dados ao `request.auth.uid`”. ([Firebase][3])

Regra importante: **rules também “validam query”**. Se você tentar buscar tasks fora do path do usuário, vai dar permission denied. ([Firebase][8])

---

## 9) React Navigation: fluxo de auth do jeito certo (sem gambi)

A ideia é: renderiza **AuthStack** se não tiver `uid`, e **AppStack** se tiver. É o fluxo recomendado. ([reactnavigation.org][9])

Pseudo-estrutura:

```tsx
// App.tsx (ideia)
const [uid, setUid] = useState<string | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const unsub = listenAuth((u) => {
    setUid(u);
    setLoading(false);
  });
  return unsub;
}, []);

if (loading) return null; // ou splash

return (
  <NavigationContainer>
    {uid ? <AppStack uid={uid} /> : <AuthStack />}
  </NavigationContainer>
);
```

Docs do auth-flow do React Navigation. ([reactnavigation.org][9])

---

## 10) Checklist final (pra bater com seus critérios de aceite)

* Cadastro/login completo: `createUserWithEmailAndPassword` + `signInWithEmailAndPassword` ([Firebase][6])
* CRUD tasks: `addDoc/updateDoc/deleteDoc` + list com `onSnapshot/query` ([Firebase][2])
* Persistência: Firestore já persiste no cloud (e sincroniza) ([Firebase][2])
* Cada usuário só vê o seu: rules com `request.auth.uid == userId` ([Firebase][10])
* ENV no Expo: `EXPO_PUBLIC_*` ([Expo Documentation][7])

Se você seguir exatamente essa estrutura (`users/{uid}/tasks` + rules + auth state + onSnapshot), o app fica simples e sólido.

[1]: https://firebase.google.com/docs/auth/?utm_source=chatgpt.com "Firebase Authentication"
[2]: https://firebase.google.com/docs/firestore/manage-data/add-data?utm_source=chatgpt.com "Add data to Cloud Firestore - Firebase"
[3]: https://firebase.google.com/docs/firestore/security/get-started?utm_source=chatgpt.com "Get started with Cloud Firestore Security Rules - Firebase"
[4]: https://www.npmjs.com/package/firebase?utm_source=chatgpt.com "firebase - npm"
[5]: https://firebase.google.com/docs/web/setup?utm_source=chatgpt.com "Add Firebase to your JavaScript project | Firebase for web platforms"
[6]: https://firebase.google.com/docs/auth/web/password-auth?utm_source=chatgpt.com "Authenticate with Firebase using Password-Based Accounts using Javascript"
[7]: https://docs.expo.dev/guides/environment-variables/?utm_source=chatgpt.com "Environment variables in Expo - Expo Documentation"
[8]: https://firebase.google.com/docs/firestore/security/rules-query?utm_source=chatgpt.com "Securely query data | Firestore | Firebase"
[9]: https://reactnavigation.org/docs/auth-flow/?utm_source=chatgpt.com "Authentication flows - React Navigation"
[10]: https://firebase.google.com/docs/rules/rules-and-auth?utm_source=chatgpt.com "Security Rules and Firebase Authentication"
}