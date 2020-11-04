const client = require('../lib/client');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();
    
    await client.query(`
            DROP TABLE IF EXISTS users CASCADE;
            DROP TABLE IF EXISTS types CASCADE;
            DROP TABLE IF EXISTS hot_sauce;
        `);

    console.log(' drop tables complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
