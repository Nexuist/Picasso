const {remote} = require("electron");
const helper = require("./helper");

let bus = new Vue();
let supportedExts = ["png", "jpg", "jpeg", "gif", "mp4", "webm"];
let videoExts = ["webm", "mp4"];

let upload = new Vue({
	el: "#upload",
	data: {
		show: true,
		blur: false,
		label: "Drag in a folder or click the icon to manually select a folder.",
		supportedExts: supportedExts
	},
	methods: {
		folderDragged: () => {
			upload.blur = false;
			if (!event.dataTransfer.files || !event.dataTransfer.items) return;
			let file = event.dataTransfer.files[0]; // Contains full path
			let item = event.dataTransfer.items[0].webkitGetAsEntry(); // Allows us to find out if the uploaded file is a folder
			if (!file || !item) return;
			item.isDirectory ? upload.selectFolder(file.path) : upload.label = "Sorry, you can only choose a folder.";
		},
		iconClicked: () => {
			upload.blur = true;
			remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
				properties: ["openDirectory"]
			}, selectedFolders => {
				upload.blur = false;
				if (selectedFolders) upload.selectFolder(selectedFolders[0]);
			});
		},
		selectFolder: (folder) => {
			helper.getFolder(folder)
			.then((details) => {
				upload.show = false;
				bus.$emit("folderReady", details);
			})
			.catch((err) => {
				alert("Couldn't use folder: " + err);
			});
		}
	}
});

let main = new Vue({
	el: "#main",
	data: {
		show: false
	},
	created: () => {
		bus.$on("folderReady", (details) => {
			main.show = true;
			console.log(details);
		});
	}
});