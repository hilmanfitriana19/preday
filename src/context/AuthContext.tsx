'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AppUser {
  uid: string;
  email: string | null;
  role: 'admin' | 'user' | null;
  chat_id: number | null;
  user_id: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const documentId = firebaseUser.email || firebaseUser.uid;
          const userDoc = await getDoc(doc(db, 'users', documentId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: userData.role || 'user',
              chat_id: userData.chat_id || null,
              user_id: userData.user_id || userData.chat_id || null,
            });
          } else {
            // Default user fallback
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: 'user',
              chat_id: null,
              user_id: null,
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser({
             uid: firebaseUser.uid,
             email: firebaseUser.email,
             role: 'user',
             chat_id: null,
             user_id: null,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
