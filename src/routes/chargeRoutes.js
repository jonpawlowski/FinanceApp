const express = require('express');
const { MongoClient } = require('mongodb');
const debug = require('debug')('app:chargeRoutes');
const chargeRouter = express.Router();

function router() {
  chargeRouter.route('/')
    .get((req, res) => {
      const url = 'mongodb://localhost:27017';
      const dbName = 'financeApp';

      (async function mongo() {
        let client;
        try {
          client = await MongoClient.connect(url);
          debug('Connected correctly to server for charge retrieval');

          const db = client.db(dbName);
          const col = await db.collection('charges');
          const charges = await col.find().toArray();

      res.render(
        'chargesView',
        {
          charges
        }
      );
    } catch(err) {
      debug(err.stack);
    }
    client.close();
    }());
  });

  return chargeRouter;
};

module.exports = router;
