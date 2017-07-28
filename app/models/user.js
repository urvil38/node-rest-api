'use strict';
const mongoose = require('mongoose');
const config = require('../config/config.json');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	'name' : String,
	'email' : {
	   type : String,
	   unique : true
	},
	'hashed_password' : String,
	'created_at' : String,
	'temp_password' : String,
	'temp_password_time' : String
});

mongoose.Promise = global.Promise;
var MONGO_DB = 'mongodb://mongo:27017/node-login';
var option = {
	user : config.user,
	pass : config.pass
}
mongoose.connect(MONGO_DB,option);


module.exports = mongoose.model('user' , userSchema);
