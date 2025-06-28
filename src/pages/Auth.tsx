import AuthForm from '@/components/AuthForm';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { useEffect } from 'react';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const { user } = useAuth();
  const db = getFirestore();
  const navigate = useNavigate();
  
  // Redirect to home page if user is logged in
  useEffect(() => {
    if (user) {
      // Ensure user profile is created in Firestore
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
      // Use navigate instead of window.location to prevent full page reload
      navigate('/', { replace: true });
    }
  }, [user, db, navigate]);
  
  // Only show auth form if no user
  return <AuthForm />;
};

export default Auth;