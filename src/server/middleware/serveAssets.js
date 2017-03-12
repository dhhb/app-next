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
        js: versionifyAssets('/common.min.js'),
        css: versionifyAssets('/common.min.css')
      },
      home: {
        js: versionifyAssets('/home.min.js'),
        css: versionifyAssets('/home.min.css')
      },
      article: {
        js: versionifyAssets('/article.min.js'),
        css: versionifyAssets('/article.min.css')
      }
    });
  } else {
    return handler({
      common: {
        js: versionifyAssets('/common.js'),
        css: versionifyAssets('/common.css')
      },
      home: {
        js: versionifyAssets('/home.js'),
        css: versionifyAssets('/home.css')
      },
      article: {
        js: versionifyAssets('/article.js'),
        css: versionifyAssets('/article.css')
      }
    });
  }
}
