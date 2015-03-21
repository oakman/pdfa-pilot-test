var cp = require('child_process');
var q = require('q');
var _ = require('underscore-node');
var logger = require('winston');

function clean(data) {
  // first replace all the \r with nothing
  var result = data.replace(/(\r)/gm, "");

  // then replace all tabs with blanks
  result = result.replace(/(\t)/gm, " ");

  // then split the string into an array
  var array = result.split('\n');

  // trim all the individual lines
  array = _.map(array, function (entry) {
    return entry.trim();
  });

  // only return the lines that actually contains something
  return _.filter(array, function (entry) {
    return entry && entry.length > 0;
  });
}

function spawn(command, args, options) {
  var process;
  var stderr = '';
  var stdout = '';
  var deferred = q.defer();

  process = cp.spawn(command, args, options);

  logger.debug('Spawning command: ' + command);
  logger.debug('Arguments: ' + args.join(' '));
  logger.debug('Options: ' + options);

  process.stdout.on('data', function (data) {
    data = data.toString();
    deferred.notify(data);
    stdout += data;
  });

  process.stderr.on('data', function (data) {
    data = data.toString();
    deferred.notify(data);
    stderr += data;
  });

  // Listen to the close event instead of exit
  // They are similar but close ensures that streams are flushed
  process.on('exit', function (code) {
    var fullCommand = command;
    fullCommand += args.length ? ' ' + args.join(' ') : '';

    if (code >= 100) {
      // Generate the full command to be presented in the error message
      if (!Array.isArray(args)) {
        args = [];
      }

      // Build the error instance
      return deferred.reject({
        message: 'Failed to spawn "' + fullCommand,
        code: code,
        stdout: clean(stdout),
        stderr: clean(stderr)
      });
    }

    return deferred.resolve({
      stdout: clean(stdout),
      stderr: clean(stderr),
      code: code,
      command: fullCommand
    });
  });

  return deferred.promise;
}

module.exports = spawn;