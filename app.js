const express = require('express');
const chalk = require('chalk');
const debug = require('debug')('app');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3000;

app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: 'library' }));

require('./src/config/passport.js')(app);
app.use(express.static(path.join(__dirname, '/public/')));
app.set('views', './src/views');
app.set('view engine', 'ejs');

const chargeRouter = require('./src/routes/chargeRoutes')();
const analysisRouter = require('./src/routes/analysisRoutes')();
const authRouter = require('./src/routes/authRoutes')();
const newChargesRouter = require('./src/routes/newChargesRoutes')();
const { MongoClient } = require('mongodb');

app.use('/charges', chargeRouter);
app.use('/analysis', analysisRouter);
app.use('/auth', authRouter);
app.use('/newCharges', newChargesRouter);

app.get('/', (req, res) => {
  const url = 'mongodb://localhost:27017';
  const dbName = 'financeApp';

  (async function mongo() {
    let client;
    try {
      client = await MongoClient.connect(url);
      debug('Connected correctly to server for index retrieval');

      const db = client.db(dbName);
      const col = await db.collection('charges');
      const recentCharges = await col.find({
        "chargeDate" : {
          $lt: new Date(),
          $gte: new Date(new Date().setDate(new Date().getDate()-7))
        }
      }).toArray();
      recentCharges.sort(function compare(a, b) {
        var dateA = new Date(a.chargeDate);
        var dateB = new Date(b.chargeDate);
        return dateB - dateA;
      });
      var d = new Date();
      var month = new Array();
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
      var currentMonth = month[d.getMonth()];

  res.render(
    'test',
    {
      recentCharges,
      currentMonth
    }
  );
  } catch(err) {
    debug(err.stack);
  }
  client.close();
  }());
});

app.listen(port, function(){
  debug(`listening on port ${chalk.green(port)}`);
});
