import debounce from 'lodash.debounce';
import { firestore } from '../lib/firebase';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { UserContext } from '../lib/context';
import Login from './login';
import toast from 'react-hot-toast';
import FriendList from '../components/FriendList';

export default function Home() {
  const { username } = useContext(UserContext);

  if (!username) return <Login />;
  return (
    <main>
      <div>
        <h1>Home Page!</h1>
        <p>User is signed in!</p>
        <FriendForm />
      </div>
    </main>
  );
}

function FriendForm() {
  // Value the user types into the friend form
  const [formValue, setFormValue] = useState('');
  // Tells if the username is a valid selection(is a valid username or not)
  const [isValid, setIsValid] = useState(false);
  // Loading state used for when we are asynchronous checking if username exists or not
  const [loading, setLoading] = useState(false);

  const { username } = useContext(UserContext);

  // Create a live listener for changes in the friendships collection.
  // it looks in friendships/all documents for the array friendedUsers and checks if the logged in username is in the array.
  const friendLinkRef = firestore
    .collection('friendships')
    .where('users', 'array-contains', username);
  const [friendshipsSnapshot] = useCollection(friendLinkRef);

  // this function takes that live listener and checks if the name the user wants to add as a friend already exist together in one document.
  // This function does not mistake other friendships it only gives a false when the user AND the input user are not in a file together
  const friendlinkAlreadyExist = (recipientUsername) =>
    !!friendshipsSnapshot?.docs.find(
      (friendship) =>
        friendship.data().users.find((friendlist) => friendlist === recipientUsername)?.length > 0
    );

  const onSubmit = async (e) => {
    e.preventDefault();

    const friendshipsDoc = firestore.doc(`friendships/${username}-${formValue}`);
    const batch = firestore.batch();

    if (formValue !== username && !friendlinkAlreadyExist(formValue)) {
      batch.set(friendshipsDoc, {
        users: [username, formValue],
        requestPending: true,
        requestID: formValue,
      });

      await batch.commit();
      toast.success(`Send a friendrequest to ${formValue}!!`, {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    } else if (formValue == username) {
      toast.error('You cannot add yourself as a friend :(', {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    } else {
      toast.error('You already are friends with this person!', {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    }
  };

  // Listen to formValue anytime it changes and execute a read to the database (formValue as dependency)
  // Now anytime the username changes it will run the checkUsername function.
  useEffect(() => {
    checkUsername(formValue);
  }, [formValue]);

  // Handle change event for the form input
  // (e) = Event Listener
  const onChange = (e) => {
    // Grab value from the form and convert toLowerCase (and store it in 'val')
    const val = e.target.value.toLowerCase();
    // Regular expression that defines the format we want our username in (so only capital letters, numbers, icons etc etc)
    // We use this expression to only update the form value if the user types in a valid character
    const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

    // Only set form value if length of username > 3
    if (val.length < 3) {
      setFormValue(val);
      setLoading(false);
      setIsValid(false);
    }

    // If username passes regex test set loading to true because async check for that username in the database
    if (re.test(val)) {
      setFormValue(val);
      setLoading(true);
    }
  };

  // Hit the database for username match after each debounced change
  // useCallback is required for debounce to work (to memorize the function after re-render)

  // DEBOUNCE
  // Because we do not want the function to check everytime the formValue changes we use a debounce
  // A Debounce only executes when the user has stopped typing after a certain time
  // The checkUsername function only runs when the user stopped typing for 500ms

  const checkUsername = useCallback(
    debounce(async (username) => {
      // Verify that username length is greater than 3
      if (username.length >= 3) {
        // Make reference to the location of user document
        const ref = firestore.doc(`usernames/${username}`);
        // Await get to see if the document exists (if the username already exists)
        const { exists } = await ref.get();
        console.log('Firestore read has been executed!');
        // If document does not exist, then username is valid!
        setIsValid(exists);
        setLoading(false);
      }
    }, 500),
    []
  );

  return (
    <section>
      <h3>Add a friend!</h3>
      <form onSubmit={onSubmit}>
        <input
          name="username"
          placeholder="Username you want to add..."
          onChange={onChange}
          value={formValue}
        />
        {/* Display message when something is fucky wucky */}
        <UsernameMessage username={formValue} isValid={isValid} loading={loading} />

        {/* Button will be disabled when form is not valid (!isValid)*/}
        <button type="submit" className="btn-green" disabled={!isValid}>
          Add friend
        </button>
      </form>
      {/* List of Friends */}
      {friendshipsSnapshot?.docs.map((friendship) => (
        <FriendList key={friendship.id} id={friendship.id} users={friendship.data().users} />
      ))}
    </section>
  );
}

// Error messages when something is fucky wucky

function UsernameMessage({ username, isValid, loading }) {
  if (loading) {
    return <p>Checking...</p>;
  } else if (isValid) {
    return <p className="text-success">{username} exists!</p>;
  } else if (username && !isValid) {
    return <p className="text-danger">That user does not exist!</p>;
  } else {
    return <p></p>;
  }
}
