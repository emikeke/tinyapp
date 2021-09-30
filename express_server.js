const { request } = require('express');
const express = require('express');
const app = express();
const PORT = 8080; //default port 8080
const cookieParser = require('cookie-parser');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

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
}

const findUserByEmail = function(email) {
  for (let userID in users) {
    const user = users[userID];
    if (email === user.email) {
      return user;
    }
  }
  return false;
}

const generateRandomString = function(length, chars) {
  let result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

app.set('view engine', 'ejs');

//database
const urlDatabase = {
  'b2xVn2' : 'http://www.lighthouselabs.ca',
  '9sm5xK' : 'http://www.google.com'
};

//homepage
app.get('/', (req, res) => {
  res.send('Hello!');
});

//login
app.get('/login', (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_login", templateVars);
});

//creating a new URL
app.get('/urls/new', (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

//register new user
app.get('/register', (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render('urls_user-registration', templateVars);
});

//post new user info into user object
app.post('/register', (req, res) => {
  const userIDObj = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  const email = req.body.email;
  const password = req.body.password;
  if ((email === '') || (password === '')) {
    return res.status(400).send('Sorry, your email or password cannot be empty!');
  } 
  const userFound = findUserByEmail(email);
  if (userFound){
    return res.status(400).send('Sorry, that email already exists!');
  }
  users[userIDObj] = {
      id: userIDObj,
      email,
      password
    }
    res.cookie('user_id', userIDObj);
    res.redirect('/urls');
});

//my URLs page (connects urlDatabase)
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  //console.log('hello', users[req.cookies["user_id"]]);
  res.render('urls_index', templateVars);
});

//adds a new url and redirects into my URLs w updated
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  //console.log(shortURL);
  //console.log(req.body);  // Log the POST request body to the console
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);  // Respond with 'Ok' (we will replace this)
}); 

//delete url in my URLS and redirects into same page
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

//shows long URL and redirects to the actual webpage, updating edited long URL in my URLS
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]] };
  res.render('urls_show', templateVars);
});

//redirects into the actual webpage when you put short url in address bar
app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//updating edited long URL and redirect into my URLs page
app.post('/urls/:shortURL', (req, res) => {
  const shortURLID = req.params.shortURL;
  const updatedLongURL= req.body.longURL;
  urlDatabase[shortURLID] = updatedLongURL;
  res.redirect('/urls');
});

//making POST for login, setting cookie to username
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userFound = findUserByEmail(email);
  if (userFound === false){
    return res.status(403).send('Sorry, that email cannot be found!');
  }
  let realUser;
    for (let userID in users) {
      const user = users[userID];
      if ((email === user.email) && (password === user.password)) {
        realUser = user;
      }
    }
    console.log(realUser);
    if (!realUser) {
      return res.status(403).send('Sorry, your email exists but you entered the wrong password!');
    }
    res.cookie('user_id', realUser.id);
    res.redirect('/login');
});


//logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id',users[req.cookies["user_id"]] );
  res.redirect('/urls');
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});