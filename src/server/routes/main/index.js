import express from 'express';
import marked from 'marked';
import Hashids from 'hashids';
import api from '../../utils/api';
import cache from '../../utils/cache';

export default function () {
  const router = express.Router();
  const hashids = new Hashids();

  router.get('/',
    getCategories,
    getArticles
  );

  router.get('/c/:shortId/:title',
    getCategories,
    populateCategoryFilter,
    getArticles
  );

  router.get('/keywords/:keyword',
    getCategories,
    populateKeywordsFilter,
    getArticles
  );

  router.get('/s/:shortId',
    getCategories,
    extractIdFromShortId,
    getArticleById
  );

  router.get('/p/:slug',
    getCategories,
    getArticleBySlug
  );

  router.get('/by-id/:id',
    getCategories,
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
      transformCategory(article.category);
    }

    return article;
  }

  function transformCategory (category) {
    category.shortId = hashids.encodeHex(category.id);

    return category;
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

  async function getCategories (req, res, next) {
    try {
      const cachedCategories = cache.get('categories');

      if (cachedCategories) {
        res.locals.categories = cachedCategories;
      } else {
        const categories = await api.getCategories();
        const transformedCategories = categories.map(transformCategory);
        res.locals.categories = transformedCategories;

        cache.set('categories', transformedCategories);
      }

      next();
    } catch (err) {
      next(err);
    }
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
