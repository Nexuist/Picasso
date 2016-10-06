const {remote, ipcRenderer} = require('electron');
const dialog = remote.dialog;
const browserWindow = remote.getCurrentWindow();

function makeSelection(folderPath) {
	alert("MADE SELECTION: " + folderPath);
}

window.onload = () => {
	document.ondragover = document.ondrop = (event) => event.preventDefault(); // By default, the browser location will be changed to the file path of the object dragged in. We don't want that

	document.body.ondrop = (event) => {
		event.preventDefault();
		if (!event.dataTransfer.files || !event.dataTransfer.items) return;
		var file = event.dataTransfer.files[0]; // dataTransfer.files contains full path
		var item = event.dataTransfer.items[0].webkitGetAsEntry(); // dataTransfer.items[0].webkitGetAsEntry() allows us to find out if the uploaded file is a folder
		if (!item) return;
		if (item.isDirectory) makeSelection(file.path);
	};

	document.getElementById("manualSelection").onclick = () => {
		dialog.showOpenDialog(browserWindow, {
			properties: ["openDirectory"]
		}, (selectedFolders) => {
			if (selectedFolders) makeSelection(selectedFolders[0]); // Only send the first selected folder, if there is one
		});
	};
};
