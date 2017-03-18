const {remote} = require("electron");
const helper = require("./helper");

let bus = new Vue();
bus.version = require("./package.json").version;
let supportedExts = ["png", "jpg", "jpeg", "gif", "mp4", "webm"];
let videoExts = ["webm", "mp4"];

Vue.config.keyCodes = {
	numeric: [49, 50, 51, 52, 53, 54, 55, 56, 57, 48],
	space: 32,
	left: [65, 37],
	right: [68, 39],
	a: 65,
	d: 68,
	g: 71,
	o: 79,
	q: 81,
	r: 82,
	x: 88,
	z: 90
};

let upload = new Vue({
	el: "#upload",
	data: {
		show: true,
		blur: false,
		label: "Drag in a folder or click the icon to manually select a folder.",
		supportedExts: supportedExts
	},
	created: () => document.title = `Picasso v${bus.version}`,
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
		show: false,
		media: [],
		currentMedia: null,
		destinations: []
	},
	created: () => {
		bus.$on("folderReady", (details) => {
			main.media = details[0];
			if (!(details[1] instanceof Error)) main.destinations = details[1].destinations;
			main.show = true;
		});
	}
});