const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { findUserByEmail, generateRandomString, urlsForUser } = require("./helpers");
const { users, urlDatabase } = require("./databaseHelper");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  keys: ["secret"]
}));

app.set("view engine", "ejs");

//homepage
app.get("/", (req, res) => {
  res.send("Please " + "login".link("/login") + "!");
});

//login
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session["userId"]] };
  res.render("urls_login", templateVars);
});

//creating a new URL
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session["userId"]] };
  res.render("urls_new", templateVars);
});

//register new user
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session["userId"]] };
  res.render("urls_user-registration", templateVars);
});

//post new user info into user object
app.post("/register", (req, res) => {
  const userIDObj = generateRandomString(6, "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
  const email = req.body.email;
  let password = req.body.password;
  if ((email === "") || (password === "")) {
    return res.status(400).send("Sorry, one or more fields cannot be empty!");
  }
  //console.log(bcrypt.compareSync(password, hashedPassword));
  const userFound = findUserByEmail(email);
  if (userFound) {
    return res.status(400).send("Sorry, an error has occured!");
  }
  let hashedPassword = bcrypt.hashSync(password, 10);
  users[userIDObj] = {
    id: userIDObj,
    email,
    password: hashedPassword
  };
  req.session.userId = userIDObj;
  res.redirect("/urls");
});

//my URLs page (connects urlDatabase)
app.get("/urls", (req, res) => {
  let userId = req.session["userId"];
  const templateVars = { urls: urlsForUser(userId), user: users[userId] };
  if (!userId) {
    return res.send("Please " + "login".link("/login") + "!");
  }
  res.render("urls_index", templateVars);
});

//adds a new url and redirects into my URLs w updated
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6, "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
  if (!users[req.session["userId"]]) {
    return res.send("Please " + "login".link("/login") + "!");
  }
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session["userId"] };
  res.redirect(`/urls/${shortURL}`);  // Respond with "Ok" (we will replace this)
});

//delete url in my URLS and redirects into same page
app.post("/urls/:shortURL/delete", (req, res) => {
  let userId = req.session["userId"];
  if (userId) {
    delete urlDatabase[req.params.shortURL];
    return res.redirect("/urls");
  }
  res.redirect("/login");
});

//shows long URL and redirects to the actual webpage, updating edited long URL in my URLS
app.get("/urls/:shortURL", (req, res) => {
  let userId = req.session["userId"];
  const templateVars = { shortURL: req.params.shortURL, urls: urlsForUser(userId), user: users[userId] };
  if (!userId) {
    return res.send("Please " + "login".link("/login") + "!");
  }
  res.render("urls_show", templateVars);
});

//redirects into the actual webpage when you put short url in address bar
app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//updating edited long URL and redirect into my URLs page
app.post("/urls/:shortURL", (req, res) => {
  let userId = req.session["userId"];
  const shortURLID = req.params.shortURL;
  const updatedLongURL = req.body.longURL;
  if (userId) {
    urlDatabase[shortURLID].longURL = updatedLongURL;
    return res.redirect("/urls");
  }
  res.redirect("/login");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userFound = findUserByEmail(email);
  if (userFound === false) {
    return res.status(403).send("Sorry, an error has occured!");
  }
  let realUser;
  for (let userID in users) {
    const user = users[userID];
    if (email === user.email) {
      realUser = user;
      break;
    }
  }
  if (!realUser) {
    return res.status(403).send("Sorry, an error has occured!");
  }
  if (!bcrypt.compareSync(password, realUser.password)) {
    return res.status(403).send("Sorry, an error has occured!");
  }
  req.session.userId = realUser.id;
  res.redirect("/urls");
});

//logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});