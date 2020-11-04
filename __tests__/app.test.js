require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token;
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns hot_sauce', async() => {

      const expectation = [
        {
          id: 1,
          name: 'LTD Edition Scribe Honey Habanero',
          scoville_scale: 1000,
          on_sale: false,
          type: 'mustard',
          owner_id: 1
        },
        {
          id: 2,
          name: 'Sauce Lord Garlic',
          scoville_scale: 4000,
          on_sale: true,
          type: 'vinegar',
          owner_id: 1 
        },
        {
          id: 3,
          name: 'Pineapple Habanero',
          scoville_scale: 10,
          on_sale: false,
          type: 'red sauce',
          owner_id: 1
        },
        {
          id: 4,
          name: 'Scotch Bonnet Heirloom Tomato',
          scoville_scale: 10,
          on_sale: true,
          type: 'vinegar',
          owner_id: 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/hot-sauce')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns one hot sauce', async() => {

      const expectation = 
      {
        id: 1,
        name: 'LTD Edition Scribe Honey Habanero',
        scoville_scale: 1000,
        on_sale: false,
        type: 'mustard',
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .get('/hot-sauce/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('adds a hot sauce to the DB then returns it', async() => {
      const expectation =       
      {
        id: 5,
        name: 'LTD Edition Scribe Honey Habanero',
        scoville_scale: 1000,
        on_sale: false,
        type: 'mustard',
        owner_id: 1
      };
      const data = await fakeRequest(app)
        .post('/hot-sauce')
        .send({        
          name: 'LTD Edition Scribe Honey Habanero',
          scoville_scale: 1000,
          on_sale: false,
          type: 'mustard',
          owner_id: 1
        })

        .expect('Content-Type', /json/)
        .expect(200);

      const allHotSauce = await fakeRequest(app)
        .get('/hot-sauce')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
      expect(allHotSauce.body.length).toEqual(5);
    });

    
    test('updates single hot sauce in the DB', async() => {
      const expectation =
      {
        id: 2,
        name: 'Sauce Lord Garlic',
        scoville_scale: 4000,
        on_sale: true,
        type: 'vinegar', 
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .put('/hot-sauce/2')
        .send({
          name: 'Sauce Lord Garlic',
          scoville_scale: 4000,
          on_sale: true,
          type: 'vinegar',
          owner_id: 1
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const allHotSauce = await fakeRequest(app)
        .get('/hot-sauce')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
      expect(allHotSauce.body.length).toEqual(4);
    });


  });
});
