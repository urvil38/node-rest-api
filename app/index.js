'use strict';

const express    = require('express');
const app        = express();
const bodyParser = require('body-parser');
const logger     = require('morgan');
const favicon    = require('serve-favicon');
const path       = require('path');
const router     = express.Router();
const port       = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(favicon(path.join(__dirname,'public','favicon.ico')))

app.use(logger('dev'));

app.set('view engine','ejs');

require('./routes')(router);
app.use('/api/v1', router);

app.get('/register',(req,res) => {
    res.render('register',{title:'Register'})
});

app.get('/login',(req,res) => {
    res.render('loginuser',{title:'Login'})
});

app.listen(port,() => {
    console.log(`app running on port ${port}`);
})
