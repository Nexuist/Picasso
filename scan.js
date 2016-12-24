"use strict";
let fs = require("fs");
let pathUtil = require("path");
let sizeOf = require("image-size");
let supportedTypes = ["png", "jpg"];

// Called on every file path discovered
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
        return;0
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


module.exports.launch = function launch(startPath, recursively, shouldCancelCallback, progressCallback, successCallback) {
  let media = []; // Holds all entries
  let currentScans = 0; // Includes both folder and file scans
  let maxScans = 256; // Needed to avoid the max I/O open limit imposed by operating systems
  let pendingScans = []; // Holds file paths which have not yet been scanned
  let initialScanComplete = false; // So that scanPending() doesn't end prematurely
  let progress = {
    processed: 0,
    total: 0,
    errors: 0,
    unsupported: 0,
  }; // Reported in progressCallback
  let scanFolder = (path) => {
    console.log("Scanning folder", path);
    currentScans++;
    fs.readdir(path, (err, fileNames) => {
      if (err) {
        console.log("Error reading folder", err);
      }
      else {
        progress.total += fileNames.length;
        pendingScans = pendingScans.concat(fileNames);
      }
      console.log("Finished scanning folder", path);
      currentScans--;
      initialScanComplete = true;
    });
  };
  let scanPending = (waitingPreviously) => {
    if (shouldCancelCallback() || (currentScans == 0 && pendingScans.length == 0 && initialScanComplete)) {
      console.log("Finished");
      successCallback(media);
      return;
    }
    if (pendingScans.length == 0) {
      // No pending scans, but there are scans in progress - wait for them to finish
      console.log("Pending");
      setTimeout(scanPending, 5);
      return;
    }
    if (currentScans < maxScans) {
      // Max scan limit not yet reached
      let file = pendingScans.shift(); // Pop the first element of the array
      scanFile(pathUtil.join(startPath, file), (completed) => {
        switch(completed.type) {
          case "media":
            media.push(completed);
            break;
          case "unsupported":
            progress.unsupported++;
            break;
          case "error":
            progress.errors++;
            console.log("Couldn't read", file, "due to error", completed.error);
            break;
        }
        currentScans--;
        progress.processed++;
        if (recursively && completed.type == "folder") scanFolder(completed.path);
        progressCallback(progress);
      });
      currentScans++;
    }
    else {
      // Max scan limit reached
      let waitTime = 5;
      if (waitingPreviously !== undefined) {
        waitTime = waitingPreviously + (waitingPreviously / 2);
      }
      console.log("Too many scans; waiting till next time", waitTime);
      setTimeout(() => scanPending(waitTime), waitTime);
      return;
    }
    setTimeout(scanPending, 5); // Execute recursively
  };
  scanFolder(startPath);
  setTimeout(scanPending, 20);
};