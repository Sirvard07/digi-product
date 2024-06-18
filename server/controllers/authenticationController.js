const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/User');

exports.login = async (req, res, next) => {
    // let decodedToken = isLoggedIn(req.headers.authorization, res);
    // console.log(decodedToken);
    const { email, password} = req.body;

    let user = await User.findOne({email: email});

    if (user != null) {
        bcrypt.compare(password, user.password, async (bErr, bResult) => {
            if (bErr) {
                console.log("bcrypt error");
                return res.status(400).send({
                    message: "Username or password incorrect!"
                })
            }
            console.log("bcrypt result", bResult);
            if (bResult){
                console.log(user)
                const token = jwt.sign({
                    email: user.email,
                    userId: user._id,
                    role: user.role
                }, 
                process.env.JWT_SECRET,
                {expiresIn: process.env.JWT_EXPIRES }
                )
                console.log("TOKEN", token);

                console.log(user);
                user.lastLogin = new Date();
                await user.save();

                let returnUser = {
                    name: user.name,
                    email: user.email,
                    userId: user._id,
                    lastLogin: user.lastLogin,
                    accessToken: token,
                    role: user.role,
                }
                return res.status(200).send({
                    message: "Logged in!",
                    user: returnUser
                })
            } else {
                return res.status(400).send({
                    message: "Username or password incorrect!"
                })
            }
        })
    }

}

exports.register = async (req, res, next) => {
    console.log(req.body);

    const { name, email, password} = req.body;

    let user = await User.findOne({email: email});

    if (user != null) {
        return res.status(500).send({
            message: "User already exists."
        })
    }
    bcrypt.hash(password, 10, async (err, hash) => {
        if (err) {
            return res.status(500).send({
                message: err
            })
        } else {

            const newUser = new User({
                name,
                email,
                password: hash,
                role: 1,
                lastLogin: new Date()
            });
            await newUser.save();

            return res.status(201).send({
                message: "Registered!"
            })
        }

    });
}