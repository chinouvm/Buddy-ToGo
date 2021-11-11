import Link from 'next/link';
import { auth } from '../lib/firebase';
import { useContext } from 'react';
import { UserContext } from '../lib/context';

// Top navbar
export default function Navbar() {
  const { user, username } = useContext(UserContext);

  return (
    <nav className="navbar">
      <ul>
        <Link href="/">
          <li className="link">
            <img className="logo" src="navlogo.png" />
          </li>
        </Link>

        {/* user is signed-in and has username */}
        {username && (
          <>
            <li className="push-left">
              <SignOutButton />
            </li>
            <li>
              <Link href={`/${username}`}>
                <img className="profile" src={user?.photoURL} />
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

function SignOutButton() {
  return <button onClick={() => auth.signOut()}>Sign Out</button>;
}
