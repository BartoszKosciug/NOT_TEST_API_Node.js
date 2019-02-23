const express = require('express');
const chalk = require('chalk');

const mongoose = require('mongoose');
const app = express();
const parser = require('body-parser');
const port = process.env.PORT || 3000;
const password = process.env.MONGO_PASS;
const debug = require('debug')('app');
const morgan = require('morgan');
const path = require('path');
const restaurantsRouter = require('./routes/restaurant');
const usersettingsRouter = require('./routes/usersettings');
const routerReview = require('./routes/review');

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(parser.json());
app.use('/css', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/js')));
app.use('js', express.static(path.join(__dirname, '/node_modules/jquery/dist')));
app.use('js', express.static(path.join(__dirname, '/node_modules/popper.js/dist/umd')));
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

mongoose.connect(
  'mongodb://kosciba:' + 
  password + 
  '@tastycitydb-shard-00-00-yo23y.mongodb.net:27017,tastycitydb-shard-00-01-yo23y.mongodb.net:27017,tastycitydb-shard-00-02-yo23y.mongodb.net:27017/test?ssl=true&replicaSet=TastyCityDb-shard-0&authSource=admin&retryWrites=true',
  {
    useNewUrlParser: true,
  });

app.use('/restaurants', restaurantsRouter);
app.use('/usersettings',usersettingsRouter);
app.use('/review', routerReview);

app.get('/', (req, res) => {
  // res.sendFile(path.join(__dirname, 'views', 'index.html'));
  res.render('index', { name: 'Bartosz', age: 25 });
});

app.listen(port, () => {
  debug(`listening on port ${chalk.green(port)}`); // template string
});
