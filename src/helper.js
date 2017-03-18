const fs = require("fs");
const pathLib = require("path");
const trashLib = require("trash");
const sizeLib = require("image-size");

module.exports = {
	getFolder: (path) => {
		return new Promise((resolve, reject) => {
			fs.readdir(path, (err, files) => {
				if (err) return reject(err, null);
				files = files
					.filter((file) => supportedExts.indexOf(pathLib.extname(file).substring(1).toLowerCase()) > -1)
					.map((file) => pathLib.join(path, file)); // Remove unsupported file and apply full path to each file
				var settings, settingsErr;
				fs.readFile(pathLib.join(path, ".picasso"), "utf8", (err, data) => {
					if (err) {
						settingsErr = err;
					}
					else {
						try {
							settings = JSON.parse(data);
						}
						catch (err) {
							settingsErr = err;
						}
					}
					resolve([files, settingsErr ? settingsErr : settings]);
				});
			});
		});
	},
	getMediaPaths: (path) => {
		return new Promise((resolve, reject) => {
			fs.readdir(path, (err, files) => {
				if (err) return reject(err);
				files = files
					.filter((file) => {
						let ext = pathLib.extname(file).substring(1).toLowerCase();
						return supportedFileTypes.indexOf(ext) > -1;
					})
					.map((file) => {
						return pathLib.join(path, file);
					});
				resolve(files);
			});
		});
	},
	getMediaDetails: (path) => {
		return new Promise((resolve, reject) => {
			let fullName = pathLib.basename(path);
			let extension = fullName.split(".").pop().toLowerCase();
			details = {
				name: fullName.split(".")[0],
				extension: extension,
				fileURL: path,
				isVideo: videoExtensions.indexOf(extension) > -1,
				width: "?",
				height: "?",
				size: "?"
			};
			fs.stat(path, (err, stat) => {
				if (err) reject(err);
				details.size = +(stat.size / 100000).toFixed(2); // Convert into MB with 2 decimal places at most
				if (details.isVideo) return resolve(details);
				sizeLib(path, (err, dimensions) => {
					if (err) return reject(err);
					details.width = dimensions.width;
					details.height = dimensions.height;
					resolve(details);
				});
			});
		});
	},
	getSettingsForFolder: (path) => {
		return new Promise((resolve, reject) => {
			fs.readFile(pathLib.join(path, ".picasso"), "utf8", (err, data) => {
				if (err) return reject(err);
				var settings;
				try {
					settings = JSON.parse(data);
				}
				catch (err) {
					return reject(err);
				}
				resolve(settings);
			});
		});
	},
	setSettingsForFolder: (path, settings) => {
		return new Promise((resolve, reject) => {
			fs.writeFile(pathLib.join(path, ".picasso"), JSON.stringify(settings), (err) => {
				err ? reject(err) : resolve();
			});
		});
	},
	trash: (path) => trashLib(path),
	rename: (oldPath, newPath) => {
		return new Promise((resolve, reject) => {
			if (fs.existsSync(newPath)) return reject(`${newPath} already exists.`);
			fs.rename(oldPath, newPath, (err) => {
				err ? reject(err) : resolve();
			});
		});
	}
}