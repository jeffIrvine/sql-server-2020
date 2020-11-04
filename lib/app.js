const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/hot-sauce', async(req, res) => {
  try {
    const data = await client.query('SELECT * from hot_sauce');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/hot-sauce/:id', async(req, res) => {
  try {
    const hot_sauce = req.params.id;

    const data = await client.query(`
    SELECT * from hot_sauce
    WHERE hot_sauce.id=$1
    `, [hot_sauce]);
    
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/hot-sauce/', async(req, res) => {
  try {
    const newName = req.body.name;
    const newScovilleScale = req.body.scoville_scale;
    const newOnSale = req.body.on_sale;
    const newType = req.body.type;
    const newOwnerId = req.body.owner_id;
  
    const data = await client.query(`
      INSERT INTO hot_sauce (name, scoville_scale, on_sale, type, owner_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`, 
    [newName, newScovilleScale, newOnSale, newType, newOwnerId]);
  
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
