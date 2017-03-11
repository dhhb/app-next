import { env } from 'c0nfig';

const isDevelopment = (env === 'development');

export default function (req, res, next) {
  res.locals.title = isDevelopment ?
    'r-o-b.media | dev' :
    'r-o-b.media';

  next();
}
