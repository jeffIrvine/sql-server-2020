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

// --------------------------------------
app.get('/hot-sauce', async(req, res) => {
  try {
    const data = await client.query(`
    SELECT hot_sauce.id, hot_sauce.name, hot_sauce.scoville_scale, hot_sauce.on_sale, types.type as type, hot_sauce.owner_id
      from hot_sauce
      JOIN types
      ON types.id = hot_sauce.type_id
    `);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

// -----------------------------------
app.get('/types', async(req, res) => {
  try {
    const data = await client.query('SELECT * from types');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

// -------------------------------------
app.get('/hot-sauce/:id', async(req, res) => {
  try {
    const hotSauceId = req.params.id;

    const data = await client.query(`
    SELECT 
      hot_sauce.id
      hot_sauce.name
      hot_sauce.scoville_scale
      hot_sauce.on_sale
      types.type
    from hot_sauce
    join types
    on types.id = hot_sauce.types_id
    WHERE hot_sauce.id=$1
    `, [hotSauceId]);
    
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// -------------------------------------------
app.post('/hot-sauce/', async(req, res) => {
  try {
    const newName = req.body.name;
    const newScovilleScale = req.body.scoville_scale;
    const newOnSale = req.body.on_sale;
    const newTypeId = req.body.type_id;
    const newOwnerId = req.body.owner_id;
  
    const data = await client.query(`
      INSERT INTO hot_sauce (name, scoville_scale, on_sale, type_id, owner_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`, 
    [newName, newScovilleScale, newOnSale, newTypeId, newOwnerId]);
  
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// -----------------------------------------------
app.put('/hot-sauce/:id', async(req, res) => {
  try {
    const name = req.body.name;
    const scovilleScale = req.body.scoville_scale;
    const onSale = req.body.on_sale;
    const typeId = req.body.type_id;
    const ownerId = req.body.owner_id;

    const data = await client.query(`
      UPDATE hot_sauce
      SET name=$1, 
      scoville_scale=$2, 
      on_sale=$3, 
      type_id=$4, 
      owner_id=$5
    WHERE hot_sauce.id=$6
    RETURNING *
    `,
    [name, scovilleScale, onSale, typeId, ownerId, req.params.id]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

// -------------------------------------------------
app.delete('/hot-sauce/:id', async(req, res) => {
  try {
    const hotSauceId = req.params.id;

    const data = await client.query(`
      DELETE from hot_sauce 
      WHERE hot_sauce.id=$1
    RETURNING *`,
    [hotSauceId]);
  
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
