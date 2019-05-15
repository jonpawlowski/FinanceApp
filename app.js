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

const config = require('./src/config/config.js');

app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: 'library' }));

require('./src/config/passport.js')(app);
app.use(express.static(path.join(__dirname, '/public/')));
app.set('views', './src/views');
app.set('view engine', 'ejs');

const defaultRouter = require('./src/routes/defaultRoutes')();
const chargeRouter = require('./src/routes/chargeRoutes')();
const analysisRouter = require('./src/routes/analysisRoutes')();
const authRouter = require('./src/routes/authRoutes')();

app.use('/', defaultRouter);
app.use('/charges', chargeRouter);
app.use('/analysis', analysisRouter);
app.use('/auth', authRouter);

app.listen(global.gConfig.node_port, function(){
  debug(`listening on port ${chalk.green(global.gConfig.node_port)}`);
});
