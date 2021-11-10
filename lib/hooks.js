import { auth, firestore } from '../lib/firebase';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';

// Custom react hook
export function useUserData() {
  // Fetch current user from firebase auth
  const [user] = useAuthState(auth);

  // Initialize state for username with useState hook
  const [username, setUsername] = useState(null);

  // useEffect hook to listen to any changes in the user object
  // When user object changes, fetch a new user document from firestore database
  useEffect(() => {
    // turn off realtime subscription (to listen realtime)
    let unsubscribe;

    // If we have a user, create a (ref)erence to the collection in the firestore database
    // with the onSnapshot() fetch the latest version of the document and use the setUsername state to update the username
    if (user) {
      const ref = firestore.collection('users').doc(user.uid);
      unsubscribe = ref.onSnapshot((doc) => {
        setUsername(doc.data()?.username);
      });
    } else {
      // If we do not have an user, setUsername state to null
      setUsername(null);
    }

    // Stop listening to realtime updates
    return unsubscribe;
  }, [user]);

  // Return the user and username for further use
  return { user, username };
}
