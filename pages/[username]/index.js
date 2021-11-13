import UserProfile from '../../components/UserProfile';
import { getUserWithUsername } from '../../lib/firebase';

export async function getServerSideProps({ query }) {
  const { username } = query;

  const userDoc = await getUserWithUsername(username);

  // JSON serializable data
  let user = null;

  if (userDoc) {
    user = userDoc.data();
  }

  return {
    props: { user }, // will be passed to the page component as props
  };
}

export default function UserProfilePage({ user }) {
  return (
    <>
      <UserProfile user={user} />
    </>
  );
}
