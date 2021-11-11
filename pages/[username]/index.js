import Navbar from '../../components/Navbar';
import { useRouter } from 'next/router';
import { useDocument } from 'react-firebase-hooks/firestore';
import { firestore } from '../../lib/firebase';

export default function UserProfilePage() {
  const router = useRouter();
  const { username } = router.query;
  const [userdataSnapshot] = useDocument(firestore.doc(`usernames/${username}`));

  const userdata = userdataSnapshot?.data();

  return (
    <>
      <Navbar />
      <div className="box-center">
        <img src={userdata?.photoURL || '/default.png'} className="card-img-center" />
        <h1 className="userprofileheader">{userdata?.username}</h1>
        <p>
          <i>{userdata?.email || 'Onbekend'}</i>
        </p>
      </div>
    </>
  );
}
