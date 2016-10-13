var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');

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
  Link.find({})
    .then(function(links) {
      res.status(200).send(links);
    })
    .catch(function(err) {
      console.error('Error in database');
    });

  // Link.find({}, function(err, links) {
  //   if (err) {
  //     console.error('Error in database');
  //   } else {
  //     res.status(200).send(links);
  //   }
  // });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    return res.sendStatus(404);
  }

  Link.findOne({url: uri})
    .then(function(link) {
      if (link) {
        throw new Error('foundLink');
      } else {
        return util.promiseGetUrl(uri);
      }
    })
    .then(function(title) {
      var newLink = Link({
        url: uri,
        title: title,
        baseUrl: req.headers.origin
      });
      return newLink.save();
    })
    .then(function(savedLink) {
      res.status(200).send(savedLink);
    }).catch(function(err) {
      if (err.message = 'foundLink') {
        res.status(200).send(link);
      } else {
        res.sendStatus(404);
      }
    });

  // Link.find({url: uri}, function(err, link) {
  //   if (link.length > 0) {
  //     res.status(200).send(link[0]);
  //   } else {
  //     util.getUrlTitle(uri, function(err, title) {
  //       if (err) {
  //         console.error('Error reading URL heading: ', err);
  //         return res.sendStatus(404);
  //       }
  //       var newLink = Link({
  //         url: uri,
  //         title: title,
  //         baseUrl: req.headers.origin
  //       });

  //       var promise = newLink.save();

  //       promise.then(function(shortLink) {
  //         res.status(200).send(shortLink);
  //       });
  //     });
  //   }
  // });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  var user;
  User.findOne({username: username})
    .then(function(user) {
      if (user) {
        user = user;
        return user.pCompare(password);
      } 
    })
    .then(function(match) {
      if (match) {
        return util.createSession(req, res, user);
      } else {
        return res.redirect('/login');
      }
    })
    .catch(function(err) {
      if (err.message === 'no user') {
        console.log('there was no user!');
        res.redirect('/login');
      } else {
        console.log(err);
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

  User.findOne({username: username})
    .then(function(user) {
      if (user) {
        throw new Error('account exists');
      } else {
        var newUser = User({
          username: username,
          password: password
        });

        return newUser.save();
      }
    })
    .then(function(newUser) {
      util.createSession(req, res, newUser);
    })
    .catch(function(err) {
      if (err.message === 'account exists') {
        res.redirect('/signup');
      } else {
        console.error(err);
      }
    });

  // User.findOne({username: username}, function(err, user) {
  //   if (!user) {
  //     var newUser = User({
  //       username: username,
  //       password: password
  //     });
  //     var promise = newUser.save();
  //     promise.then(function(newUser) {
  //       util.createSession(req, res, newUser);
  //     });
  //   } else {
  //     console.error('Account already exists');
  //     res.redirect('/signup');
  //   }
  // });
};

exports.navToLink = function(req, res) {
  Link.findOne({code: req.params[0]})
    .then(function(link) {
      if (!link) {
        throw new Error('no link');
      } else {
        link.visits += 1;
        return link.save();
      }
    })
    .then(function(updatedLink) {
      res.redirect(updatedLink.url);
    })
    .catch(function(err) {
      if (err === 'no link') {
        res.redirect('/');
      } else {
        console.error(err);
      }
    });

  // Link.findOne({code: req.params[0]}, function(err, link) {
  //   if (!link) {
  //     res.redirect('/');
  //   } else {
  //     link.visits += 1;
  //     var promise = link.save();
  //     promise.then(function(updatedLink) {
  //       var redirectUrl = updatedLink.url;
  //       res.redirect(redirectUrl);
  //     });
  //   }
  // });
};