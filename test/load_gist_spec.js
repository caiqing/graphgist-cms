var assert = require("assert"),
    load_gist = require("../web/helpers/load_gist.js");

require('should');

var sepia = require('sepia');

sepia.filter({
  url: /localhost/i,
  forceLive: true
});

describe('load_gist', function(){
  describe('#load_gist()', function(){
    it('should find github gists', function(done) {
      this.timeout(10500);
      // https://gist.github.com/peterneubauer/6009066
      load_gist.load_gist('6009066', {}, function (err, data) {
        data.should.match(/^= The Neo4j T-Graph/);
        done();
      });
    });

    // https://github.com/kbastani/gists/blob/master/meta/TimeScaleEventMetaModel.adoc
    it('should find github blobs', function(done) {
      this.timeout(10500);
      load_gist.load_gist('github-kbastani/gists//meta/TimeScaleEventMetaModel.adoc', {}, function (err, data) {
        data.should.match(/^= Time Scale Event Meta Model/);
        done();
      });
    });
  })
})

