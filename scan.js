"use strict";
let fs = require("fs");
let pathUtil = require("path");
let sizeOf = require("image-size");
let folderPath = "/Users/Andi/Applications/";
let supportedTypes = ["png", "jpg"];

function scanFile(path, completeCallback) {
  fs.stat(path, (err, stat) => {
    if (err) {
      completeCallback({
        type: "error",
        error: err
      });
      return;
    }
    if (stat.isDirectory()) {
      completeCallback({
        type: "folder",
        path: path
      });
      return;
    }
    let ext = pathUtil.extname(path).substring(1);
    if (supportedTypes.indexOf(ext) <= -1) {
      completeCallback({
        type: "unsupported",
        path: path
      }); 
      return;
    }
    let width = "?", height = "?";
    sizeOf(path, (err, dimensions) => {
      if (err) {
        completeCallback({
          type: "error",
          error: err
        });
        return;
      }
      width = dimensions.width;
      height = dimensions.height;
      completeCallback({
        type: "media",
        path: path,
        height: height,
        width: width,
        size: stat.size / 100000 // Convert into mB
      });
    });
  });
}

module.exports.launch = function launch(startPath, recursively, progressCallback, successCallback) {
  let media = [];
  let progress = {
    leftToProcess: 0,
    errors: 0,
    unsupported: 0,
    scans: 0
  };
  function subScan(path) {
    progress.scans++;
    fs.readdir(path, (err, files) => {
      if (err) {
        console.log("Error reading folder", err);
        progress.scans--;
        return;
      }
      let i = 0;
      let total = files.length;
      progress.leftToProcess += total;
      files.forEach((file, index) => {
        let filePath = pathUtil.join(path, file);
        scanFile(filePath, (completed) => {
          switch(completed.type) {
            case "media":
              media.push(completed);
              break;
            case "unsupported":
              progress.unsupported++;
              break;
            case "error":
              progress.errors++;
              console.log("Couldn't read", filePath, "due to error", completed.error);
              break;
            case "folder":
              if (recursively) subScan(completed.path);
              break;
          }
          i++;
          progress.leftToProcess--;
          progressCallback(progress);
          if (i >= total) progress.scans--; // When a directory is fully walked, all files will have been processed until another directory is encountered
          if (progress.scans == 0) successCallback(media); // All done now
        });
      });
    });
  }
  subScan(startPath);
}