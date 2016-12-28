const {remote, webFrame, ipcRenderer} = require("electron");
let scanner = remote.require("./js/scan");

webFrame.setZoomLevelLimits(1, 1); // Disable zooming for the entire window
//remote.getCurrentWindow().toggleDevTools(); // DEBUG

let supportedTypes = ["png", "jpg"];
let bus = new Vue();

Vue.component("UploadViewController", {
	template: "#UploadView",
	data: () => {
		return {
			label: "Supported Types: " + supportedTypes.join(", ").toUpperCase(),
			recursively: true
		};
	},
	created: function() {
		document.addEventListener("dragover", event => event.preventDefault());
		document.addEventListener("drop", this.onDrop);
	},
	methods: {
		onDrop: function() {
			let vm = this;
			event.preventDefault();
			if (!event.dataTransfer.files || !event.dataTransfer.items) return;
			let file = event.dataTransfer.files[0]; // Contains full path
			let item = event.dataTransfer.items[0].webkitGetAsEntry(); // Allows us to find out if the uploaded file is a folder
			if (!file || !item) return;
			if (item.isDirectory) {
				vm.finalize(file.path);
			}
			else {
				vm.label = "Sorry, you can only choose a folder.";
			}
		},
		manualUpload: function() {
			let vm = this;
			remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
				properties: ["openDirectory"]
			}, selectedFolders => {
				if (selectedFolders) vm.finalize(selectedFolders[0]);
			});
		},
		finalize: function(path) {
			bus.folderPath = path;
			bus.recursively = this.recursively;
			bus.$emit("changeView", "ScanViewController");
		}
	},
});

Vue.component("ScanViewController", {
	template: "#ScanView",
	data: () => {
		return {
			progress: {
				processed: 0,
				total: 0,
				unsupported: 0,
				errors: 0
			},
			shouldContinue: true
		}
	},
	created: function() {
		let vm = this;
		scanner.launch(bus.folderPath, bus.recursively, (callback) => callback(vm.shouldContinue), (progress) => {
			vm.progress = progress;
			vm.$forceUpdate();
		}, (media) => {
			bus.media = media;
			bus.$emit("changeView", "MainViewController");
		});
	},
	methods: {
		cancelClicked: function () {
			this.shouldContinue = false;
			bus.$emit("changeView", "UploadViewController");
		}
	}
});


Vue.component("MainViewController", {
	template: "#MainView",
	data: () => {
		return {
			media: bus.media,
			visibleMedia: bus.media.slice(0, 10)
		}
	},
	created: function() {
		let vm = this;
	},
	methods: {
		select: function(n) {
			bus.$emit("select", n);
		}
	},
});

Vue.component("media-row", {
	template: "#media-row",
	props: ["src", "title", "dimensions", "subtitle", "id"],
	created: function() {
		let vm = this;
		bus.$on("select", function(n) {
			vm.selected = (n == vm.id) ? true : false;
		});
	},
	data: () => {
		return {
			selected: false
		};
	}
});

Vue.component("load-row", {
	template: "#load-row",
	methods: {
		requestMore: function() {
			bus.$emit("requestMore");
			alert("hi meme!");
		}
	}2
});

let screens = new Vue({
	el: "#screens",
	data: {
		screen: "UploadViewController"
	},
	created: function() {
		bus.$on("changeView", (view) => screens.screen = view);
	}
});
