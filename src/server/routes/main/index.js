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

  router.get('/categories/:shortId',
    populateCategoryFilter,
    getArticles
  );

  router.get('/keywords/:keyword',
    populateKeywordsFilter,
    getArticles
  );

  router.get('/by-id/:id',
    getArticleById
  );

  router.get('/s/:shortId',
    extractIdFromShortId,
    getArticleById
  );

  router.get('/p/:slug',
    getArticleBySlug
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

    if (article.category) {
      article.category.shortId = hashids.encodeHex(article.category.id);
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

  function populateCategoryFilter (req, res, next) {
    const categoryId = hashids.decodeHex(req.params.shortId);

    req.articlesFilter = {category: categoryId};

    next();
  }

  function populateKeywordsFilter (req, res, next) {
    req.articlesFilter = {keywords: req.params.keyword};

    next();
  }

  async function getArticles (req, res, next) {
    try {
      const articles = await api.getArticles({
        include: ['author', 'category'],
        filter: req.articlesFilter || {}
      });

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

  async function getArticleBySlug (req, res, next) {
    try {
      const articles = await api.getArticles({
        include: ['author', 'category'],
        filter: {slug: req.params.slug}
      });
      const article = articles[0];

      if (!article) {
        return next();
      }

      res.render('article.html', {
        article: transformArticle(article)
      });
    } catch (err) {
      next(err);
    }
  }

  return router;
}
