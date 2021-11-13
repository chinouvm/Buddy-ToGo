import Navbar from './Navbar';

export default function UserProfile({ user }) {
  return (
    <>
      <Navbar />
      <div className="box-center">
        <img src={user.photoURL || '/default.png'} className="card-img-center" />
        <h1 className="userprofileheader">{user.username}</h1>
        <p>
          <i>{user.email || 'Onbekend'}</i>
        </p>
      </div>
    </>
  );
}
