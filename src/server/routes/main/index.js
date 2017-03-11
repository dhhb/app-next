import express from 'express';
import marked from 'marked';
import Hashids from 'hashids';
import api from '../../utils/api';

export default function () {
  const router = express.Router();
  const hashids = new Hashids();

  router.get('/',
    getArticles
  );

  router.get('/by-id/:id',
    getArticleById
  );

  router.get('/:shortId/:slug',
    extractIdFromShortId,
    getArticleById
  );

  function transformArticle (article) {
    article.shortId = hashids.encodeHex(article.id);

    if (article.intro) {
      article.introHTML = marked(article.intro).trim();
    }

    if (article.content) {
      article.contentHTML = marked(article.content).trim();
    }

    return article;
  }

  function extractIdFromShortId (req, res, next) {
    const id = hashids.decodeHex(req.params.shortId);

    if (id) {
      req.params.id = id;
    }

    next();
  }

  async function getArticles (req, res, next) {
    try {
      const articles = await api.getArticles({include: ['author', 'category']});

      res.render('home.html', {
        articles: articles.map(transformArticle)
      });
    } catch (err) {
      next(err);
    }
  }

  async function getArticleById (req, res, next) {
    try {
      const article = await api.getArticle(req.params.id, {include: ['author', 'category']});

      res.render('article.html', {
        article: transformArticle(article)
      });
    } catch (err) {
      next(err);
    }
  }

  return router;
}
