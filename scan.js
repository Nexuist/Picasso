"use strict";
let fs = require("fs");
let path = require("path");
let sizeOf = require("image-size");
let folderPath = "/Users/Andi/Desktop/Test";
let supportedTypes = ["png", "jpg"];



function scan(folder, errorCallback, progressCallback, successCallback) {
	let media = [];
	fs.readdir(folder, (err, files) => {
		if (err) {
			errorCallback(err, "Unable to read folder: " + folder);
			return;
		}
		let total = files.length;
		files.forEach((file, index) => {
			progressCallback(index + 1, total);
			file = file.toLowerCase();
			let extension = path.extname(file).substring(1);
			if (supportedTypes.indexOf(extension) <= -1) return;
			let filePath = path.join(folderPath, file);
			fs.stat(filePath, (err, stat) => {
				if (err) {
					errorCallback(err, "Unable to get information on file: " + file);
					return;
				}
				if (stat.isDirectory()) return;
				let width = "?", height = "?";
				sizeOf(filePath, (err, dimensions) => {
					if (err) {
						errorCallback(err, "Couldn't get dimensions for file: " + file);
					}
					else {
						width = dimensions.width;
						height = dimensions.height;
					}
					media.push({
						path: file,
						width: width,
						height: height,
						size: stat.size / 1000000.0 // Convert into MB
					});
					if (index == total - 1) successCallback(media);
				});
			});
		});
	});
}


scan(folderPath, (err, msg) => console.log("Encountered error:", msg),
	(i, total) => console.log("Scanning file", i, "of", total),
	(media) => console.log("End result:", media));
