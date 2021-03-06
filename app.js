const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const fileUpload = require('express-fileupload');
const paginate = require('express-paginate');
const CronJob = require('cron').CronJob;

require('dotenv').config();

// const sass = require('node-sass');
// const expressThumbnail = require('express-thumbnail');

// Init App
const app = express();

app.use(fileUpload());
app.use(paginate.middleware(20, 50));

// app.use(expressThumbnail.register(__dirname + 'public/uploads/images'));

// // add sass middleware
// app.use(
//   sass.middleware({
//       src: __dirname + '/public/sass', 
//       dest: __dirname + '/public/stylesheets',
//       prefix:  '/stylesheets',
//       debug: true,         
//   })
// );

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json({limit: '50mb'}));

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(__dirname + 'public/images'));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

var router = require('./routes/pet')
app.use('/', router)

var utility = require('./utility/functions');

// cronjob for json backup
new CronJob('00 00 23 * * *', function() {
    
  // Execute code here
  console.log('Cronjob started!');
  
  utility.svg_cron();

}, null, true, 'America/Los_Angeles');

// Start Server
app.listen(3000, function(){
  console.log('Server started on port 3000...');
});