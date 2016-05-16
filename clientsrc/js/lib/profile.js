var $ = require('jquery');
var config = require('config');
var error = require('../error');
var Dropzone = require('dropzone');

var $dom = $('#template-profile');

module.exports = {
  show: show,
  hide: hide
}

function show() {
  return new Promise(function(resolve, reject) {
    Promise.resolve()
      .then(eventBind)
      .then(function() {
        return new Promise(function(resolve, reject) {
          var dropzone = new Dropzone($dom.find('div#clickable')[0], {
            url: '/local/api/profile/upload',
            previewsContainer: $dom.find('div#avatar')[0],
            parallelUploads: 1,
            thumbnailWidth: 120,
            thumbnailHeight: 120
          });

          dropzone.on('success', function(file, id) {
            $dom.find('div#clickable').remove();
          });
          resolve();

        })
      })
      .then(function() {
        $dom.fadeIn(config.get('Client.fadeInterval')).promise().done(resolve);
      })
      .catch(reject)
    ;
  });
}

function hide() {
  return new Promise(function(resolve, reject) {
    Promise.resolve()
      .then(resolve)
    ;
  });
}

function eventBind() {
  return new Promise(function(resolve, reject) {
    $dom.on('click', '.btn-role-add', function(e) {
    });


    resolve();
  });
}
