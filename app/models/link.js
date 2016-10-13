var db = require('../config');
var crypto = require('crypto');
var mongoose = require('mongoose');

db.linkSchema.post('init', function(doc) {
  var shasum = crypto.createHash('sha1');
  shasum.update(doc.url);
  doc.code = shasum.digest('hex').slice(0, 5);
});

var Link = mongoose.model('Link', db.linkSchema);


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