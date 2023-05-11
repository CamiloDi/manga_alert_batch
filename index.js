const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const app = express();

// routes
const api = require('./src/routes');

const { activeLogs } = require('./src/utils/constants');
const { timeZoneDate } = require('./src/utils')


const allOptions = {
    method: ['GET'],
    credentials: true,
    allowedHeaders: 'X-Requested-With,content-type, resources',
    exposedHeaders: 'resources',
    origin: '*',
};


app.use('/', api);

app.use('/health', cors(allOptions), (req, res) => {
    res.status = 200;
    res.json({ message: 'ok!' });
});

app.set('port', process.env.PORT);
app.listen(app.get('port'), () => {
    if (activeLogs) {
        console.log('----------------------------------');
        console.log(`|           PORT ${app.get('port')}           |`);
        console.log(`|           SERVICE UP!!        |`);
        console.log(`| UP FROM :${timeZoneDate()}  |`);
        console.log('----------------------------------');
    }
});


