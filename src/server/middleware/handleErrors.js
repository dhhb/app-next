import { env } from 'c0nfig';

const isDevelopment = (env === 'development');

export default function (err, req, res, next) {
  if (!err) {
    return next();
  }

  const errLocals = {};

  if (isDevelopment) {
    console.log(err);
  }

  if (err.stack && isDevelopment) {
    errLocals.stack = err.stack;
    console.error(err.stack);
  }

  res.status(500).render('error.html', errLocals);
}
