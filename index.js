var officegen = require('officegen');
var fs = require('fs-extra');
var path = require('path');
// var spawn = require('child_process').spawn;
var spawn = require('./spawn-as-promised');
var randomstring = require("randomstring");
var q = require('q');
var shortid = require('shortid');
var tika = require('tika');
var PDF = require('pdfinfo');

var ITERATIONS = 30;

var generate = function () {
  var unique = shortid.generate();

  var filename = '/tmp/source_' + unique + '.docx';
  var outputfile = '/tmp/destination_' + unique + '.pdf';
  var pdfafile = '/tmp/destination_' + unique + '_PDFA.pdf';

  var docx = officegen('docx');
  docx.setMaxListeners(0);

  var out = fs.createWriteStream(filename);
  out.setMaxListeners(0);

  var hash = randomstring.generate();

  docx.setDocTitle(hash);

  var obj = docx.createP();
  obj.options.align = 'center';
  obj.addText('This is a test document', {
    bold: true,
    underline: true
  });

  docx.on('finalize', function () {
    out.end();
  }).on('error', function (err) {
    console.log(err);
  });

  out.on('finish', function () {
    var command = '/usr/local/callas_pdfaPilot_CLI/pdfaPilot';
    var args = ['--dist', '--endpoint=pdfapilot.example.com:1600 ',
        filename, '--level=2b', '--outputfile=' + outputfile, '--overwrite', '--nolocal'];

    spawn(command, args).then(function (result) {
      if (result.code >= 100) {
        console.log('Result code "' + result.code + '" indicates an error');
        return;
      }

      var pdf = PDF(pdfafile);

      pdf.info(function (err, meta) {
        if (err) {
          fs.copySync(pdfafile, '/tmp/error.pdf');

          fs.unlinkSync(filename);
          fs.unlinkSync(pdfafile);

          throw err;
        }

        if (meta.title !== hash) {
          fs.copySync(pdfafile, '/tmp/error.pdf');

          throw new Error('The file that\'s converted is not the same as the source!');
        }

        console.log('File verified...');

        fs.unlinkSync(filename);
        fs.unlinkSync(pdfafile);
      });
    }).fail(function (err) {
      console.log(err);

      fs.unlinkSync(filename);
      fs.unlinkSync(pdfafile);
    });
  }).on('error', function (err) {
    console.log(err);

    fs.unlinkSync(filename);
    fs.unlinkSync(pdfafile);
  }).on('open', function () {
    docx.generate(out);
  });
};

for (var x = 0; x < ITERATIONS; x++) {
  setTimeout(generate, 0);
}
