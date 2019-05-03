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
      const { formChargeDate, vendor, formAmount, comments, paymentType, category } = req.body;
      const url = global.gConfig.databaseurl;
      const dbName = global.gConfig.database;

      (async function addUser() {
        let client;
        try {
          client = await MongoClient.connect(url);
          debug('Connected correctly to server');

          const db = client.db(dbName);
          const col = db.collection('charges');
          //process.env.TZ = 'UTC';
          const chargeDate = new Date(formChargeDate);
          //console.log("ChargeDate is ==> " + chargeDate);
          const amount = parseFloat(formAmount);

          const charge = { chargeDate, vendor, amount, paymentType, category, comments };

          const results = await col.insertOne(charge);
          debug(results);
          //console.log("Referred page is " + req.headers.referer);
          const pageReferrer = req.headers.referer;

          if (pageReferrer.includes("analysis")) {
            req.session['date'] = 'April 2019';
            res.redirect(307, '/analysis');
            //console.log("*******Analysis Page");
          } else {
            res.redirect('/');
            //console.log("***********Home Page");
          }

        } catch (err) {
          debug(err);
        }
      }());
    })

  return newChargesRouter;
};

module.exports = router;
