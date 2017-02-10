const {remote, webFrame, ipcRenderer, shell} = require("electron"); // External module imports
const helper = require("./helper");
const trashLib = require("trash");

//webFrame.setZoomLevelLimits(1, 1); // Disable zooming for the entire window

let bus = new Vue();

let supportedFileTypes = ["png", "jpg", "jpeg", "gif"];

Vue.config.keyCodes = {
	a: 65,
	d: 68,
	o: 79,
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

let root = new Vue({
	el: "#root",
	data: {
		screen: "upload",
		uploadLabel: "Supported Types: " + supportedFileTypes.join(", ").toUpperCase(),
		index: -1,
		images: [],
		toolbarEnabled: false,
		currentImage: null,
		imageZoomed: false,
		activeModal: null
	},
	created: function() {
		// Consider using v-on:drop?
		// document.addEventListener("dragover", event => event.preventDefault());
		// document.addEventListener("drop", this.onFolderDragged);
		bus.$on("clearModal", () => {
			root.activeModal = null;
		});
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
			helper.getImageDetails(root.images[root.index])
			.then((details) => {
				root.currentImage = details;
			})
			.catch(alert);
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
					root.setModal(null);
				}
			})
			.catch(alert);
		},
		openExternal: () => shell.openExternal("file://" + root.currentImage.fileURL),
		setModal: (name) => root.activeModal = name,
		modalShowing: (name) => name == root.activeModal
	}
});