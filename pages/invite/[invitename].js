import { useRouter } from 'next/router';
import React, { useContext, useEffect } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import toast from 'react-hot-toast';
import { UserContext } from '../../lib/context';
import { firestore } from '../../lib/firebase';

export default function InviteName() {
  const router = useRouter();
  const { invitename } = router.query;
  const { username } = useContext(UserContext);

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

  const onAccept = async (e) => {
    e.preventDefault();
    const friendshipsDoc = firestore.doc(`friendships/${username}-${invitename}`);
    const batch = firestore.batch();

    if (invitename !== username && !friendlinkAlreadyExist(invitename)) {
      batch.set(friendshipsDoc, {
        users: [username, invitename],
        requestPending: true,
        requestID: invitename,
      });

      await batch.commit();
      toast.success(`Buddy verzoek verstuurd naar ${invitename}!`, {
        style: {
          borderRadius: '10px',
          color: '#000',
          minWidth: '450px',
        },
      });

      router.push('/');
    } else if (invitename == username) {
      toast.error('Je kunt niet jezelf als buddy toevoegen :(', {
        style: {
          borderRadius: '10px',
          color: '#000',
          minWidth: '450px',
        },
      });

      router.push('/');
    } else {
      toast.error('Deze persoon is al een van jouw buddies!', {
        style: {
          borderRadius: '10px',
          color: '#000',
          minWidth: '450px',
        },
      });

      router.push('/');
    }
  };

  return (
    <>
      <button className="btn-main" onClick={onAccept}>
        Voeg {invitename} toe als buddy!
      </button>
    </>
  );
}
