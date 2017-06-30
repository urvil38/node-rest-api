'use strict';

const auth = require('basic-auth');
const jwt = require('jsonwebtoken');

const login = require('./functions/login');
const password = require('./functions/password');
const profile = require('./functions/profile');
const register = require('./functions/register');
const config = require('./config/config.json');

//RESTful routes for android applicatioon
module.exports = (router) => {

//hendel (/) routes
	router.get('/',(req,res) => res.json({'Greeting':'Welcome to android-login'}));


//hendle login
	router.post('/authenticate',(req,res) => {
	
			login.loginUser(req.body.email,req.body.password)
			.then(result => {
				const token = jwt.sign(result , config.secret , {expiresIn:144000});
				console.log(token);
				res.status(result.status).json({message : result.status , token : token});
			})
			.catch(err => res.status(err.status).json({message : err.message}));
		//}
	});

//hendle register new user to database
	router.post('/users' , (req,res) => {
		const name = req.body.name;
		const password = req.body.password;
		const email = req.body.email;

		if(!name || !password || !email || !name.trim() || !password.trim() || !email.trim()){

			res.status(400).json({message : 'Invalid Request!'});

		}else{

			register.registerUser(name,email,password)
			.then(result => {
				res.setHeader('Location' , '/users/'+email);
				res.status(result.status).json({message : result.message});
			})
			.catch(err => res.status(err.status).json({message : err.message}));
		}
	});

//hendle getting user profile
	router.get('/users/:id', (req,res) => {
		if (checkToken(req)) {
			profile.getProfile(req.params.id)
			.then(result => res.json(result))
			.catch(err => res.status(err.status).json({ message: err.message }));
		} else {
			res.status(401).json({ message: 'Invalid Token !' })
		}
	});

	router.put('/users/:id', (req,res) => {
		if (checkToken(req)) {
			const oldPassword = req.body.password;
			const newPassword = req.body.newPassword;

			if (!oldPassword || !newPassword || !oldPassword.trim() || !newPassword.trim()) {
				res.status(400).json({ message: 'Invalid Request !' });
			} else {
				password.changePassword(req.params.id, oldPassword, newPassword)
				.then(result => res.status(result.status).json({ message: result.message }))
				.catch(err => res.status(err.status).json({ message: err.message }));
			}
		} else {
			res.status(401).json({ message: 'Invalid Token !' });
		}
	});

	router.post('/users/:id/password' , (req,res) => {

		const email = req.params.id;
		const token = req.body.token;
		const newPassword = req.body.password;

		if(!token || !newPassword || !token.trim() || !newPassword.trim()){
			password.restPasswordInit(email)
			.then(result => {
				res.status(result.status).json({message : result.message})
			})
			.catch(err => res.status(err.status).json({message : err.message}));
		}else{
			password.restPasswordFinish(email , token , newPassword)
			.then(result => {
				res.status(result.status).json({message : result.message})
			})
			.catch(err => res.status(err.status).json({message : err.message}));
		}
	});

	function checkToken(req){
		const token = req.headers['x-access-token'];
		if(token){
			try{
				var decoded = jwt.verify(token , config.secret);
				console.log(decoded);
				return decoded.message === req.params.id;
			}catch(err){
				return false;
			}
		}else{
			return false;
		}
	}

}
