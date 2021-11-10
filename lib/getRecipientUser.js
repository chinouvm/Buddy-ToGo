export const getRecipientUser = (users, userLoggedIn) =>
  users?.filter((userToFilter) => userToFilter !== userLoggedIn)[0];
