const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const ejs = require('ejs');
const path = require('path');

const Sign = require('./Models/SignUpInModel');
const Home = require('./Models/House');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Authentication middleware
const authenticateUser = (req, res, next) => {
  const user = req.session.user;

  if (user) {
    next(); // User is authenticated, continue to the next middleware or route handler
  } else {
    res.redirect('/signin'); // User is not authenticated, redirect to the sign-in page
  }
};

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
    const { userID, username, password, email } = req.body;
    const newUser = new Sign({ userID, username, password, email });
    await newUser.save();
    res.send('User registered successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error registering user');
  }
});

app.post('/signin', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Sign.findOne({ username: username.toLowerCase() });

    if (!user) {
      res.status(404).send('User not found');
      return;
    }

    if (password !== user.password) {
      res.status(401).send('Incorrect password');
      return;
    }

    req.session.user = user;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error signing in');
  }
});

app.get('/dashboard', authenticateUser, (req, res) => {
  const user = req.session.user;
  res.render('dashboard', { user });
});

app.get('/add-house', authenticateUser, (req, res) => {
  res.render('addHouse'); // Render the add-house form view
});

app.post('/add-house', authenticateUser, async (req, res) => {
  try {
    const { title, description, price, location, photos } = req.body;
    const userID = req.session.user._id;
    const newHouse = new Home({ title, description, price, location, photos, userID });
    await newHouse.save();
    res.send('House added successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding house');
  }
});

app.get('/update-house/:id', authenticateUser, async (req, res) => {
  try {
    const houseID = req.params.id;
    const house = await Home.findById(houseID);

    if (!house) {
      res.status(404).send('House not found');
      return;
    }

    res.render('updateHouse', { house });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving house');
  }
});

app.post('/update-house/:id', authenticateUser, async (req, res) => {
  try {
    const houseID = req.params.id;
    const { title, description, price, location, photos } = req.body;
    const updatedHouse = await Home.findByIdAndUpdate(houseID, { title, description, price, location, photos });

    if (!updatedHouse) {
      res.status(404).send('House not found');
      return;
    }

    res.send('House updated successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating house');
  }
});

app.get('/delete-house/:id', authenticateUser, async (req, res) => {
  try {
    const houseID = req.params.id;
    const house = await Home.findById(houseID);

    if (!house) {
      res.status(404).send('House not found');
      return;
    }

    res.render('deleteHouse', { house });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting house');
  }
});

app.post('/delete-house/:id', authenticateUser, async (req, res) => {
  try {
    const houseID = req.params.id;
    const deletedHouse = await Home.findByIdAndRemove(houseID);

    if (!deletedHouse) {
      res.status(404).send('House not found');
      return;
    }

    res.send('House deleted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting house');
  }
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
