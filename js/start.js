const remote = require('electron').remote;
const dialog = remote.dialog;
const win = remote.getCurrentWindow();

document.addEventListener("DOMContentLoaded", function() {
	// document.ondragover = document.ondrop = (ev) => {
  // 		ev.preventDefault();
	// };

	document.body.ondrop = (ev) => {
		alert(ev.dataTransfer.files);
  	alert(ev.dataTransfer.files[0].path);
  	ev.preventDefault();
	};

	document.getElementById("choose").onclick = function() {
		dialog.showOpenDialog(win, {
			properties: ["openDirectory"]
		}, (chosen) => {
			alert(chosen);
		});
	};
});
