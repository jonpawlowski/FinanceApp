const express = require('express');
const { MongoClient } = require('mongodb');
const debug = require('debug')('app:newChargesRoutes');
const newChargesRouter = express.Router();

function router() {
  newChargesRouter.route('/')
    .get((req, res) => {
        res.render(
        'newChargesView'
      );

    })
    .post((req, res) => {
      const { formChargeDate, vendor, formAmount, paymentType, category, comments } = req.body;
      const url = global.gConfig.databaseurl;
      const dbName = global.gConfig.database;

      (async function addUser() {
        let client;
        try {
          client = await MongoClient.connect(url);
          debug('Connected correctly to server');

          const db = client.db(dbName);

          const col = db.collection('charges');
          const chargeDate = new Date(formChargeDate);
          const amount = parseFloat(formAmount);
          const charge = { chargeDate, vendor, amount, paymentType, category, comments };

          const results = await col.insertOne(charge);
          debug(results);

          res.redirect('/');

        } catch (err) {
          debug(err);
        }
      }());
    })

  return newChargesRouter;
};

module.exports = router;
