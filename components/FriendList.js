import { useContext } from 'react';
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';
import toast from 'react-hot-toast';
import { UserContext } from '../lib/context';
import { firestore } from '../lib/firebase';
import { getRecipientUser } from '../lib/getRecipientUser';
import Link from 'next/link';

function FriendList({ id, users }) {
  const { username } = useContext(UserContext);
  const [recipientSnapshot] = useCollection(
    firestore.collection('users').where('username', '==', getRecipientUser(users, username))
  );
  const [requestSnapshot] = useDocument(firestore.doc(`friendships/${id}`));

  const recipient = recipientSnapshot?.docs?.[0]?.data();
  const requestStatus = requestSnapshot?.data();
  const recipientUser = getRecipientUser(users, username);

  const onAccept = async () => {
    const acceptDoc = firestore.doc(`friendships/${id}`);
    const batch = firestore.batch();

    batch.update(acceptDoc, {
      requestPending: false,
    });

    await batch.commit();
    toast.success(`Je hebt ${recipientUser} toegevoegd als buddy!`);
  };

  const onDeny = async () => {
    const denyDoc = firestore.doc(`friendships/${id}`);
    const batch = firestore.batch();

    batch.delete(denyDoc);

    await batch.commit();
    toast.error(`Je hebt ${recipientUser} geweigerd als buddy!`);
  };

  const onDelete = async () => {
    const denyDoc = firestore.doc(`friendships/${id}`);
    const batch = firestore.batch();

    batch.delete(denyDoc);

    await batch.commit();
    toast.error(`Je hebt ${recipientUser} verwijderd als buddy!`);
  };

  const Log = () => {
    console.log(id);
  };

  if (requestStatus?.requestPending === false) {
    return (
      <>
        <Link href={recipientUser}>
          <div className="card-container">
            <span onClick={onDelete} className="delete">
              x
            </span>
            <img className="round" src={recipient?.photoURL} alt="user" />
            <h3 className="header3">{recipientUser}</h3>
          </div>
        </Link>
      </>
    );
  } else if (requestStatus?.users[1] === username && requestStatus?.requestPending === true) {
    return (
      <>
        <div className="card-container">
          <img className="round" onClick={Log} src={recipient?.photoURL} alt="user" />
          <h3 className="header3">{recipientUser}</h3>
          <h6 className="header6">Buddy verzoek!</h6>
          <div className="buttons">
            <button className="accept" onClick={onAccept}>
              Accept
            </button>
            <button className="deny" onClick={onDeny}>
              Deny
            </button>
          </div>
        </div>
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

export default FriendList;
