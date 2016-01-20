// =======================
// get instance we need
// =======================
$ = jQuery = require('jquery');
var bootstrap = require('bootstrap');
var domready = require('domready');

// =======================
// css
// =======================
var cssify = require('cssify');
cssify.byUrl('//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css');
cssify.byUrl('//maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css');
var styleNode = require('../../public/css/style.css');




// =======================
// finish
// =======================
domready(function() {
  $("body").fadeIn(1000);
})
