const {remote, webFrame, ipcRenderer} = require("electron"); // External module imports
const helper = require("./helper");
const trashLib = require("trash");

webFrame.setZoomLevelLimits(1, 1); // Disable zooming for the entire window

let supportedFileTypes = ["png", "jpg"];

Vue.component("btn", {
	props: ["icon", "disabled"],
	template: `
		<a class = "button is-outlined" :class = "{ 'is-disabled': disabled }">
			<span class = "icon">
				<i :class = "'fa fa-' + icon"></i>
			</span>
		</a>
	`
});

let root = new Vue({
	el: "#root",
	data: {
		screen: "upload",
		uploadLabel: "Supported Types: " + supportedFileTypes.join(", ").toUpperCase(),
		index: -1,
		images: [],
		toolbarEnabled: false,
		currentImage: null,
		imageZoomed: false
	},
	created: function() {
		// Consider using v-on:drop?
		// document.addEventListener("dragover", event => event.preventDefault());
		// document.addEventListener("drop", this.onFolderDragged);
	},
	methods: {
		folderDragged: function() {
			event.preventDefault();
			if (!event.dataTransfer.files || !event.dataTransfer.items) return;
			let file = event.dataTransfer.files[0]; // Contains full path
			let item = event.dataTransfer.items[0].webkitGetAsEntry(); // Allows us to find out if the uploaded file is a folder
			if (!file || !item) return;
			if (item.isDirectory) {
				this.selectFolder(file.path);
				this.screen = "main";
			}
			else {
				this.uploadLabel = "Sorry, you can only choose a folder.";
			}
		},
		chooseFolderPressed: function() {
			remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
				properties: ["openDirectory"]
			}, selectedFolders => {
				if (selectedFolders) {
					this.selectFolder(selectedFolders[0]);
					this.screen = "main";
				}
			});
		},
		selectFolder: function(folder) {
			helper.getImagePaths(folder)
				.then((images) => {
					root.images = images;
					root.changeImage(1);
				})
				.catch(alert);
		},
		changeImage: function(increment) {
			root.toolbarEnabled = false; // When the image loads, this will get set back to true
			root.index = root.index + increment;
			if (root.index < 0) root.index = root.images.length - 1;
			if (root.index > root.images.length - 1) root.index = 0;
			helper.getImageDetails(root.images[root.index])
				.then((details) => {
					root.currentImage = details;
				})
				.catch(alert)
		},
		trash: function() {
			trashLib([root.images[root.index]])
				.then(() => {
					root.images.splice(root.index, 1);
					if (root.images.length == 0) {
						this.screen = "upload";
					}
					else {
						root.changeImage(1);
					}
				})
				.catch(alert)
		}
	}
});