import express from 'express';

const app = express();

const port = 8080;

app.listen(port, () => {
    console.log(`Market Tracker API listening on port ${port}`); // TODO replace with real logging
});
