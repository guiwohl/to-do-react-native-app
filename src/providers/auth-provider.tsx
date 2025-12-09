import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  listenAuth,
  logOut,
  resetPassword as requestPasswordReset,
  signIn,
  signUp,
} from "../lib/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  uid: string | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [uid, setUid] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    const unsubscribe = listenAuth((nextUid) => {
      setUid(nextUid);
      setStatus(nextUid ? "authenticated" : "unauthenticated");
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      status,
      uid,
      async signInWithEmail(email: string, password: string) {
        await signIn(email, password);
      },
      async signUpWithEmail(email: string, password: string) {
        await signUp(email, password);
      },
      async signOut() {
        await logOut();
      },
      async resetPassword(email: string) {
        await requestPasswordReset(email);
      },
    }),
    [status, uid],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
