import { auth, firestore, googleAuthProvider } from '../lib/firebase';
import { useState, useEffect, useCallback, useContext } from 'react';
import { UserContext } from '../lib/context';
import debounce from 'lodash.debounce';

export default function Login(props) {
  const { user, username } = useContext(UserContext);

  return <main>{user ? !username ? <UsernameForm /> : <SignOutButton /> : <SignInButton />}</main>;
}

function SignInButton() {
  const signInWithGoogle = async () => {
    await auth.signInWithPopup(googleAuthProvider);
  };

  return (
    <button className="btn-google" onClick={signInWithGoogle}>
      <img src={'/google.png'} /> Sign in with Google
    </button>
  );
}

function SignOutButton() {
  return <button onClick={() => auth.signOut()}>Sign Out</button>;
}

function UsernameForm() {
  // Value the user types into the username form
  const [formValue, setFormValue] = useState('');
  // Tells if the username is a valid selection(is a valid username or not)
  const [isValid, setIsValid] = useState(false);
  // Loading state used for when we are asynchronous checking if username exists or not
  const [loading, setLoading] = useState(false);

  // Grab user and username from global context
  const { user, username } = useContext(UserContext);

  const onSubmit = async (e) => {
    // Prevent browser default behaviour
    e.preventDefault();
    // Create reference to firstore document based on the users userID
    const userDoc = firestore.doc(`users/${user.uid}`);
    // Create reference to the firestore usernames collection based on the username typed into the form (formValue)
    const usernameDoc = firestore.doc(`usernames/${formValue}`);

    // Commit both documents together at the same time (batch write)
    // And have them succeed or fail together as a transaction
    const batch = firestore.batch();
    // Call batch.set with the document and the data we want to set in what vars
    batch.set(userDoc, {
      username: formValue,
      photoURL: user.photoURL,
      displayName: user.displayName,
    });
    batch.set(usernameDoc, { uid: user.uid });

    // Commit batch to database in firestore
    await batch.commit();
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
      setIsValid(true);
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
        setIsValid(!exists);
        setLoading(false);
      }
    }, 500),
    []
  );

  return (
    // When no username
    !username && (
      <section>
        <h3>Choose an unique username!</h3>
        <form onSubmit={onSubmit}>
          {/* value={formValue} = set the value the user enters to the formValue state */}
          {/* onChange={onChange} = handler for when the value changes called onChange */}
          <input
            name="username"
            placeholder="A cool username!"
            value={formValue}
            onChange={onChange}
          />
          {/* Display message when something is fucky wucky */}
          <UsernameMessage username={formValue} isValid={isValid} loading={loading} />

          {/* Button will be disabled when form is not valid (!isValid)*/}
          <button type="submit" className="btn-green" disabled={!isValid}>
            I want this one!
          </button>

          {/* Debugging state because it will change very often and is difficult to keep track off */}
          <h3>Debug State</h3>
          <div>
            Username: {formValue}
            <br />
            Loading: {loading.toString()}
            <br />
            Username Valid: {isValid.toString()}
          </div>
        </form>
      </section>
    )
  );
}

// Error messages when something is fucky wucky

function UsernameMessage({ username, isValid, loading }) {
  if (loading) {
    return <p>Checking...</p>;
  } else if (isValid) {
    return <p className="text-success">{username} is available!</p>;
  } else if (username && !isValid) {
    return <p className="text-danger">That username is taken!</p>;
  } else {
    return <p></p>;
  }
}
