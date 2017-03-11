import { env } from 'c0nfig';
import versionifyAssets from 'versionify-assets';

const isProduction = (env === 'production');

function handler (assets) {
  return (req, res, next) => {
    res.locals.assets = assets;

    next();
  };
}


export default function () {
  if (isProduction) {
    return handler({
      common: {
        js: versionifyAssets('/common.min.js')
      },
      home: {
        js: versionifyAssets('/home.min.js')
      },
      article: {
        js: versionifyAssets('/article.min.js')
      }
    });
  } else {
    return handler({
      common: {
        js: versionifyAssets('/common.js')
      },
      home: {
        js: versionifyAssets('/home.js')
      },
      article: {
        js: versionifyAssets('/article.js')
      }
    });
  }
}
