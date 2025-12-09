## What changed (plain English)

- Added an **AuthProvider** so the app knows if a user is logged in or not, and so screens can call `signIn`, `signUp`, `signOut`, and `resetPassword` without repeating code.
- Split the app into two route groups:
  - `(auth)` shows the login-related screens.
  - `(app)` shows the signed-in experience.
  The layouts automatically redirect: logged-out users go to `/sign-in`; logged-in users go to `/`.
- Built three auth screens with simple UI and Firebase wiring:
  - **Sign In** (`app/(auth)/sign-in.tsx`): email/password login with loading and friendly error messages.
  - **Sign Up** (`app/(auth)/sign-up.tsx`): create account, handles common Firebase errors.
  - **Forgot Password** (`app/(auth)/forgot-password.tsx`): sends reset email and shows success/error states.
- Added a placeholder signed-in home (`app/(app)/index.tsx`) that shows the user ID and lets you sign out.
- Updated Firebase auth helpers to support password resets and expose a hookable auth listener.

## How it works (step by step)

1. **Firebase setup** (already in the project):
   - `src/lib/firebase.ts` reads your Firebase config from environment variables (`EXPO_PUBLIC_*`) and initializes Firebase once.
   - `src/lib/auth.ts` wraps Firebase Auth functions like sign-in, sign-up, sign-out, and reset password.

2. **Provider and auth state:**
   - `src/providers/auth-provider.tsx` listens to Firebase Auth (`listenAuth`) and keeps `status` (`loading`, `authenticated`, or `unauthenticated`) plus the current `uid`.
   - It also exposes methods (`signInWithEmail`, `signUpWithEmail`, `signOut`, `resetPassword`) so screens can call Firebase without duplicating logic.
   - The provider wraps the whole app in `app/_layout.tsx`, so every screen can access auth state with `useAuth()`.

3. **Route guarding with Expo Router:**
   - `app/(auth)/_layout.tsx`:
     - If auth is still loading → show a spinner.
     - If already signed in → redirect to `/` (the app group).
     - Otherwise, render the auth stack (sign-in, sign-up, forgot password).
   - `app/(app)/_layout.tsx`:
     - If loading → spinner.
     - If logged out → redirect to `/sign-in`.
     - If logged in → render the app stack.

4. **Screens:**
   - **Sign In:** Takes email/password, calls `signInWithEmail`, shows loading and friendly error messages for common Firebase errors, links to sign-up and forgot password.
   - **Sign Up:** Takes email/password, calls `signUpWithEmail`, shows loading/errors (invalid email, weak password, email in use), then redirects to the app when successful.
   - **Forgot Password:** Takes email, calls `resetPassword`, shows success or error.
   - **Home (placeholder):** Shows the current `uid` and a sign-out button; this is where the task list will go next.

## How to run locally

1) Make sure you have Expo CLI set up (`npm install -g expo-cli` if needed).
2) Create a `.env` file with your Firebase credentials (using the `EXPO_PUBLIC_*` keys expected in `src/lib/firebase.ts`).
3) Start the app: `npm install` (once) then `npm run start` (or `npm start`) and open on device/emulator.
4) Use the sign-up screen to create an account, then sign in. Forgot password sends the reset email via Firebase.
