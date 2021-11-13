import React from 'react';
import InvitePage from '../../components/InvitePage';

export async function getServerSideProps({ query }) {
  const { invitename } = query;

  return {
    props: { invitename }, // will be passed to the page component as props
  };
}

export default function InviteName({ invitename }) {
  return (
    <>
      <InvitePage invitename={invitename} />
    </>
  );
}
