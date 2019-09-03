const express = require('express');
const mongoDB = require('../config/mongodb.js');
const debug = require('debug')('app:chargeRoutes');
const chargeRouter = express.Router();
const ObjectID = require('mongodb').ObjectID;
//const utilities = require('../config/utils.js');

function router() {
  chargeRouter.route('/newCharges')

  .post((req, res) => {
    const { formChargeDate, vendor, formAmount, comments, paymentType, category } = req.body;

    (async function addCharge() {
      let client;
      try {
        // Re-use existing connection from app.js file. This creates a MongoDB connection pool
        client = mongoDB.get();
        const db = client.db(global.gConfig.database);
        const col = db.collection(global.gConfig.collection);

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

    (async function updateCharge() {
      let client;
      try {
        // Re-use existing connection from app.js file. This creates a MongoDB connection pool
        client = mongoDB.get();
        const db = client.db(global.gConfig.database);
        const col = db.collection(global.gConfig.collection);

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

    (async function deleteCharge() {
      let client;
      try {
        // Re-use existing connection from app.js file. This creates a MongoDB connection pool
        client = mongoDB.get();
        const db = client.db(global.gConfig.database);
        const col = db.collection(global.gConfig.collection);

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

      (async function getCharges() {
        let client;
        try {
          // Re-use existing connection from app.js file. This creates a MongoDB connection pool
          client = mongoDB.get();
          const db = client.db(global.gConfig.database);
          const col = db.collection(global.gConfig.collection);

          // Get charges from the last 180 days
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

          //Get vendor list for auto-complete in the form
          const allVendors = await col.find({
            "chargeDate" : {
              $lt: new Date(),
              $gte: new Date(new Date().setDate(new Date().getDate()-365))
            }
          }).project({ _id : 0, vendor : 1 , comments: 1 }).toArray();

          //const vendorList = utilities.getVendorsList();
          const vendorList = [...new Set(allVendors.map(item => item.vendor))];

          //Sort the vendor list alphabetically
          vendorList.sort(function(a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
          });

          const commentsList = [...new Set(allVendors.map(item => item.comments))];
          commentsList.sort(function(a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
          });

      // render the charges page
      res.render(
        'chargesView',
        {
          charges,
          pageTitle,
          todaysDate,
          vendorList,
          commentsList
        }
      );
    } catch(err) {
      debug(err.stack);
    }
    }());
  })

  return chargeRouter;
};

module.exports = router;
