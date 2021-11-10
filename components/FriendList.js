import { useContext } from 'react';
import { render } from 'react-dom';
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';
import toast from 'react-hot-toast';
import { UserContext } from '../lib/context';
import { firestore } from '../lib/firebase';
import { getRecipientUser } from '../lib/getRecipientUser';

function FriendList({ id, users }) {
  const { username } = useContext(UserContext);
  const [recipientSnapshot] = useCollection(
    firestore.collection('users').where('username', '==', getRecipientUser(users, username))
  );
  const [requestSnapshot] = useCollection(
    firestore.collection('friendships').orderBy('requestPending')
  );

  const recipient = recipientSnapshot?.docs?.[0]?.data();
  const requestStatus = requestSnapshot?.docs?.[0].data();
  const recipientUser = getRecipientUser(users, username);

  const onClick = async () => {
    const requestDoc = firestore.doc(
      `friendships/${getRecipientUser(users, username)}-${username}`
    );
    const batch = firestore.batch();

    batch.update(requestDoc, {
      requestPending: false,
    });

    await batch.commit();
  };

  console.log('Recipient User: ' + getRecipientUser(users, username));
  console.log('Request ID ' + requestStatus?.requestID);
  console.log('Username Logged In ' + username);

  if (requestStatus?.requestPending === false) {
    return (
      <>
        <img src={recipient?.photoURL} />
        <p>{recipientUser}</p>
      </>
    );
  } else if (requestStatus?.requestID === username && requestStatus?.requestPending === true) {
    return (
      <>
        <button onClick={onClick}>Accept friend request from {recipient?.username} </button>
      </>
    );
  } else {
    return (
      <>
        <div></div>
      </>
    );
  }
}

// if (
//   requestStatus?.requestPending === false &&
//   requestStatus?.requestID === getRecipientUser(users, username)
// ) {
//   return (
//     <>
//       <img src={recipient?.photoURL} />
//       <p>{recipientUser}</p>
//     </>
//   );
// } else if (requestStatus?.requestID === getRecipientUser(users, username)) {
//   return (
//     <div>
//       <button onClick={onClick}>Accept friend request from {recipient?.username} </button>
//     </div>
//   );
// } else {
//   <div>Nothing to see here...</div>;
// }

export default FriendList;
