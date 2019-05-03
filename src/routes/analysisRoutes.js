const express = require('express');
const { MongoClient } = require('mongodb');
const debug = require('debug')('app:analysisRoutes');
const analysisRouter = express.Router();

function router() {
  analysisRouter.route('/')

    .get((req, res) => {
      const pageTitle = 'analysis';

      res.render(
        'analysisView',
        {
          pageTitle
        }
      );
    })

  .post((req, res) => {
    //console.log("Request Date is: " + req.session.date);
    var RequestDate;
    if (req.session.date) {
      requestDate = req.session.date;
    } else {
      requestDate = req.body.date.toString();
    }
    //console.log("Request Date is: " + requestDate);
    const currentMonth = requestDate.substring(0, requestDate.indexOf(' '));
    const analysisYear = requestDate.substring((requestDate.indexOf(' ') + 1));
    const analysisMonth = new Date(Date.parse(currentMonth +" 1, 2012")).getMonth()+1;
    const pageTitle = 'analysis';

    const url = global.gConfig.databaseurl;
    const dbName = global.gConfig.database;

    var fs = require('fs');

    (async function monthlyAnalysis() {
      let client;
      try {
        client = await MongoClient.connect(url);

        const db = client.db(dbName);
        const col = await db.collection('charges');

        // Get current dollars to the budget spent as of today
        const date = new Date();
        const monthlyCharges = await col.find({
          "chargeDate" : {
            $lt: new Date( analysisYear, analysisMonth, 1),
            $gte: new Date( analysisYear, analysisMonth - 1 , 1 )
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

        // Perform final budget performance
        var totalMonthlyCharges = 0;
        var allMonthlyCharges = 0;
        var chartMonthlyCharges = 0;
        var chartRecurringCharges = 0;
        var chartOneTimeCharges = 0;

        // Calculate charges against Monthly Spending Budget
        for (i = 0; i < monthlyCharges.length; i++) {
          if (monthlyCharges[i].category == 'Monthly') {
            if (monthlyCharges[i].paymentType == 'Credit') {
              totalMonthlyCharges -= monthlyCharges[i].amount;
            } else {
              totalMonthlyCharges += monthlyCharges[i].amount;
            }
          }
        }

        // Calculate total monthly spending
        for (i = 0; i < monthlyCharges.length; i++) {
          if (monthlyCharges[i].paymentType == 'Credit') {
            allMonthlyCharges -= monthlyCharges[i].amount;
          } else {
            allMonthlyCharges += monthlyCharges[i].amount;
          }
          if (monthlyCharges[i].category == 'Monthly') {
            if (monthlyCharges[i].paymentType == 'Credit') {
              chartMonthlyCharges -= monthlyCharges[i].amount;
            } else {
              chartMonthlyCharges += monthlyCharges[i].amount;
            }
          }
          if (monthlyCharges[i].category == 'Recurring') {
            if (monthlyCharges[i].paymentType == 'Credit') {
              chartRecurringCharges -= monthlyCharges[i].amount;
            } else {
              chartRecurringCharges += monthlyCharges[i].amount;
            }
          }
          if (monthlyCharges[i].category == 'One-time') {
            if (monthlyCharges[i].paymentType == 'Credit') {
              chartOneTimeCharges -= monthlyCharges[i].amount;
            } else {
              chartOneTimeCharges += monthlyCharges[i].amount;
            }
          }
        }

        // Final total monthly spend calculation
        allMonthlyCharges = allMonthlyCharges.toFixed(2); //all monthly charges
        totalMonthlyCharges = totalMonthlyCharges.toFixed(2);  //anything that goes against the monthly budget
        const budgetRemaining = (global.gConfig.budget - totalMonthlyCharges).toFixed(2);
        // Calculate number of days in the month
        const lastOfMonth = new Date( analysisYear, analysisMonth, 0 );
        const numDays = lastOfMonth.getDate();
        const currentOnBudget = ((global.gConfig.budget/numDays) * date.getDate()).toFixed(2);
        const rectSpentWidth = ((totalMonthlyCharges/global.gConfig.budget) * 100).toString();

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

        var monthlyFillColor;
        if (Number(totalMonthlyCharges) > Number(currentOnBudget)) {
          // over budget color
          monthlyFillColor = "#FF0000";
        }
        else {
          // under budget color
          monthlyFillColor = "#8FB7CA";
        }

        // Show green bubble if ahead for the month
        var totalMonthlyFillColor;
        if (Number(allMonthlyCharges) < 0) {
          // ahead for the month so show green and make number positive
          totalMonthlyFillColor = "background: rgb(102, 179, 96);";
          allMonthlyCharges = (allMonthlyCharges * -1);
          allMonthlyCharges = allMonthlyCharges.toFixed(2);
        }
        else {
          // behind for the month so show red
          totalMonthlyFillColor = "background: rgb(255,0,0);";
        }

      res.render(
        'analysisView_month',
        {
          currentMonth,
          allMonthlyCharges,
          totalMonthlyCharges,
          budgetRemaining,
          currentOnBudget,
          monthlyCharges,
          chartMonthlyCharges,
          chartRecurringCharges,
          chartOneTimeCharges,
          monthlyFillColor,
          pageTitle,
          totalMonthlyFillColor,
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
  return analysisRouter;
};

module.exports = router;
