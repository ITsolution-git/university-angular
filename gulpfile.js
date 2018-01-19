const gulp = require('gulp');
const https = require('https');
const fs = require('fs');
const unipaperWritersPortal = process.env.WRITERS_PORTAL_URL || "unipaper-staging.herokuapp.com";

gulp.task('fetch-sitemap', function(cb) {
  var options = {
    hostname: unipaperWritersPortal,
    //port: 3000,
    path: '/fetch-sitemap',
    method: 'GET'
  };

  var req = https.request(options, function(res) {
    var body = '';

    res.on('data', function(data) {
      body += data;
    });

    res.on('end', function() {
      if (res.statusCode > 400) {
        body = "";
      }
      var fileName = "sitemap.xml";
      fs.truncate(fileName, 0, function() {
        fs.writeFile(fileName, body, function() {
          cb();
        });
      });
    });
  })

  req.on('error', function(err) {
    console.log(err);
    cb();
  })

  req.end()
});

gulp.task('default', ['fetch-sitemap'], function() {

});
