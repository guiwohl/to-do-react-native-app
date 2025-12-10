1. Firebase Auth basics
	1. Email/password sign up and sign in wired with Firebase SDK.
	2. Auth state listener drives routing between auth stack and app stack.
	3. Password reset uses neutral messaging because Firebase doesn’t reveal if an email exists.
2. Routing with Expo Router
	1. `(auth)` group for sign-in, sign-up, forgot password; redirects to `/` if already signed in.
	2. `(app)` group for signed-in users; redirects to `/sign-in` if unauthenticated.
	3. Global `AuthProvider` wraps the router so any screen can read `useAuth()`.
3. Firestore tasks per user
	1. Data model: `users/{uid}/tasks/{taskId}` with `title`, `done`, `createdAt`.
	2. CRUD helpers (`addTask`, `toggleTask`, `removeTask`, `listenTasks`) abstract Firestore ops.
	3. Security rule ties access to `request.auth.uid == userId`.
4. Task list screen behaviors
	1. Real-time subscription via `listenTasks` keeps UI in sync.
	2. Optimistic UI for add/toggle/delete with rollback on failure.
	3. Loading and empty states for better feedback.
5. Env/config setup
	1. `.env` uses `EXPO_PUBLIC_*` keys for Firebase config in Expo.
	2. README documents Firebase setup and rules.
