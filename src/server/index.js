require('dotenv').config({ path: '.env.local' });

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const epilogue = require('epilogue');
const OktaJwtVerifier = require('@okta/jwt-verifier');

const oktaJwtVerifier = new OktaJwtVerifier({
    clientId: process.env.REACT_APP_OKTA_CLIENT_ID,
    issuer: `${process.env.REACT_APP_OKTA_ORG_URL}/oauth2/default`,
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(async (req, res, next) => {
    try {
        if (req.path === '/dashboard') { return next(); }
        if (!req.headers.authorization) throw new Error('Authorization header is required');
        const accessToken = req.headers.authorization.trim().split(' ')[1];
        await oktaJwtVerifier.verifyAccessToken(accessToken);
        next();
    } catch (error) {
        next(error.message);
    }
});

app.route('/dashboard')
    .get(function(req, res) {
        database.query("SELECT RANK () OVER(ORDER BY SUM(`steps`) DESC) as rank, `name`, SUM(`steps`) as steps FROM `steps` GROUP BY `userId`")
            .then(steps => {
                res.json(steps[0])
            });
    });

const database = new Sequelize({
    dialect: 'sqlite',
    storage: './test.sqlite',
});

const Step = database.define('steps', {
    userId: Sequelize.STRING,
    name: Sequelize.STRING,
    steps: Sequelize.INTEGER,
    stepsDate: Sequelize.DATEONLY,
});

epilogue.initialize({ app, sequelize: database });

stepsResource = epilogue.resource({
    model: Step,
    endpoints: ['/steps', '/steps/:id'],
});

stepsResource.delete.fetch(async function(req, res, context) {
    const accessToken = req.headers.authorization.trim().split(' ')[1];
    const jwt = await oktaJwtVerifier.verifyAccessToken(accessToken);
    if (context.instance.dataValues.userId !== jwt.claims.uid) {
        return context.error(403, "Not your record!");
    } else {
        return context.continue;
    }
});

stepsResource.update.write(async function(req, res, context) {
    const accessToken = req.headers.authorization.trim().split(' ')[1];
    const jwt = await oktaJwtVerifier.verifyAccessToken(accessToken);
    if (context.instance.dataValues.userId !== jwt.claims.uid) {
        return context.error(403, "Not your record!");
    } else {
        return context.continue;
    }
});

stepsResource.create.write(async function(req, res, context) {
    const accessToken = req.headers.authorization.trim().split(' ')[1];
    const jwt = await oktaJwtVerifier.verifyAccessToken(accessToken);
    if (context.instance.dataValues.userId !== jwt.claims.uid) {
        return context.error(403, "Not your record!");
    } else {
        return context.continue;
    }
});

const port = process.env.SERVER_PORT || 3001;

database.sync().then(() => {
    app.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });
});