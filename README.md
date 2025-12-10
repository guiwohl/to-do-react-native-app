# To-Do React Native App

## Firebase setup (for running locally)

1) Create a Firebase project (or reuse an existing one).
2) Enable **Email/Password** in Authentication → Sign-in method.
3) Create a **Firestore** database (start in test mode for development, then tighten rules).
4) Add a Web app in Firebase Console and grab the config values (`apiKey`, `authDomain`, etc.).
5) Create a `.env` file (the project already expects `EXPO_PUBLIC_*` keys):

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

These map directly to the values shown in the Firebase Console under your Web app settings. The `.env.example` file is already provided; copy it to `.env` and fill in your secrets.

## Firestore security rules (configured in Console)

To ensure each user only accesses their own tasks:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {           
    match /users/{userId}/tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
