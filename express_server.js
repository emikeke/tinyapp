const { request } = require('express');
const express = require('express');
const app = express();
const PORT = 8080; //default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString(length, chars) {
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

//creating a new URL
app.get('/urls/new', (req, res) => {
  res.render("urls_new");
});

//my URLs page (connects urlDatabase)
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

//adds a new url and redirects into my URLs w updated
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  console.log(shortURL);
  console.log(req.body);  // Log the POST request body to the console
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
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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

//making POST for login


app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});