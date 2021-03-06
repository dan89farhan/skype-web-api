'use strict';

const fs = require('fs');

const { Client } = require('./index');
const { Events } = require('./src/util/Constants');

const SESSION_FILE_PATH = './session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}

const client = new Client({ puppeteer: { headless: false }, session: sessionCfg });

// console.log(`client`, client);

client.initialize();

client.on(Events.SESSION_FILE_MISSING, (message) => {
    console.log('message', message);
})