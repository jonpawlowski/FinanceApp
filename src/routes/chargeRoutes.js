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
