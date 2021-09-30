const express = require('express');
const app = express();
const PORT = 8080; 
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { getUserByEmail } = require('./helpers');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['secret']
}));

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

app.set('view engine', 'ejs');

//database
const urlDatabase = {
  'b2xVn2' : { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' },
  '9sm5xK' : { longURL: 'http://www.google.com', userID: 'user2RandomID'}
};

//homepage
app.get('/', (req, res) => {
  res.send('Hello!');
});

//login
app.get('/login', (req, res) => {
  const templateVars = { user: users[req.session["user_id"]] };
  res.render("urls_login", templateVars);
});

//creating a new URL
app.get('/urls/new', (req, res) => {
  const templateVars = { user: users[req.session["user_id"]] };
  res.render("urls_new", templateVars);
});

//register new user
app.get('/register', (req, res) => {
  const templateVars = { user: users[req.session["user_id"]] };
  res.render('urls_user-registration', templateVars);
});

//post new user info into user object
app.post('/register', (req, res) => {
  const userIDObj = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  const email = req.body.email;
  let password = req.body.password;
  if ((email === '') || (password === '')) {
    return res.status(400).send('Sorry, your email or password cannot be empty!');
  }
  //console.log(bcrypt.compareSync(password, hashedPassword));
  const userFound = getUserByEmail(email, users);
  if (userFound) {
    return res.status(400).send('Sorry, that email already exists!');
  }
  //console.log(userFound);
  let hashedPassword = bcrypt.hashSync(password, 10);
  users[userIDObj] = {
    id: userIDObj,
    email,
    password: hashedPassword
  };
  req.session.user_id = userIDObj;
  res.redirect('/urls');
});

//my URLs page (connects urlDatabase)
app.get('/urls', (req, res) => {
  let userid = req.session["user_id"];
  const templateVars = { urls: urlsForUser(userid), user: users[userid] };
  if (!userid) {
    return res.redirect('/login');
  }
  res.render('urls_index', templateVars);
});

//adds a new url and redirects into my URLs w updated
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  const email = req.body.email;
  let realUser;
  for (let userID in users) {
    const user = users[userID];
    if (email === user.email) {
      realUser = user;
    }
  }
  if (!users[req.session["user_id"]]) {
    return res.status(400).send('Please log in/register!');
  }
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session["user_id"] };
  res.redirect(`/urls/${shortURL}`);
});

//delete url in my URLS and redirects into same page
app.post('/urls/:shortURL/delete', (req, res) => {
  let userid = req.session["user_id"];
  if (userid) {
    delete urlDatabase[req.params.shortURL];
    return res.redirect('/urls');
  }
  res.redirect('/login');
});

//shows long URL and redirects to the actual webpage, updating edited long URL in my URLS
app.get("/urls/:shortURL", (req, res) => {
  let userid = req.session["user_id"];
  const templateVars = { shortURL: req.params.shortURL, urls: urlsForUser(userid), user: users[userid] };
  if (!userid) {
    return res.redirect('/login');
  }
  res.render('urls_show', templateVars);
});

//redirects into the actual webpage when you put short url in address bar
app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//updating edited long URL and redirect into my URLs page
app.post('/urls/:shortURL', (req, res) => {
  let userid = req.session["user_id"];
  const shortURLID = req.params.shortURL;
  const updatedLongURL = req.body.longURL;
  if (userid) {
    urlDatabase[shortURLID].longURL = updatedLongURL;
    return res.redirect('/urls');
  }
  res.redirect('/login');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userFound = getUserByEmail(email, users);
  if (userFound === false) {
    return res.status(403).send('Sorry, that email cannot be found!');
  }
  let realUser;
  for (let userID in users) {
    const user = users[userID];
    if (email === user.email) {
      realUser = user;
    }
  }
  //console.log(realUser);
  if (!realUser) {
    return res.status(403).send('Sorry, your email does not exist!');
  }
  if (!bcrypt.compareSync(password, realUser.password)) {
    return res.status(403).send('Sorry, your email exists but you entered the wrong password!');
  }
  req.session.user_id = realUser.id;
  res.redirect('/urls');
});

//logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});