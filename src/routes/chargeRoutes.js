const express = require('express');
const { MongoClient } = require('mongodb');
const debug = require('debug')('app:chargeRoutes');
const chargeRouter = express.Router();

function router() {
  chargeRouter.route('/')
    .get((req, res) => {
      res.render(
        'chargesView'
      );
  });

  return chargeRouter;
};

module.exports = router;
