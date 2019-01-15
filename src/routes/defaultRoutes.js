const express = require('express');
const { MongoClient } = require('mongodb');
const debug = require('debug')('app:defaultRoutes');
const defaultRouter = express.Router();

function router() {
  defaultRouter.route('/')
  .get((req, res) => {
    const url = global.gConfig.databaseurl;
    const dbName = global.gConfig.database;
    const rectGreenWidth = 600;
    var fs = require('fs');

    (async function mongo() {
      let client;
      try {
        client = await MongoClient.connect(url);

        const db = client.db(dbName);
        const col = await db.collection('charges');
        const recentCharges = await col.find({
          "chargeDate" : {
            $lt: new Date(),
            $gte: new Date(new Date().setDate(new Date().getDate()-7))
          }
        }).toArray();

        // Get current monthly dollars spent as of today
        const date = new Date();
        const monthlyCharges = await col.find({
          "chargeDate" : {
            $lt: new Date(),
            $gte: new Date(date.getFullYear(), date.getMonth(), 1)
          }
        }).toArray();

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

        // Perform current budget performance
        var totalMonthlyCharges = 0;
        const monthlyBudget = 2000;
        const lastOfMonth = new Date( date.getFullYear(), date.getMonth()+1, 0 );
        const numDays = lastOfMonth.getDate();

        for (i = 0; i < monthlyCharges.length; i++) {
          totalMonthlyCharges += monthlyCharges[i].amount;
        }

        totalMonthlyCharges = totalMonthlyCharges.toFixed(2);
        const budgetRemaining = (monthlyBudget - totalMonthlyCharges).toFixed(2);
        const currentOnBudget = ((monthlyBudget/numDays) * date.getDate()).toFixed(2);
        const rectSpentWidth = ((totalMonthlyCharges/monthlyBudget) * rectGreenWidth).toString();

        // Get current month to display on index page
        const d = new Date();
        const month = new Array();
        month[0] = "January";
        month[1] = "February";
        month[2] = "March";
        month[3] = "April";
        month[4] = "May";
        month[5] = "June";
        month[6] = "July";
        month[7] = "August";
        month[8] = "September";
        month[9] = "October";
        month[10] = "November";
        month[11] = "December";
        const currentMonth = month[d.getMonth()];

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

    res.render(
      'index',
      {
        recentCharges,
        currentMonth,
        totalMonthlyCharges,
        budgetRemaining,
        currentOnBudget,
        rectSpentWidth,
        todaysDate,
        vendorList
      }
    );
    } catch(err) {
      debug(err.stack);
    }
    client.close();
    }());
  });
  return defaultRouter;
};

module.exports = router;
