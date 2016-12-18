const {remote, webFrame, ipcRenderer} = require("electron");
let scanner = remote.require("./scan");

webFrame.setZoomLevelLimits(1, 1); // Disable zooming for the entire window

let supportedTypes = ["png", "jpg"];
let bus = new Vue();

Vue.component("UploadViewController", {
	data: () => {
		return {
			label: "Supported Types: " + supportedTypes.join(", ").toUpperCase()
		};
	},
	created: function() {
		document.addEventListener("dragover", event => event.preventDefault());
		document.addEventListener("drop", this.onDrop);
		console.log(scanner);
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
		finalize: (path) => {
			bus.folderPath = path;
			bus.$emit("changeView", "ScanViewController");
		}
	},
	template: "#UploadView"
});

Vue.component("ScanViewController", {
	template: "#ScanView",
	created: function() {
		let path = bus.folderPath;
		scanner.launch(path, true, (progress) => console.log(progress), (media) => console.log(media));
	}
});


Vue.component("MainViewController", {
	methods: {
		select: function(n) {
			bus.$emit("select", n);
			bus.$emit("test");
		}
	},
	template: `#main-template`
});

Vue.component("sidebar-row", {
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
	},
	template: `
	<article class="media">
	<div v-if = "selected" class = "selection-overlay"></div>
	<figure class="media-left">
	<p class="image is-64x64">
	<img :src="src">
	</p>
	</figure>
	<div class="media-content">
	<div class="content" :class = "{selected: selected}">
	<p>
	<strong :class = "{selected: selected}">{{ title }}</strong>
	<small>{{ dimensions }}</small>
	<br>
	{{ subtitle }}
	</p>
	</div>
	</div>
	</article>
	`
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
