const fs = require("fs");
const pathLib = require("path");
const sizeOf = require("image-size");

module.exports = {
	getImagePaths: (folder) => {
		return new Promise((resolve, reject) => {
			fs.readdir(folder, (err, files) => {
				if (err) return reject(err);
				files = files
					.filter((file) => {
						let ext = pathLib.extname(file).substring(1).toLowerCase();
						return supportedFileTypes.indexOf(ext) > -1;
					})
					.map((file) => {
						return pathLib.join(folder, file);
					});
				resolve(files);
			});
		});
	},
	getImageDetails: (path) => {
		return new Promise((resolve, reject) => {
			details = {
				name: pathLib.basename(path),
				fileURL: path,
				width: "?",
				height: "?",
				size: "?"
			}
			fs.stat(path, (err, stat) => {
				if (err) return reject(err);
				details.size = +(stat.size / 100000).toFixed(2); // Convert into MB with 2 decimal places at most
				sizeOf(path, (err, dimensions) => {
					if (err) return reject(err);
					details.width = dimensions.width;
					details.height = dimensions.height;
					resolve(details);
				});
			});
		});
	}
}