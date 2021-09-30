//users database
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//url database
const urlDatabase = {
  'b2xVn2' : { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' },
  '9sm5xK' : { longURL: 'http://www.google.com', userID: 'user2RandomID'}
};

const generateRandomString = function(length, chars) {
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

const urlsForUser = function(id) {
  let userURLs = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};

const getUserByEmail = function(email, users) {
  for (let userID in users) {
    const user = users[userID];
    if (email === user.email) {
      return user;
    }
  }
  return false;
};

module.exports = {
  users,
  urlDatabase,
  generateRandomString,
  urlsForUser,
  getUserByEmail
};