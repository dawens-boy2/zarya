import express from 'express';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import path from 'path';

// Importing the 'pair' module
import code from './pair.js';

const app = express();

// Resolve the current directory path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8000;

import('events').then(events => {
    events.EventEmitter.defaultMaxListeners = 500;
});

app.use('/code', code);
app.use('/pair', async (req, res) => {
    res.sendFile(path.join(__dirname, 'pair-code.html'));
});
app.use('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
    console.log(`Instagram: @um4rxd\n\nGitHub: @Um4r719\n\nServer running on http://localhost:${PORT}`);
});

export default app;
