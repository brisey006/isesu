const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');

module.exports = (passport) => {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            //Match User
            User.findOne({ email: email })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: 'That email is not registered' });
                }

                if (user.accountDeleted == 1) {
                    return done(null, false, { message: 'This account was removed from our servers' });
                }

                //Match Password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        throw err;
                    }

                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done (null, false, { message: 'Username or password is incorrect' })
                    }
                });
            })
            .catch(err => {
                console.log(err);
            });
        })
    );

    passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
      passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
      });
}