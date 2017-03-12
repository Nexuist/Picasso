const {remote, webFrame, ipcRenderer, shell} = require("electron"); // External module imports
const helper = require("./helper");
const pathLib = require("path");

let bus = new Vue(); // Used to communicate between instances (mainly the modal and root ones)

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

/*
	data:
		version (int) - Shown on upload page
		screen (string) - Shows either upload or main page
		supportedFileTypes [string] - Self explanatory
		helpLabel (string) - Shown under icon on upload page
		activeBlur (boolean) - Whether to blur the upload page or not (for when a file is dragged over it)
		index (int) - Current index in media
		media [string] - Array of image/video paths from current folder
		destinations [string] - Array of folders loaded from settings
		toolbarEnabled (boolean) - Self explanatory, toolbar is disabled between media loads
		currentFolder (string) - Self explanatory
		currentMedia (Object) - 
			name - Media name sans extension
			extension - Self explanatory
			fileURL - Full URL to media
			isVideo - Whether media is video or not
			width - Self explanatory
			height - Self explanatory
			size - Media file size in megabytes
		imageZoomed (boolean) - Used to determine which set of CSS to use for image
		currentModal (string) - Name of modal being shown, if there is any
		inputValid (boolean) - Used to determine outline of input boxes in modal forms
	methods:
		folderDragged() - Called when a folder is dropped into the upload screen
		chooseFolderPressed() - Called when the button to select a folder is pressed in the upload screen
		selectFolder() - Finalizes the folder to use for the main screen. Loads settings and media and switches to main screen
		changeMedia(int increment) - Adds increment to index and loads the media at that index
		jump() - Changes index to the current value in the jump modal input box and loads the media at that location
		trash() - Trashes the media at the current index
		rename(string newNameWithoutExtension) - Renames the current media
		toggleVideoPlaying() - Self explanatory
		openExternal() - Opens the fileURL in the operating system's handler of choice
		setModal(string name) - Self explanatory
		modalShowing(string name) - Whether name is the currentModal or not
		moveToDestination(string destination) - Moves the current media to the folder specified
		addDestination() - Prompt the user to select folders to add them to destinations, and saves the new settings
		saveSettings() - Saves the current settings to a file ".picasso" in the currentFolder
		say(string msg) - Logs a message to console
*/
let root = new Vue({
	el: "#root",
	data: {
		version: 1.5,
		screen: "upload",
		supportedFileTypes: supportedFileTypes,
		helpLabel: "Drag in a folder or click the icon to manually select a folder.",
		activeBlur: false,
		index: -1,
		media: [],
		destinations: [],
		toolbarEnabled: false,
		currentFolder: null,
		currentMedia: null,
		imageZoomed: false,
		currentModal: null,
		inputValid: false
	},
	created: function() {
		bus.$on("clearModal", () => {
			root.currentModal = null;
		});
	},
	methods: {
		folderDragged: function() {
			if (!event.dataTransfer.files || !event.dataTransfer.items) return;
			let file = event.dataTransfer.files[0]; // Contains full path
			let item = event.dataTransfer.items[0].webkitGetAsEntry(); // Allows us to find out if the uploaded file is a folder
			if (!file || !item) return;
			item.isDirectory ? root.selectFolder(file.path) : root.helpLabel = "Sorry, you can only choose a folder.";
		},
		chooseFolderPressed: function() {
			remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
				properties: ["openDirectory"]
			}, selectedFolders => {
				if (selectedFolders) {
					root.selectFolder(selectedFolders[0]);
				}
			});
		},
		selectFolder: function(folder) {
			helper.getImagePaths(folder)
			.then((media) => {
				if (media.length == 0) {
					throw new Error("No supported files found in directory");
				}
				else {
					helper.getSettingsForFolder(folder)
						.then((settings) => root.destinations = settings.destinations)
						.catch((err) => {
							if (err.code === "ENOENT") return;
							alert("Problem while loading settings: " + err);
						});
					root.currentFolder = folder;
					root.media = media;
					root.changeMedia(1);
					root.screen = "main";
				}
			})
			.catch(alert);
		},
		changeMedia: function(increment) {
			root.toolbarEnabled = false; // When the image loads, this will get set back to true
			root.index = root.index + increment;
			if (root.index < 0) root.index = root.media.length - 1;
			if (root.index > root.media.length - 1) root.index = 0;
			if (root.media.length == 0) {
				root.screen = "upload";
				return;
			}
			helper.getMediaDetails(root.media[root.index])
			.then((details) => {
				root.currentMedia = details;
			})
			.catch(null);
			// Find a better solution later
			// .catch((err) => {
			// 	alert(`Error while loading new image: ${err}`);
			// 	root.changeMedia(1);
			// });
		},
		jump: function() {
			let input = document.querySelector('input#jump');
			root.index = input.value - 1;
			root.changeMedia(0);
			root.setModal(null);
		},
		trash: function() {
			helper.trash([root.media[root.index]])
			.then(() => {
				root.setModal(null);
				root.media.splice(root.index, 1);
				if (root.media.length == 0) {
					root.screen = "upload";
				}
				else {
					root.changeMedia(1);
				}
			})
			.catch(alert);
		},
		rename: function(newNameWithoutExtension) {
			let oldFileURL = root.currentMedia.fileURL;
			let newFileURL = oldFileURL.replace(root.currentMedia.name, newNameWithoutExtension);
			helper.rename(oldFileURL, newFileURL)
				.then(() => {
					root.setModal(null);
					root.media[root.index] = newFileURL; // Update cache
					root.changeMedia(0); // Reload current image
				})
				.catch(alert);
		},
		toggleVideoPlaying: () => {
			let video = document.querySelector("video");
			video.paused ? video.play() : video.pause();
		},
		openExternal: () => shell.openExternal("file://" + root.currentMedia.fileURL),
		setModal: (name) => root.currentModal = name,
		modalShowing: (name) => name == root.currentModal,
		moveToDestination: (destination) => {
			let oldFileURL = root.currentMedia.fileURL;
			let file = `${root.currentMedia.name}.${root.currentMedia.extension}`;
			let newFileURL = pathLib.join(destination, file);
			helper.rename(oldFileURL, newFileURL)
				.then(() => {
					root.media.splice(root.index, 1);
					root.setModal(null);
					root.changeMedia(0);
				})
				.catch(alert)
		},
		addDestination: () => {
			remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
				properties: ["openDirectory"]
			}, selectedFolders => {
				if (selectedFolders) {
					root.destinations = root.destinations.concat(selectedFolders);
					root.saveSettings();
				}
			});
		},
		saveSettings: () => {
			let settings = {
				"version": root.version,
				destinations: root.destinations
			};
			helper.setSettingsForFolder(root.currentFolder, settings)
				.catch(alert);
		},
		say: (msg) => console.log(msg)
	}
});