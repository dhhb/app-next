import http from 'http';
import path from 'path';
import logger from 'morgan';
import express from 'express';
import nunjucks from 'nunjucks';
import compression from 'compression';
import { host, port, env } from 'c0nfig';
import * as routes from './routes';
import * as middleware from './middleware';

const app = express();

if ('test' !== env) {
  app.use(logger('dev'));
}

nunjucks.configure(path.join(__dirname, './views'), {
  autoescape: true,
  express: app
});

app.disable('x-powered-by');
app.use(compression());
app.use(express.static(path.join(__dirname, '../../public')));

app.use(middleware.addCommonLocals);
app.use(middleware.serveAssets());

app.use('/ping', (req, res) => res.send('pong ^.^'));
app.use('/', routes.main());

app.use(middleware.handleErrors);
app.use(middleware.handleNotFound);

export function start() {
  http.createServer(app).listen(port, () => {
    console.log(`app server is listening on http://${host}:${port} env=${env}`);
  });
}
