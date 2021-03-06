var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var mongoose = require('mongoose');
mongoose.Promise = Promise;

var Schema = mongoose.Schema;

var userSchema = new Schema ({
  username: {type: String, unique: true},
  password: String,
}, {
  timestamps: {
    createdAt: 'created_at'
  }
});

userSchema.pre('save', function(next) {
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
    .then(function(hash) {
      this.password = hash;
      next();
    });
});

userSchema.methods.comparePassword = function (attemptedPassword, callback) {
  var context = this;
  bcrypt.compare(attemptedPassword, context.password, function(err, isMatch) {
    console.log('was it a match?', isMatch);
    callback(err, isMatch);
  });
};

userSchema.methods.pCompare = Promise.promisify(userSchema.methods.comparePassword);


var User = mongoose.model('User', userSchema);



// var User = db.Model.extend({
//   tableName: 'users',
//   hasTimestamps: true,
//   initialize: function() {
//     this.on('creating', this.hashPassword);
//   },
//   comparePassword: function(attemptedPassword, callback) {
//     bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
//       callback(isMatch);
//     });
//   },
//   hashPassword: function() {
//     var cipher = Promise.promisify(bcrypt.hash);
//     return cipher(this.get('password'), null, null).bind(this)
//       .then(function(hash) {
//         this.set('password', hash);
//       });
//   }
// });

module.exports = User;
