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
  res.render('mainDashboard');
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
    const existingUser = await Sign.findOne({ username: username.toLowerCase() });

    if (existingUser) {
      res.render('signup', { error: 'Username already exists', success: '' });
      return;
    }

    const newUser = new Sign({ userID, username, password, email });
    await newUser.save();
    res.redirect('/signin'); // Redirect to the sign-in page
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
      return res.render('userNotFound', { username: username });
    }
    if (password !== user.password) {
      return res.render('signin', { error: 'Incorrect password', username: '' });
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

app.get('/mainDashboard', (req, res) => {
  req.session.destroy(); // Destroy the session to logout the user
  res.redirect('/'); // Redirect to the mainDashboard page
});

app.get('/houses', authenticateUser, async (req, res) => {
  try {
    const userID = req.session.user._id;
    const houses = await Home.find({ userID });

    if (houses.length === 0) {
      res.render('houses', { error: 'No houses found for the user', houses: [] });
      return;
    }

    res.render('houses', { houses });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving houses');
  }
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
    res.redirect('/houses');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding house');
  }
});

app.get('/update-house/:id', authenticateUser, async (req, res) => {
  try {
    const houseID = req.params.id;
    const userID = req.session.user._id;
    const house = await Home.findOne({ _id: houseID, userID });

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
    const userID = req.session.user._id;
    const { title, description, price, location, photos } = req.body;
    const updatedHouse = await Home.findOneAndUpdate({ _id: houseID, userID }, { title, description, price, location, photos });

    if (!updatedHouse) {
      res.status(404).send('House not found');
      return;
    }

    res.redirect('/houses');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating house');
  }
});

app.get('/delete-house/:id', authenticateUser, async (req, res) => {
  try {
    const houseID = req.params.id;
    const userID = req.session.user._id;
    const house = await Home.findOne({ _id: houseID, userID });

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
    const userID = req.session.user._id;
    const deletedHouse = await Home.findOneAndRemove({ _id: houseID, userID });

    if (!deletedHouse) {
      res.status(404).send('House not found');
      return;
    }

    res.redirect('/houses');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting house');
  }
});


// app.get('/search', authenticateUser, async (req, res) => {
  
//   const { location, price } = req.query;
  
//     const houses = await Home.find({ location, price });

//     const filteredHouses = houses.filter(house => {
     
//     const isLocationMatched = location ? house.location.toLowerCase().includes(location.toLowerCase()) : true;
//     const isPriceMatched = price ? house.price <= parseInt(price) : true;
//     return isLocationMatched && isPriceMatched;
//   });
//   console.log("hiiiiiii")
//   res.render('houses', { houses: filteredHouses });  
// });


// Aa simple valu che khali location and price pass kirne display krava mate if aa thai jai to upr comment valu filtered
app.get('/search', (req, res) => {
  const location = req.query.location;
  const price = req.query.price;
  console.log(req.query);
  res.render('search-results', { location, price });
});
//truu
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});