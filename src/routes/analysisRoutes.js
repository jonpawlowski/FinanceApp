const express = require('express');
const { MongoClient } = require('mongodb');
const debug = require('debug')('app:analysisRoutes');
const analysisRouter = express.Router();

function router() {
  analysisRouter.route('/')

    .get((req, res) => {
      res.render(
        'analysisView'
      );
    })

  .post((req, res) => {
    const requestDate = req.body.date.toString();
    const currentMonth = requestDate.substring(0, requestDate.indexOf(' '));
    const analysisYear = requestDate.substring((requestDate.indexOf(' ') + 1));
    const analysisMonth = new Date(Date.parse(currentMonth +" 1, 2012")).getMonth()+1;

    const url = global.gConfig.databaseurl;
    const dbName = global.gConfig.database;

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
            $lt: new Date( analysisYear, analysisMonth, 0 ),
            $gte: new Date( analysisYear, analysisMonth, 1)
          }
        }).toArray();

        // Perform final budget performance
        var totalMonthlyCharges = 0;
        var allMonthlyCharges = 0;
        var chartMonthlyCharges = 0;
        var chartRecurringCharges = 0;
        var chartOneTimeCharges = 0;

        // Calculate charges against Monthly Spending Budget
        for (i = 0; i < monthlyCharges.length; i++) {
          if (monthlyCharges[i].category == 'Monthly') {
            totalMonthlyCharges += monthlyCharges[i].amount;
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
            chartMonthlyCharges += monthlyCharges[i].amount;
          }
          if (monthlyCharges[i].category == 'Recurring') {
            chartRecurringCharges += monthlyCharges[i].amount;
          }
          if (monthlyCharges[i].category == 'One-time') {
            chartOneTimeCharges += monthlyCharges[i].amount;
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

        var monthlyFillColor;
        if (Number(totalMonthlyCharges) > Number(currentOnBudget)) {
          // over budget color
          monthlyFillColor = "#FF0000";
        }
        else {
          // under budget color
          monthlyFillColor = "#8FB7CA";
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
          monthlyFillColor
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
