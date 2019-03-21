require('dotenv').config({ path: '.env.local' });

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const epilogue = require('epilogue');
const OktaJwtVerifier = require('@okta/jwt-verifier');
const log = require('./log');

const {
  REACT_APP_OKTA_CLIENT_ID,
  REACT_APP_OKTA_ORG_URL,
  REACT_APP_DATABASE_NAME,
  REACT_APP_DATABASE_USER,
  REACT_APP_DATABASE_PASSWORD,
  REACT_APP_DATABASE_HOST,
  REACT_APP_DATABASE_PORT,
  SERVER_PORT,
} = process.env;

const oktaJwtVerifier = new OktaJwtVerifier({
  clientId: REACT_APP_OKTA_CLIENT_ID,
  issuer: `${REACT_APP_OKTA_ORG_URL}/oauth2/default`,
});

const database = new Sequelize(
  REACT_APP_DATABASE_NAME,
  REACT_APP_DATABASE_USER,
  REACT_APP_DATABASE_PASSWORD,
  {
    host: REACT_APP_DATABASE_HOST,
    port: REACT_APP_DATABASE_PORT || 5432,
    dialect: 'postgres',
  },
);

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(async (req, res, next) => {
  try {
    if (req.path === '/dashboard') {
      return next();
    }
    if (!req.headers.authorization)
      throw new Error('Authorization header is required');
    const accessToken = req.headers.authorization.trim().split(' ')[1];
    await oktaJwtVerifier.verifyAccessToken(accessToken);
    return next();
  } catch (error) {
    return next(error.message);
  }
});

app.route('/dashboard').get((req, res) => {
  database
    .query(
      'SELECT RANK () OVER(ORDER BY SUM(steps) DESC) as rank, name, SUM(steps) as steps FROM steps GROUP BY name, user_id',
    )
    .then(steps => {
      res.json(steps[0]);
    });
});

const Step = database.define(
  'steps',
  {
    userId: { type: Sequelize.STRING, field: 'user_id' },
    name: Sequelize.STRING,
    steps: Sequelize.INTEGER,
    stepsDate: { type: Sequelize.DATEONLY, field: 'steps_date' },
  },
  { underscored: true },
);

epilogue.initialize({ app, sequelize: database });

const stepsResource = epilogue.resource({
  model: Step,
  endpoints: ['/steps', '/steps/:id'],
});

stepsResource.delete.fetch(async (req, res, context) => {
  const accessToken = req.headers.authorization.trim().split(' ')[1];
  const jwt = await oktaJwtVerifier.verifyAccessToken(accessToken);
  if (context.instance.dataValues.userId !== jwt.claims.uid) {
    return context.error(403, 'Not your record!');
  }
  return context.continue;
});

stepsResource.update.write(async (req, res, context) => {
  const accessToken = req.headers.authorization.trim().split(' ')[1];
  const jwt = await oktaJwtVerifier.verifyAccessToken(accessToken);
  if (context.instance.dataValues.userId !== jwt.claims.uid) {
    return context.error(403, 'Not your record!');
  }
  return context.continue;
});

stepsResource.create.write(async (req, res, context) => {
  const accessToken = req.headers.authorization.trim().split(' ')[1];
  const jwt = await oktaJwtVerifier.verifyAccessToken(accessToken);
  if (context.instance.dataValues.userId !== jwt.claims.uid) {
    return context.error(403, 'Not your record!');
  }
  return context.continue;
});

const port = SERVER_PORT || 3003;

database.sync().then(() => {
  app.listen(port, () => {
    log(`Listening on port ${port}`);
  });
});
