const express = require('express');
const app = express();
const ejs = require('ejs');
const bodyParser = require('body-parser');
const session = require('express-session'); 

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

const port = 3000;

app.set('view engine', 'ejs');

// import the model you created
const Sign = require('./Models/SignUpInModel');
// Set up the User model


app.get('/', (req, res) => {
  res.send('Welcome to the home page');
});

app.get('/signup', (req, res) => {
  res.render('signup'); // Render the sign-up form view
});

app.get('/signin', (req, res) => {
  res.render('signin'); // Render the sign-in form view
});

app.post('/signup', async (req, res) => {
  try {
    // Retrieve user data from request body
    const { userID,username, password, email } = req.body;

    // Create a new user instance
    const newUser = new Sign({userID, username, password, email });

    // Save the new user to the database
    await newUser.save();

    res.send('User registered successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error registering user');
  }
});

app.post('/signin', async (req, res) => {
  try {
    // Retrieve user credentials from request body
    const { username, password } = req.body;

    // Find the user in the database
    const user = await Sign.findOne({ username: username.toLowerCase() });

    if (!user) {
      // User not found
      res.status(404).send('User not found');
      return;
    }

    // Check if the password matches
    if (password !== user.password) {
      // Password doesn't match
      res.status(401).send('Incorrect password');
      return;
    }

    // Store the user information in the session
    req.session.user = user;

    // Redirect to the dashboard
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error signing in');
  }
});

app.get('/dashboard', (req, res) => {
  // Access the user session
  const user = req.session.user;

  // Check if the user is logged in
  if (user) {
    // User is logged in, render the dashboard
    res.render('dashboard', { user });
  } else {
    // User is not logged in, redirect to the sign-in page
    res.redirect('/signin');
  }
});

// Start the server
app.listen(port, () => { 
  console.log(`Server listening on port ${port}`);
});
