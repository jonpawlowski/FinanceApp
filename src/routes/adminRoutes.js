const express = require('express');
const { MongoClient } = require('mongodb');
const adminRouter = express.Router();
const debug = require('debug')('app:adminRoutes');

const books = [
  {
    title: 'War and Peace',
    genre: 'Historical Fictions',
    author: 'Me',
    read: false
  },
  {
    title: 'New Book',
    genre: 'Drama',
    author: 'You',
    read: false
  }
];

function router(nav) {
  adminRouter.route('/')
    .get((req, res) => {
      const url = 'mongodb://localhost:27017';
      const dbName = 'libraryApp';

      (async function mongo() {
        let client;
        try {
          client = await MongoClient.connect(url);
          debug('Connected correctly to server');

          const db = client.db(dbName);

          const response = await db.collection('books').insertMany(books);
          res.json(response);
        } catch (err) {
          debug(err.stack);
        }

        client.close();
      }());
    });
  return adminRouter;
}

module.exports = router;
