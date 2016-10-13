var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');
// var Users = require('../app/collections/users');
// var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find({}, function(err, links) {
    if (err) {
      console.error('Error in database');
    } else {
      res.status(200).send(links);
    }
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    return res.sendStatus(404);
  }

  Link.find({url: uri}, function(err, link) {
    if (link.length > 0) {
      res.status(200).send(link[0]);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.error('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }
        var newLink = Link({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        });

        var promise = newLink.save();

        promise.then(function(shortLink) {
          res.status(200).send(shortLink);
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({username: username}, function(err, user) {
    if (err) {
    } else if (!user) {
      res.redirect('/login');
    } else if (user) {
      user.comparePassword(password, function(match) {
        if (match) {
          util.createSession(req, res, user);
        } else {
          res.redirect('/login');
        }
      });
    }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  // var query = User.findOne({username: username});

  // var queryPromise = query.exec();

  // queryPromise.then(function(err, user) {
  //   if (!user) {
  //     var newUser = User({
  //       username: username,
  //       password: password
  //     });
  //     console.log('this is the newUser', newUser);
  //     var promise = newUser.save();
  //     promise.then(function(newUser) {
  //       console.log('this is the new User');
  //       util.createSession(req, res, newUser);
  //     });
  //   } else {
  //     console.error('Account already exists');
  //     res.redirect('/signup');
  //   }


  // });

  User.findOne({username: username}, function(err, user) {
    if (!user) {
      var newUser = User({
        username: username,
        password: password
      });
      var promise = newUser.save();
      promise.then(function(newUser) {
        util.createSession(req, res, newUser);
      });
    } else {
      console.error('Account already exists');
      res.redirect('/signup');
    }
  });
};

exports.navToLink = function(req, res) {
  Link.findOne({code: req.params[0]}, function(err, link) {
    if (!link) {
      res.redirect('/');
    } else {
      link.visits += 1;
      var promise = link.save();
      promise.then(function(updatedLink) {
        var redirectUrl = updatedLink.url;
        res.redirect(redirectUrl);
      });
    }
  });
};