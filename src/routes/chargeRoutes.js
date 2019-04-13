const express = require('express');
const { MongoClient } = require('mongodb');
const debug = require('debug')('app:chargeRoutes');
const chargeRouter = express.Router();

function router() {
  chargeRouter.route('/')
    .get((req, res) => {
      const url = global.gConfig.databaseurl;
      const dbName = global.gConfig.database;
      const pageTitle = 'charges';

      (async function mongo() {
        let client;
        try {
          client = await MongoClient.connect(url);
          debug('Connected correctly to server for charge retrieval');

          const db = client.db(dbName);
          const col = await db.collection('charges');

          const charges = await col.find({
            "chargeDate" : {
              $lt: new Date(),
              $gte: new Date(new Date().setDate(new Date().getDate()-180))
            }
          }).toArray();
          charges.sort(function compare(a, b) {
            var dateA = new Date(a.chargeDate);
            var dateB = new Date(b.chargeDate);
            return dateB - dateA;
          });
      res.render(
        'chargesView',
        {
          charges,
          pageTitle
        }
      );
    } catch(err) {
      debug(err.stack);
    }
    client.close();
    }());
  })
  return chargeRouter;
};

module.exports = router;
