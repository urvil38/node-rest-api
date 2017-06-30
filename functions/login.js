'use strict';
const user = require('../models/user.js');
const bcrypt = require('bcryptjs');

module.exports.loginUser = (email,password) => 

	new Promise((resolve,reject) => {

		user.find({email : email})
		.then((users) => {
			if(users.length == 0){
				reject({status : 404 , message : 'User is not defined!'})
			}else{
				return users[0];
			}
		})

		.then((user) => {
			const hashed_password = user.hashed_password;

			if(bcrypt.compareSync(password,hashed_password)){
				resolve({status : 200 , message : email});
			}else{
				reject({status : 401 , message : 'invalid email or password'});
			}
		})

		.catch((err) => {
			reject({status : 500 , message : 'Internal server error'});
		})

	}); 