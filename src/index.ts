import express from 'express';
import { logInfo } from './logger';
import { connectToMongo } from './mongo';

connectToMongo()();

const app = express();

const port = parseInt(process.env.EXPRESS_PORT ?? '8080');

app.listen(port, logInfo(`Market Tracker API listening on port ${port}`));
