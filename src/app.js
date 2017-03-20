const {remote, shell} = require("electron");
const helper = require("./helper");
const pathLib = require("path");

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

Vue.component("btn", {
	props: ["icon", "disabled", "solid"],
	template: `
	<a class = "button" :class = "{'is-disabled': disabled, 'is-outlined': !solid}">
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
				<p class = "modal-card-title">{{name}}</slot></p>
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
});

let upload = new Vue({
	el: "#upload",
	data: {
		show: true,
		blur: false,
		label: "Drag in a folder or click the icon to manually select a folder.",
		supportedExts: supportedExts
	},
	created: () => {
		document.title = `Picasso v${bus.version}`;
		bus.$on("folderEmpty", () => upload.show = true);
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
			bus.folder = folder;
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
		folder: null,
		index: 0,
		media: [],
		currentMedia: null,
		zoomed: false,
		destinations: [],
		toolbar: false,
		modal: null,
		inputValid: false,
		help: [
			["a / &#8592;", "Move left"],
			["d / &#8594;", "Move right"],
			["space", "Toggle video playback"],
			["x", "Trash file"],
			["o / q", "Open destinations"],
			["0-9", "Pick destination"],
			["g", "Jump to file"],
			["r", "Rename file"],
			["z", "Toggle zoom"],
			["esc", "Close popup"]
		]
	},
	created: () => {
		bus.$on("folderReady", (details) => {
			main.folder = bus.folder;
			main.media = details[0];
			if (!(details[1] instanceof Error)) main.destinations = details[1].destinations;
			main.move(0);
			main.show = true;
		});
		bus.$on("clearModal", () => main.modal = null);
	},
	methods: {
		setModal: (modal) => main.modal = modal,
		modalShowing: (modal) => main.modal == modal,
		f: () => main.modalShowing(null),
		toggleVideoPlaying: () => {
			let video = document.querySelector("video");
			video.paused ? video.play() : video.pause();
		},
		rename: () => {
			let newNameWithoutExtension = document.querySelector("input#rename").value;
			let oldFileURL = main.currentMedia.fileURL;
			let newFileURL = oldFileURL.replace(main.currentMedia.name, newNameWithoutExtension);
			helper.rename(oldFileURL, newFileURL)
				.then(() => {
					main.setModal(null);
					main.media[main.index] = newFileURL; // Update cache
					main.move(0); // Reload current image
				})
				.catch(alert);
			main.setModal(null);
		},
		jump: () => {
			let input = document.querySelector("input#jump");
			main.index = input.value - 1;
			main.move(0);
			main.setModal(null);
		},
		open: () => shell.openExternal("file://" + main.currentMedia.fileURL),
		trash: () => {
			// trashLib args must be enclosed in array
			helper.trash([main.media[main.index]])
			.then(() => {
				main.media.splice(main.index, 1);
				main.move(0);
			})
			.catch(alert);
			main.setModal(null);
		},
		move: (increment) => {
			main.toolbar = false; // When the image loads, this will get set back to true
			main.index = main.index + increment;
			if (main.index < 0) main.index = main.media.length - 1;
			if (main.index > main.media.length - 1) main.index = 0;
			if (main.media.length == 0) {
				bus.$emit("folderEmpty");
				main.show = false;
				return;
			}
			helper.getMediaDetails(main.media[main.index])
			.then((details) => {
				main.currentMedia = details;
			})
			.catch((err) => {
				main.index = main.index - increment;
				main.move(0);
				alert(`Couldn't load new media: ${err}`);
			});
		},
		moveToDestination: (destination) => {
			let oldFileURL = main.currentMedia.fileURL;
			let file = `${main.currentMedia.name}.${main.currentMedia.extension}`;
			let newFileURL = pathLib.join(destination, file);
			helper.rename(oldFileURL, newFileURL)
				.then(() => {
					main.media.splice(main.index, 1);
					main.setModal(null);
					main.move(0);
				})
				.catch(alert);
		},
		addDestination: () => {
			remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
				properties: ["openDirectory"]
			}, selectedFolders => {
				if (selectedFolders) {
					main.destinations = main.destinations.concat(selectedFolders);
					main.saveSettings();
				}
			});
		},
		saveSettings: () => {
			let settings = {
				"version": bus.version,
				"destinations": main.destinations
			};
			helper.setSettingsForFolder(main.folder, settings)
			.catch((err) => alert("Error saving settings: " + err));
		},
	}
});