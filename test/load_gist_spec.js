var assert = require("assert"),
    load_gist = require("../web/helpers/load_gist.js");

require('should');

var sepia = require('sepia');

sepia.filter({
  url: /localhost/i,
  forceLive: true
});
sepia.filter({
  url: /graphenedb.com/i,
  forceLive: true
});

describe('load_gist', function(){
  describe('#load_gist()', function(){
    var test_result = function (given_gist_uuid, expected_output_regex, done) {
      load_gist.load_gist(given_gist_uuid, {}, function (err, data) {
        data.should.match(expected_output_regex);
        done();
      });
    }

    it('should load github gists', function(done) {
      this.timeout(10500);
      // https://gist.github.com/peterneubauer/6009066
      test_result('6009066', /^= The Neo4j T-Graph/, done);
    });

    it('should load github repo files', function(done) {
      this.timeout(10500);
      // https://github.com/whatSocks/jobSNV/blob/master/socialNetworks.adoc
      test_result('github-whatSocks/jobSNV//socialNetworks.adoc', /^= Using a Professional Social Network to Target Potential Hires/, done);
    });

    it('should load dropbox files', function(done) {
      this.timeout(10500);
      // https://www.dropbox.com/s/vhtxfibv7ycstrv/BankFraudDetection.adoc.txt?dl=0
      test_result('dropboxs-vhtxfibv7ycstrv/BankFraudDetection.adoc.txt?dl=0', /^= Bank Fraud Detection/, done);
    });

    it('should load copy.com public files', function(done) {
      this.timeout(10500);
      // https://copy.com/7MuhBZKFDsCIPNLp
      test_result('copy-7MuhBZKFDsCIPNLp', /^Analysis over Finance and Portfolio Management/, done);
    });


    it('should load copy.com direct files', function(done) {
      this.timeout(10500);
      // https://copy.com/7MuhBZKFDsCIPNLp/analysis.txt
      test_result('copy-7MuhBZKFDsCIPNLp/analysis.txt', /^Analysis over Finance and Portfolio Management/, done);
    });

    it('should load github blobs', function(done) {
      this.timeout(10500);
      // https://github.com/kbastani/gists/blob/master/meta/TimeScaleEventMetaModel.adoc
      test_result('github-kbastani/gists//meta/TimeScaleEventMetaModel.adoc', /^= Time Scale Event Meta Model/, done);
    });

  })
})

