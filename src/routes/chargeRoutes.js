const express = require('express');
const { MongoClient } = require('mongodb');
const debug = require('debug')('app:chargeRoutes');
const chargeRouter = express.Router();
const ObjectID = require('mongodb').ObjectID;

function router() {
  chargeRouter.route('/newCharges')
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

        const chargeDate = new Date(formChargeDate);
        //console.log("ChargeDate is ==> " + chargeDate);
        const amount = parseFloat(formAmount);

        const charge = { chargeDate, vendor, amount, paymentType, category, comments };

        const results = await col.insertOne(charge);
        debug(results);

        //Grab referrer page to redirect page to originating page. I needed to do some magic here
        //in order to make a post request back to the Analysis page.
        const pageReferrer = req.headers.referer;

        if (pageReferrer.includes("monthlyAnalysis")) {
          res.redirect(307, '/analysis/monthlyAnalysis');
        } else if (pageReferrer.includes("yearlyAnalysis")) {
          res.redirect(307, '/analysis/yearlyAnalysis');
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

  chargeRouter.route('/editCharges')

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
        console.log("****** Page Referrer is " + pageReferrer);
        if (pageReferrer.includes("monthlyAnalysis")) {
          res.redirect(307, '/analysis/monthlyAnalysis');
        } else if (pageReferrer.includes("yearlyAnalysis")) {
          res.redirect(307, '/analysis/yearlyAnalysis');
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

  chargeRouter.route('/deleteCharges')

  .post((req, res) => {
    const { deleteFormId, deleteFormChargeDate, deleteFormVendor, deleteFormAmount, deleteFormPaymentType, deleteFormCategory, deleteFormComments } = req.body;
    const url = global.gConfig.databaseurl;
    const dbName = global.gConfig.database;

    (async function deleteCharge() {
      let client;
      try {
        client = await MongoClient.connect(url);
        debug('Connected correctly to server');

        const db = client.db(dbName);
        const col = db.collection('charges');

        const results = await col.deleteOne( { "_id": ObjectID(deleteFormId) } );
        debug(results);

        //Grab referrer page to redirect page to originating page. I needed to do some magic here
        //in order to make a post request back to the Analysis page.
        const pageReferrer = req.headers.referer;
        console.log("****** Page Referrer is " + pageReferrer);
        if (pageReferrer.includes("monthlyAnalysis")) {
          res.redirect(307, '/analysis/monthlyAnalysis');
        } else if (pageReferrer.includes("yearlyAnalysis")) {
          res.redirect(307, '/analysis/yearlyAnalysis');
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

  chargeRouter.route('/')
    .get((req, res) => {
      const url = global.gConfig.databaseurl;
      const dbName = global.gConfig.database;
      const pageTitle = 'charges';
      // get today's date for max date and default value in new charges form
      var todaysDate = new Date();
      var dd = todaysDate.getDate();
      var mm = todaysDate.getMonth()+1; //January is 0!
      var yyyy = todaysDate.getFullYear();

      if ( dd < 10 ) {
        dd = '0' + dd;
      }

      if ( mm < 10 ) {
        mm = '0' + mm;
      }

      todaysDate = yyyy + '-' + mm + '-' + dd;
      var fs = require('fs');

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

          // Get vendor list for auto-complete in the form
          // Wrote it to a file because I couldn't figure out how to assign it to a variable
          await col.distinct("vendor", {}, function(err,vendors){
            const vendorJSON = JSON.stringify(vendors);
            //console.log("Vendor JSON is " + vendorJSON);
            fs.writeFile('./src/config/vendorList.json', vendorJSON, 'utf8', function(err, result) {
              if(err) console.log('error', err);
            });
          });

          //Get vendor list from file and sort for easier reading
          const vendorList = JSON.parse(fs.readFileSync('./src/config/vendorList.json', 'utf8'));
          vendorList.sort(function(a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
          });

      res.render(
        'chargesView',
        {
          charges,
          pageTitle,
          todaysDate,
          vendorList
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
