const express = require('express');
const { MongoClient } = require('mongodb');
const debug = require('debug')('app:editChargesRoutes');
const editChargesRouter = express.Router();
const ObjectID = require('mongodb').ObjectID;

function router() {
  editChargesRouter.route('/')
    .get((req, res) => {
        res.render(
        'newChargesView'
      );

    })
    .post((req, res) => {
      const { editFormId, editFormChargeDate, editFormVendor, editFormAmount, editFormPaymentType, editFormCategory, editFormComments } = req.body;
      const url = global.gConfig.databaseurl;
      const dbName = global.gConfig.database;

      (async function updateCharge() {
        let client;
        try {
          client = await MongoClient.connect(url);
          debug('Connected correctly to server');

          const db = client.db(dbName);
          const col = db.collection('charges');

          const formatEditChargeDate = new Date(editFormChargeDate);
          const formatEditFormAmount = parseFloat(editFormAmount);

          const results = await col.updateOne( { "_id": ObjectID(editFormId) }, { $set: { "chargeDate": formatEditChargeDate, "vendor": editFormVendor, "amount": formatEditFormAmount, "paymentType": editFormPaymentType, "category": editFormCategory, "comments": editFormComments } } );
          debug(results);

          //Grab referrer page to redirect page to originating page. I needed to do some magic here
          //in order to make a post request back to the Analysis page.
          const pageReferrer = req.headers.referer;

          if (pageReferrer.includes("analysis")) {
            res.redirect(307, '/monthlyAnalysis');
          } else if (pageReferrer.includes("charges")) {
            res.redirect('/charges');
          } else {
            res.redirect('/');
          }

        } catch (err) {
          debug(err);
        }
      }());
    })

  return editChargesRouter;
};

module.exports = router;
