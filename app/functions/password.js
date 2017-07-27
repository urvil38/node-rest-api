'use strict';

const user = require('../models/user.js');
const bcrypt = require('bcryptjs');
const config = require('../config/config.json');
const randomstring = require('randomstring');
const nodemailer = require('nodemailer');

module.exports.changePassword = (email , password , newPassword) =>
	new Promise((resolve,reject) => {
		user.find({email : email})
		.then(users => {
			let user = users[0];
			const hashed_password = user.hashed_password;

			if(bcrypt.compareSync(password , hashed_password)){
				const salt = bcrypt.genSaltSync(10);
				const hash = bcrypt.hashSync(newPassword,salt);

				user.hashed_password = hash;

				return user.save();
			}else{
				reject({status:401 , message : "Invalid old password!"});
			}
		})
		.then(user => resolve({status : 200 , message : 'Password changed successfully!'}))
		.catch(err => reject({status : 500 , message : 'Internal Server Error'}));
	});
	
module.exports.restPasswordInit = (email) =>
	new Promise((resolve,reject) => {
		const random = randomstring.generate(8);

		user.find({email : email})
		.then(users => {
			if(users.length == 0){
				reject({status : 404 , message : 'User not found!!'});
			}else{
				let user = users[0];

				const salt = bcrypt.genSaltSync(10);
				const hash = bcrypt.hashSync(random , salt);

				user.temp_password = hash;
				user.temp_password_time = new Date();

				return user.save();
			}
		})
		.then(user => {
			let transporter = nodemailer.createTransport({
				service : 'gmail',
				auth : {
					user : `${config.email}`,
					pass : `${config.password}`
				}
			});

			let mailOptions = {
				from :`"${config.name}" <${config.email}>`,
				to : email,
				subject : 'Reset password link',
				html : `Hello ${user.name},
 
                     Your reset password token is <b>${random}</b>. 
                If you are viewing this mail from a Android Device click this <a href="http://localhost/${random}">link</a>. 
                The token is valid for only 2 minutes.
 
                Thanks,
                ${config.name}`
			};

			return transporter.sendMail(mailOptions);
		})
		.then(info => {
			console.log(info);
			resolve({status : 200 , message : 'check mail for Instruction'});
		})
		.catch(err => {
			console.log(err);
			reject({status : 500 , message : 'Internal server error!'});
		});
	});
	
module.exports.restPasswordFinish = (email , token , password) =>
	new Promise((resolve,reject) => {
		user.find({email : email})
		.then(users => {
			let user = users[0];
			let diff = new Date() - new Date(user.temp_password_time);
			let seconds = Math.floor(diff/1000);

			if(seconds < 120){
				return user;
			}else{
				reject({status:401,message : 'times out!!'});
			}

		})
		.then(user => {
			if(bcrypt.compareSync(token , user.temp_password)){
				
				let salt = bcrypt.genSaltSync(10);
				let hash = bcrypt.hashSync(password , salt);
				user.hashed_password = hash;
				user.temp_password = undefined;
				user.temp_password_time = undefined;

				return user.save();
			}
		})
		.then(user => resolve({status : 200 , message : 'Password changed successfully!'}))
		.catch(err => reject({status : 500 , message : 'Internal server error!'}));
	});


