var assert = require("assert");
var jsdom = require('jsdom');

require('should');


with_environment = function (callback) {
  jsdom.env({
    html: '',
    scripts: [
      '/Users/brian/github/neo4j-contrib/graphgist-cms/web/dist/assets/js/jquery-2.0.3.min.js',
      '/Users/brian/github/neo4j-contrib/graphgist-cms/web/dist/assets/js/gist.js'
    ],
    done: callback
  })
}

describe('Gist', function(){
  describe('#gist_uuid()', function(){

    var test_result = function (given_url, expected_result, done) {
        with_environment(function (errors, window) {
            var url = 'https://gist.github.com/cheerfulstoic/7e8ec61f9104017430af'
            var result = '7e8ec61f9104017430af'

            var gist = new window.Gist(window.$, window.$('#content'));

            gist.gist_uuid(given_url).should.equal(expected_result)

            done()
          });
    }

    it('handles GitHub gists', function(done) {
      test_result('https://gist.github.com/cheerfulstoic/7e8ec61f9104017430af',
                  '7e8ec61f9104017430af',
                  done);
    });

    it('handle GraphGists stored in GitHub', function(done) {
      test_result('https://github.com/whatSocks/jobSNV/blob/master/socialNetworks.adoc',
                  'github-whatSocks/jobSNV/socialNetworks.adoc',
                  done);

    });

    it('handle Dropbox share links', function(done) {
      test_result('https://www.dropbox.com/s/vhtxfibv7ycstrv/BankFraudDetection.adoc.txt?dl=0',
                  'dropboxs-vhtxfibv7ycstrv/BankFraudDetection.adoc.txt?dl=0',
                  done);
    });

    it('handles Etherpad', function(done) {
      test_result('http://beta.etherpad.org/p/IudqLHvuRj',
                  'epp-beta.etherpad.org-IudqLHvuRj',
                  done);
    });

    it('handles copy.com normal links', function(done) {
      test_result('https://copy.com/7MuhBZKFDsCIPNLp/analysis.txt',
                  'copy-7MuhBZKFDsCIPNLp/analysis.txt',
                  done);
    });

    it('handles copy.com s/ links', function(done) {
      test_result('https://copy.com/s/7MuhBZKFDsCIPNLp/analysis.txt',
                  'copy-s/7MuhBZKFDsCIPNLp/analysis.txt',
                  done);
    });


'http://beta.etherpad.org/p/IudqLHvuRj/export/txt'
'epp-beta.etherpad.org-txt' // WRONG

  })
})


