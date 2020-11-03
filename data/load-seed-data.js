const client = require('../lib/client');
// import our seed data:
const hot_sauce = require('./hot-sauce.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      hot_sauce.map(hot_sauce => {
        return client.query(`
                    INSERT INTO hot_sauce (name, scoville_scale, on_sale, type, owner_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
        [hot_sauce.name, hot_sauce.scoville_scale, hot_sauce.on_sale, hot_sauce.type, user.id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
