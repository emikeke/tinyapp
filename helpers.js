const getUserByEmail = function(email, users) {
  for (let userID in users) {
    const user = users[userID];
    if (email === user.email) {
      return user;
    }
  }
  return false;
}

module.exports = {
  getUserByEmail
}