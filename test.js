var fs = require('fs-extra');
var path = require('path');
var spawn = require('./spawn-as-promised');
var randomstring = require("randomstring");
var q = require('q');
var shortid = require('shortid');
var PDF = require('pdfinfo');

var ITERATIONS = 10;
var command = '/usr/local/callas_pdfaPilot_CLI/pdfaPilot';
var tempDirectory = '/tmp';
var endpoint = 'pdfapilot.example.com:1600';

var generate = function () {
  var unique = shortid.generate();

  var filename = tempDirectory + '/source_' + unique + '.doc';
  var outputfile = tempDirectory + '/destination_' + unique + '.pdf';
  var pdfafile = tempDirectory + '/destination_' + unique + '_PDFA.pdf';
  var hash = randomstring.generate();

  fs.copy('./test.doc', filename, function () {
    var args = ['--dist', '--endpoint=' + endpoint,
        filename, '--level=2b', '--outputfile=' + outputfile, '--overwrite', '--nolocal'];

    spawn(command, args).then(function (result) {
      if (result.code >= 100) {
        console.log('Result code "' + result.code + '" indicates an error');
        return;
      }

      var pdf = PDF(pdfafile);

      pdf.info(function (err, meta) {
        if (err) {
          console.log('Error while validating the PDF');

          fs.copySync(pdfafile, tempDirectory + '/error_' + hash + '.pdf');

          fs.unlinkSync(filename);
          fs.unlinkSync(pdfafile);

          return;
        }

        console.log('File verified...');

        fs.unlinkSync(filename);
        fs.unlinkSync(pdfafile);
      });
    }).fail(function (err) {
      console.log('');
      console.log(err.stdout.join('\n'));
      console.log('');

      fs.unlinkSync(filename);
      fs.unlinkSync(pdfafile);
    });
  });
};

for (var x = 0; x < ITERATIONS; x++) {
  setTimeout(generate, 0);
}
