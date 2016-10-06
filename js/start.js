const {remote, ipcRenderer} = require('electron');
const dialog = remote.dialog;
const browserWindow = remote.getCurrentWindow();

window.$ = require("./js/jquery-3.1.1.min.js");

let makeSelection = (folderPath) => {
	ipcRenderer.send("processFolder", folderPath);
};

window.onload = () => {
	$(document).ready(() => alert("wassup"));
};
// window.onload = () => {
//
// 	document.ondragstart = () => console.log("drag");
//
// 	document.ondragover = document.ondrop = (event) => event.preventDefault(); // By default, the browser location will be changed to the file path of the object dragged in. We don't want that
//
// 	document.body.ondrop = (event) => {
// 		event.preventDefault();
// 		if (!event.dataTransfer.files || !event.dataTransfer.items) return;
// 		var file = event.dataTransfer.files[0]; // dataTransfer.files contains full path
// 		var item = event.dataTransfer.items[0].webkitGetAsEntry(); // dataTransfer.items[0].webkitGetAsEntry() allows us to find out if the uploaded file is a folder
// 		if (!item) return;
// 		if (item.isDirectory) {
// 			makeSelection(file.path);
// 		}
// 		else {
// 			alert("Sorry, you can only choose a folder.");
// 		}
// 	};
//
// 	document.getElementById("manualSelection").onclick = () => {
// 		dialog.showOpenDialog(browserWindow, {
// 			properties: ["openDirectory"]
// 		}, (selectedFolders) => {
// 			if (selectedFolders) makeSelection(selectedFolders[0]); // Only send the first selected folder, if there is one
// 		});
// 	};
// };
