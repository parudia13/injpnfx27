import { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  updateProfile,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { firebaseConfig } from '@/config/env';

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

// Initialize Firebase with error handling
let app;
let auth;

try {
  console.log('Initializing Firebase with config:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    hasApiKey: !!firebaseConfig.apiKey
  });
  
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  
  // Set persistence to LOCAL to ensure auth state persists across browser sessions
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('Error setting auth persistence:', error);
  });
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      console.error('Firebase auth not initialized');
      setLoading(false);
      return () => {};
    }

    console.log('Setting up Firebase auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Firebase auth state changed:', {
        userEmail: user?.email,
        userUid: user?.uid,
        isSignedIn: !!user,
        timestamp: new Date().toISOString()
      });
      
      setUser(user);
      setLoading(false);
    }, (error) => {
      console.error('Auth state change error:', error);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up Firebase auth listener');
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      return { error: new Error('Firebase auth not initialized') };
    }

    try {
      console.log('Attempting Firebase sign in with email:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful:', result.user.email);
      return { error: null };
    } catch (error: any) {
      console.error('Firebase sign in error:', {
        code: error.code,
        message: error.message,
        email
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!auth) {
      return { error: new Error('Firebase auth not initialized') };
    }

    try {
      console.log('Attempting Firebase sign up with email:', email);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with full name
      if (user) {
        await updateProfile(user, {
          displayName: fullName
        });
        console.log('Sign up successful and profile updated:', user.email);
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('Firebase sign up error:', {
        code: error.code,
        message: error.message,
        email
      });
      return { error };
    }
  };

  const signOut = async () => {
    if (!auth) {
      console.error('Firebase auth not initialized for signout');
      return;
    }

    try {
      console.log('Attempting Firebase sign out');
      await firebaseSignOut(auth);
      console.log('Sign out successful');
    } catch (error) {
      console.error('Firebase sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      signIn,
      signUp,
      signOut,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};