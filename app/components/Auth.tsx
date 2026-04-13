"use client"
import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { useDispatch, useSelector } from 'react-redux';
import { signIn } from '../redux/userSlice';
import { State } from '@/app/Types'

const Auth = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, currentUser } = useSelector((state: State) => state.user);
  const [loading, setLoading] = React.useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // Sign in with Google using Firebase Auth
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
  
      // Send the ID token to your backend for verification
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: idToken }),
      });
      if (response.ok) {
        const data = await response.json();
     
        dispatch(signIn(data.user)); // Dispatch signIn action
      } else {
        console.error('Sign-in failed');
      }
    } catch (error) {
      console.error('Error during sign-in:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="flex items-center">
        <p>Welcome, {currentUser?.name}!</p>
      </div>
    );
  }

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="px-4 py-2 border-2 font-bold rounded-sm disabled:opacity-50"
    >
      {loading ? 'Signing in...' : 'Sign in with Google'}
    </button>
  );
};

export default Auth;