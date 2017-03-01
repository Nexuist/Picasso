const {remote, webFrame, ipcRenderer, shell} = require("electron"); // External module imports
const helper = require("./helper");
const pathLib = require("path");

//webFrame.setZoomLevelLimits(1, 1); // Disable zooming for the entire window

let bus = new Vue();

let supportedFileTypes = ["png", "jpg", "jpeg", "gif", "mp4", "webm"];

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

Vue.component("btn", {
	props: ["icon", "disabled", "solid"],
	template: `
	<a class = "button" :class = "{ 'is-disabled': disabled, 'is-outlined': !solid }">
		<span v-if = "icon" class = "icon">
			<i :class = "'fa fa-' + icon"></i>
		</span>
		<slot name = "text"></slot>
	</a>
	`
});

Vue.component("modal", {
	props: ["active", "name"],
	methods: {
		clearModal: () => bus.$emit("clearModal")
	},
	template: `
	<div class = "modal" :class = "{ 'is-active': active }">
		<div class = "modal-background"></div>
		<div class = "modal-card">
			<header class = "modal-card-head">
				<p class = "modal-card-title">{{ name }}</slot></p>
				<a class = "button delete" v-on:click = "clearModal"></a>
			</header>
			<section class = "modal-card-body">
				<slot name = "body"></slot>
			</section>
			<footer class = "modal-card-foot">
				<slot name = "footer"></slot>
				<br/>
				<btn v-on:click.native = "clearModal">
					<p slot = "text">Cancel</p>
				</btn>
			</footer>
		</div>
	</div>
	`
})

//uploadLabel: "Currently supported file types: " + supportedFileTypes.join(", ").toUpperCase(),
let root = new Vue({
	el: "#root",
	data: {
		screen: "upload",
		supportedFileTypes: supportedFileTypes,
		helpLabel: "Drag in a folder or click the icon to manually select a folder.",
		index: -1,
		images: [],
		sortingFolders: [],
		toolbarEnabled: false,
		currentFolder: null,
		currentImage: null,
		imageZoomed: false,
		activeModal: null,
		inputValid: false,
		folderCurrentlyBeingDragged: false,
		version: 1.5
	},
	created: function() {
		// Consider using v-on:drop?
		// document.addEventListener("dragover", event => event.preventDefault());
		// document.addEventListener("drop", this.folderDragged);
		bus.$on("clearModal", () => {
			root.activeModal = null;
		});
	},
	methods: {
		folderDragged: function() {
			if (!event.dataTransfer.files || !event.dataTransfer.items) return;
			let file = event.dataTransfer.files[0]; // Contains full path
			let item = event.dataTransfer.items[0].webkitGetAsEntry(); // Allows us to find out if the uploaded file is a folder
			if (!file || !item) return;
			if (item.isDirectory) {
				this.selectFolder(file.path);
			}
			else {
				this.helpLabel = "Sorry, you can only choose a folder.";
			}
		},
		chooseFolderPressed: function() {
			remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
				properties: ["openDirectory"]
			}, selectedFolders => {
				if (selectedFolders) {
					this.selectFolder(selectedFolders[0]);
				}
			});
		},
		selectFolder: function(folder) {
			helper.getImagePaths(folder)
			.then((images) => {
				if (images.length == 0) {
					throw new Error("No supported files found in directory");
				}
				else {
					helper.getSettingsForFolder(folder)
						.then((settings) => root.sortingFolders = settings.sortingFolders)
						.catch((err) => {
							if (err.code === "ENOENT") return;
							alert("Problem while loading settings: " + err);
						});
					root.currentFolder = folder;
					root.images = images;
					root.changeImage(1);
					this.screen = "main";
				}
			})
			.catch(alert);
		},
		changeImage: function(increment) {
			root.toolbarEnabled = false; // When the image loads, this will get set back to true
			root.index = root.index + increment;
			if (root.index < 0) root.index = root.images.length - 1;
			if (root.index > root.images.length - 1) root.index = 0;
			if (root.images.length == 0) {
				root.screen = "upload";
				return;
			}
			helper.getMediaDetails(root.images[root.index])
			.then((details) => {
				root.currentImage = details;
			})
			.catch(null);
			// Find a better solution later
			// .catch((err) => {
			// 	alert(`Error while loading new image: ${err}`);
			// 	root.changeImage(1);
			// });
		},
		jump: function() {
			let input = document.querySelector('input#jump');
			root.index = input.value - 1;
			root.changeImage(0);
			root.setModal(null);
		},
		trash: function() {
			helper.trash([root.images[root.index]])
			.then(() => {
				root.setModal(null);
				root.images.splice(root.index, 1);
				if (root.images.length == 0) {
					this.screen = "upload";
				}
				else {
					root.changeImage(1);
				}
			})
			.catch(alert);
		},
		rename: function(newNameWithoutExtension) {
			let oldFileURL = root.currentImage.fileURL;
			let newFileURL = oldFileURL.replace(root.currentImage.name, newNameWithoutExtension);
			helper.rename(oldFileURL, newFileURL)
				.then(() => {
					root.setModal(null);
					root.images[root.index] = newFileURL; // Update cache
					root.changeImage(0); // Reload current image
				})
				.catch(alert);
		},
		saveSettings: () => {
			let settings = {
				"version": "1.0",
				sortingFolders: root.sortingFolders
			};
			helper.setSettingsForFolder(root.currentFolder, settings)
				.catch(alert);
		},
		addDestination: () => {
			remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
				properties: ["openDirectory"]
			}, selectedFolders => {
				if (selectedFolders) {
					root.sortingFolders = root.sortingFolders.concat(selectedFolders);
					root.saveSettings();
				}
			});
		},
		moveToDestination: (destination) => {
			let oldFileURL = root.currentImage.fileURL;
			let file = `${root.currentImage.name}.${root.currentImage.extension}`;
			let newFileURL = pathLib.join(destination, file);
			helper.rename(oldFileURL, newFileURL)
				.then(() => {
					root.images.splice(root.index, 1);
					root.setModal(null);
					root.changeImage(0);
				})
				.catch(alert)
		},
		toggleVideoPlaying: () => {
			let video = document.querySelector("video");
			video.paused ? video.play() : video.pause();
		},
		openExternal: () => shell.openExternal("file://" + root.currentImage.fileURL),
		setModal: (name) => root.activeModal = name,
		modalShowing: (name) => name == root.activeModal,
		say: (msg) => console.log(msg)
	}
});