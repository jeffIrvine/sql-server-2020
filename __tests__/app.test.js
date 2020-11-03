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
        name: 'LTD Edition Scribe Honey Habanero',
        scoville_scale: 1000,
        on_sale: false,
        type: 'mustard'
      },
      {
        name: 'Sauce Lord Garlic',
        scoville_scale: 4000,
        on_sale: true,
        type: 'vinegar' 
      },
      {
        name: 'Pineapple Habanero',
        scoville_scale: 10,
        on_sale: false,
        type: 'red sauce'
      },
      {
        name: 'Scotch Bonnet Heirloom Tomato',
        scoville_scale: 10,
        on_sale: true,
        type: 'vinegar'
      }
    ];

    const data = await fakeRequest(app)
      .get('/hot_sauce')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(data.body).toEqual(expectation);
  });
});
