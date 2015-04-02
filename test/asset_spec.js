var fs = require('fs');

require('should');

describe('assets', function(){

  it('should be the case that all.js is newer than all other non all*.js files', function(done) {
    var dir_path = 'web/dist/assets/js';
    var files = fs.readdirSync(dir_path);

    alljs_stat = fs.statSync(dir_path + '/all.js');

    for (file in files) {
      file = files[file]
      if (file.match(/\.js$/) && !file.match(/^all/)) {
        stat = fs.statSync(dir_path + '/' + file)

        alljs_stat.mtime.should.be.greaterThan(stat.mtime)
      }
    }

    done()
  });

})


