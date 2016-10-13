var db = require('../config');
var crypto = require('crypto');
var Promise = require('bluebird');
var mongoose = require('mongoose');
mongoose.Promise = Promise;

var Schema = mongoose.Schema;


var linkSchema = new Schema ({
  url: String,
  baseUrl: String,
  code: String,
  title: String,
  visits: {type: Number, default: 0}
}, {
  timestamps: {
    createdAt: 'created_at'
  }
});

linkSchema.pre('save', function(next) {
  var shasum = crypto.createHash('sha1');
  shasum.update(this.url);
  this.code = shasum.digest('hex').slice(0, 5);
  next();
});

var Link = mongoose.model('Link', linkSchema);


// db.linkSchema.methods.initialize = function() {
//   var shasum = crypto.createHash('sha1');
//   shasum.update(this.url);
//   this.code = shasum.digest('hex').slice(0, 5);
// };

// var Link = db.Model.extend({
//   tableName: 'urls',
//   hasTimestamps: true,
//   defaults: { 
//     visits: 0
//   },
//   initialize: function() {
//     this.on('creating', function(model, attrs, options) {
//       var shasum = crypto.createHash('sha1');
//       shasum.update(model.get('url'));
//       model.set('code', shasum.digest('hex').slice(0, 5));
//     });
//   }
// });

module.exports = Link;