import express from 'express';
import { flow } from 'fp-ts/function';
import { logInfo } from './logger';

const app = express();

const port = parseInt(process.env.EXPRESS_PORT ?? '8080');



app.listen(port, flow(logInfo(`Market Tracker API listening on port ${port}`)));
