import AuthForm from '@/components/AuthForm';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { useEffect } from 'react';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { Navigate } from 'react-router-dom';

const Auth = () => {
  const { user } = useAuth();
  const db = getFirestore();
  
  // Ensure user profile is created in Firestore
  useEffect(() => {
    if (user) {
      const ensureUserProfile = async () => {
        try {
          const adminEmails = ['admin@gmail.com', 'ari4rich@gmail.com'];
          const role = adminEmails.includes(user.email || '') ? 'admin' : 'user';
          
          const userRef = doc(db, 'users', user.uid);
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || user.email?.split('@')[0] || '',
            role: role,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            isOnline: true
          }, { merge: true });
          
          console.log('User profile ensured in Firestore:', user.email);
        } catch (error) {
          console.error('Error ensuring user profile:', error);
        }
      };

      ensureUserProfile();
    }
  }, [user, db]);
  
  // Only show auth form if no user, otherwise redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return <AuthForm />;
};

export default Auth;