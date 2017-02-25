import http from 'http';
import logger from 'morgan';
import express from 'express';
import compression from 'compression';
import { host, port, env } from 'c0nfig';

const app = express();

if ('test' !== env) {
  app.use(logger('dev'));
}

app.disable('x-powered-by');
app.use(compression());

export function start() {
  http.createServer(app).listen(port, () => {
    console.log(`app server is listening on http://${host}:${port} env=${env}`);
  });
}
