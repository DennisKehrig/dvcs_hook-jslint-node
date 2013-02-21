/*jslint strict: false, maxerr: 5, maxlen: 80, indent: 2*/
/*global process: false, require: false */

(function () {
  var jslintPath = process.argv[2],
      repoType = process.argv[3],
      exec = require('child_process').exec,
      spawn = require('child_process').spawn,
      utils = require("util"),
      jsExtRegExp = /\.js\s*$/,
      okRegExp = /No problems found/,
      gitModRegExp = /(new file|modified)\:\s*(\S+\.js)\s*/,
      gitNotUpdated = "Changed but not updated",
      gitUntracked = "Untracked files:",
      dvCmd = repoType === "hg" ? "hg status" : "git status",
      processStatus, getHgFiles, getGitFiles, processFiles;
  
  (function () {
    if (repoType !== "hg" && repoType !== "git") {
      throw "Unsupported repo type: " + repoType + 
        ". Valid values are hg or git.";
    }
    //Get list of changed files.
    exec(dvCmd, function (error, stdout, stderr) {
      processStatus(stdout.split("\n"));
    });
  }());
  
  processStatus = function (lines) {
    var fn;
    if (lines.length) {
      if (repoType === "hg") {
        fn = getHgFiles;
      } else if (repoType === "git") {
        fn = getGitFiles;
      }
      processFiles(fn(lines));
    }
  };
  getHgFiles = function (lines) {
    var files = [];
    lines.forEach(function (line) {
      if ((line.charAt(0) === "A" || line.charAt(0) === "M") && 
          jsExtRegExp.test(line)) {
        //Added or modified JS file, add to list.
        files.push(line.substring(2, line.length));
      }
    });
    return files;
  };
  getGitFiles = function (lines) {
    var files = [];
    lines.forEach(function (line) {
      if ((line.indexOf(gitNotUpdated) !== -1) || 
          (line.indexOf(gitUntracked) !== -1)) {
        return;
      }
      var match = gitModRegExp.exec(line);
      if (match) {
        files.push(match[2]);
      }
    });
    return files;
  };
  processFiles = function (files) {
    var left = 0;
    var errorsFound = 0;
    
    var done = function (wasError) {
      if (wasError) {
        errorsFound++;
      }
      
      left--;
      if (left) { return; }
      
      console.log("JSLint errors: " + errorsFound);
      setTimeout(function () {
        process.exit(errorsFound);
      }, 50);
    };
    
    var checkedFiles = {};
    
    files.forEach(function (file) {
      if (checkedFiles[file]) { return; }
      checkedFiles[file] = true;
      left++;
      
      var sub = spawn("node", [jslintPath, file]);
      var stdout = [];
      
      sub.stdout.on("data", function (data) {
        stdout.push(data.toString().replace(/^\s+$/, ""));
      });
      sub.stderr.on("data", function (data) {
        console.log("stderr: " + data);
      });
      sub.on("exit", function (code) {
        if (code) {
          console.log(stdout.join(""));
        }
        done(code);
      });
    });
  };
}());
