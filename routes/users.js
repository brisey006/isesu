const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const uuidv4 = require('uuid/v4');
const sgMail = require('@sendgrid/mail');
const router = express.Router();

const { authorized } = require("../config/auth");

//SENDGRID
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const User = require("../models/User");

router.get("/home", authorized, (req, res) => {
  res.json({ msg: "Welcome" });
});

//Login
router.post("/login", (req, res, next) => {
  passport.authenticate(
    "local",
    { session: true },
    (err, passportUser, info) => {
      let errors = [];
      if (err) {
        errors.push({ msg: err.message });
        res.json({
          errors: errors
        });
      }

      if (passportUser) {
        const user = passportUser;
        const today = new Date();
        const expirationDate = new Date(today);
        expirationDate.setDate(today.getDate() + 60);

        jwt.sign(
          {
            email: user.email,
            id: user._id,
            exp: parseInt(expirationDate.getTime() / 1000, 10),
            lastLogin: Date.now
          },
          process.env.JWT_KEY,
          (err, token) => {
            if (err) {
              errors.push({ msg: err });
              return res.json({ errors: errors });
            } else {
              if (user.emailVerified) {
                return res.json({
                  _id: user._id,
                  email: user.email,
                  username: user.username,
                  token,
                  displayImage: user.displayImage
                });
              } else {
                errors.push({ msg: 'Email address not verified' });
                return res.json({ errors: errors });
              }
            }
          }
        );
      } else {
        errors.push({ msg: info.message });
        return res.json({ errors: errors });
      }
    }
  )(req, res, next);
});

router.post("/login/token", async (req, res) => {
  jwt.verify(req.body.token, process.env.JWT_KEY, async (err, authData) => {
    if (err) {
      res.status(403).send("Authentication needed");
    } else {
      const user = await User.findOne({ _id: authData.id }).select(
        "email username displayImage"
      );

      res.json({ token: req.body.token, ...user._doc });
    }
  });
});

router.get("/forgot-password", async (req, res) => {
  let tempPassword = uuidv4();
  tempPassword = tempPassword.substring(0, tempPassword.indexOf('-'));
  res.send(tempPassword);
});

//Register
router.post("/register", async (req, res, next) => {
  const { username, email, password, password2 } = req.body;
  let errors = [];

  //Check Required
  if (!username || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields." });
  }

  //Check password length
  if (password.length < 6) {
    errors.push({ msg: "Password must be six or more charecters." });
  }

  //Check passwords
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (errors.length > 0) {
    res.json({
      errors: errors
    });
  } else {
    const user = await User.findOne({ email: email });
    if (user) {
      errors.push({ msg: "User already exists." });
      res.json({
        errors: errors
      });
    } else {
      const newUser = new User({
        username,
        email,
        password,
        accountDeleted: 0,
        verificationToken: uuidv4(),
      });

      //Generate hash
      bcrypt.genSalt(10, (err, salt) =>
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;

          newUser.save()
          .then(user => {
            const msg = {
              to: newUser.email,
              from: 'digitalhundred263@gmail.com',
              subject: 'Verify your ISESU account',
              text: 'We are checking if you own this email address',
              html: `<h3>Click this link to verify your ISESU account<h3><p>${process.env.API_HOST}/api/users/verify/${newUser.verificationToken}`,
            };
            sgMail.send(msg)
            .then(() => {
              res.status(200).json(user);
            })
            .catch(e => {
              console.log(e.response.body.errors);
              next(err);
            });
          })
          .catch(err => {
            next(err);
          });
        })
      );
    }
  }
});

router.get("/verify/:token", async (req, res) => {
  try {
    const token = req.params.token;

    const user = await User.findOne({ verificationToken: token });

    if (user != null) {
      user.emailVerified = true;
      user.verificationToken = '';
      await user.save();
      res.redirect(`${process.env.HOST}/login/?er=1`);
    } else {
      res.redirect(`${process.env.HOST}/login`);
    }
  } catch(e) {
    res.json({ error: e.message });
  }
});

router.get('/reset', async (req, res) => {
  const token = req.query.token;
  res.redirect(`${process.env.HOST}/login/resetpassword.php?token=${token}`);
});

router.get("/resend-verification/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email: email });

    if (user == null) {
      res.json({ error: "Email address not registered" });
    } else {
      if (user.emailVerified) {
        res.json({ error: "Email address already verified" });
      } else {
        user.verificationToken = uuidv4();
        await user.save();
        //Send email verification
        sgMail.setApiKey(SENDGRID_API_KEY);
        const msg = {
            to: email,
            from: 'noreply@isesu263.com',
            subject: 'Verify your ISESU account',
            text: 'We are checking if you own this email address',
            html: `<h3>Click this link to verify your ISESU account<h3><p>${process.env.API_HOST}/api/users/verify/${user.verificationToken}`,
        };
        sgMail.send(msg)
        .then(() => {
          res.redirect(`${process.env.HOST}/login/?er=3`);
        })
        .catch(er => {
          res.json({error: er});
        });
      }
    }

  } catch(e) {
    res.json({ error: e.message });
  }
});

router.get("/forgot-password/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email: email });

    if (user == null) {
      res.json({ error: "Email address not registered" });
    } else {
      user.passwordResetToken = uuidv4();
        await user.save();
        //Send email verification
        sgMail.setApiKey(SENDGRID_API_KEY);
        const msg = {
            to: user.email,
            from: 'noreply@isesu263.com',
            subject: 'Reset password link',
            text: 'Use the following link to reset your password',
            html: `<h3>Click this link to reset password<h3><p>${process.env.API_HOST}/api/users/reset/?token=${user.passwordResetToken}`,
        };
        sgMail.send(msg)
        .then(() => {
          res.json({ status: "Password reset link send" });
        })
        .catch(er => {
          res.json({error: er});
        });
    }

  } catch(e) {
    res.json({ error: e.message });
  }
});

router.post("/reset-password/", async (req, res) => {
  const { token, password, password2 } = req.body;
  let errors = [];

  //Check Required
  if (!token || !password || !password2) {
    errors.push({ msg: "Please fill in all fields." });
  }

  //Check password length
  if (password.length < 6) {
    errors.push({ msg: "Password must be six or more charecters." });
  }

  //Check passwords
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (errors.length > 0) {
    res.json({
      errors: errors
    });
  } else {
    const user = await User.findOne({ passwordResetToken: token });
    if (!user) {
      errors.push({ msg: "Reset password token expired" });
      res.json({
        errors: errors
      });
    } else {
      //Generate hash
      bcrypt.genSalt(10, (err, salt) =>
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) throw err;
          user.password = hash;
          user.passwordResetToken = undefined;
          user.save()
          .then(user => {
            res.json({ status: 'Password successfully changed', er: 2 });
          })
          .catch(err => {
            res.json({ status: err, er: 1 });
          });
        })
      );
    }
  }
});

router.get("/page/:page", async (req, res) => {
  const sort = req.query.sortby;
  const order = req.query.order;
  try {
    const users = await User.paginate(
      { accountDeleted: 0 },
      {
        page: req.params.page,
        limit: 20,
        sort: { [sort]: order }
      }
    );
    res.status(200).json(users);
  } catch (e) {
    res.json({ error: e.message });
  }
});

router.get("/search/:page", async (req, res) => {
  const q = req.query.q;
  try {
    const users = await User.paginate(
        { 
          accountDeleted: 0,
          $text: { $search: q },
        },
      {
        page: req.params.page,
        limit: 20
      }
    );
    res.status(200).json(users);
  } catch (e) {
    res.json({ error: e.message });
  }
});

router.get("/filter-by-letter/:letter/:page", async (req, res) => {
  const letter = req.params.letter;
  const sort = req.query.sortby;
  const order = req.query.order;
  var re = new RegExp(`^[${letter}]`);
  try {
    const users = await User.paginate(
        { 
          accountDeleted: 0,
          username: { $regex: re, $options: 'i' },
        },
      {
        page: req.params.page,
        limit: 20,
        sort: { [sort]: order }
      }
    );
    res.status(200).json(users);
  } catch (e) {
    res.json({ error: e.message });
  }
});

router.post("/set-dp/:user", async (req, res) => {
  try {
    const id = req.params.user;
    const image = req.body.image;

    const user = await User.findById(id);
    user.displayImage = image;
    await user.save();
    res.json({ status: "display image successfully set" })
  } catch (e) {
    res.json({ error: e.message });
  }
});

router.post("/:user/edit-username", async (req, res) => {
  try {
    const id = req.params.user;
    const username = req.body.username;
    console.log(username);

    const user = await User.findById(id);
    user.username = username;
    await user.save();
    res.json({ status: "username successfully changed" });
  } catch (e) {
    res.json({ error: e.message });
  }
});

router.get("/delete/:user", async (req, res) => {
  try {
    const user = await User.findById(req.params.user);
    await user.remove();
    res.status(200).json(user);
  } catch (e) {
    res.json({ error: e.message });
  }
});

router.get("/make-admin/:user", async (req, res) => {
  try {
    const user = await User.update({ _id: req.params.user }, { $set: { userAccessLevel: 3 } });
    //await user.save();
    res.status(200).json({
      status: "User successfully added to admin group"
    });
  } catch (e) {
    res.json({ error: e.message });
  }
});

router.get("/remove-admin/:user", async (req, res) => {
  try {
    const user = await User.update({ _id: req.params.user }, { $set: { userAccessLevel: 7 } });
    //await user.save();
    res.status(200).json({
      status: "User successfully removed to admin group"
    });
  } catch (e) {
    res.json({ error: e.message });
  }
});

module.exports = router;
