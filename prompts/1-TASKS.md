# Task backlog (highest priority first)

1) Implement authentication flow
- Build auth screens (sign up, sign in, forgot password optional) using React Navigation/Expo Router
- Wire to Firebase Auth helpers; surface error messages and loading states

2) Create app stack with per-user task list
- After login, show tasks list tied to current user (uid)
- Add task creation input, toggle done, and delete actions; optimistic UI where reasonable

3) Subscribe to Firestore for real-time tasks
- Use `listenTasks` to stream `users/{uid}/tasks` ordered by `createdAt`
- Ensure cleanup of listeners on unmount/sign-out

4) Enforce Firestore security rules
- Add rules file (or documented snippet) restricting access to `users/{uid}/tasks` for matching `request.auth.uid`

5) Environment & config documentation
- Update README with Firebase setup steps and `.env` variables (`EXPO_PUBLIC_*`)
- Add `.env.example` so the app boots without secrets committed

6) Polish UX and validation
- Form validation (email format, password length), inline error feedback, loading indicators, empty states
- Basic theming/layout so the app looks intentional on mobile

7) Smoke tests / sanity checks
- Manual run: sign up, add/toggle/delete tasks, sign out/in to confirm persistence per user
