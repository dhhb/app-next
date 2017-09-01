import express from 'express';
import marked from 'marked';
import Hashids from 'hashids';
import moment from 'moment';
import api from '../../utils/api';
import cache from '../../utils/cache';

import 'moment/locale/ru';

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

    moment.locale('ru');
    article.time = moment(article.updatedAt).format('LL').replace('г.', '');

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

        cache.set('categories', transformedCategories, 1000 * 60);
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
        // TBD: sort should be done via API query
        articles: articles.sort((a1, a2) => {
          return new Date(a2.publishedAt).getTime() - new Date(a1.publishedAt).getTime();
        }).map(transformArticle)
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
