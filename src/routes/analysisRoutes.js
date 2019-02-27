const express = require('express');
const { MongoClient } = require('mongodb');
const debug = require('debug')('app:analysisRoutes');
const analysisRouter = express.Router();

function router() {
  analysisRouter.route('/')
    .get((req, res) => {
      res.render(
        'analysisView_month'
      );
  });

  return analysisRouter;
};

module.exports = router;
