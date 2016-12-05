const {remote, webFrame} = require("electron");
const dialog = remote.dialog;
const browserWindow = remote.getCurrentWindow();

webFrame.setZoomLevelLimits(1, 1); // Disable zooming for the entire window

let bus = new Vue();

Vue.component("hero", {
	template: `
	<section class = "hero is-fullheight is-light">
		<div class = "hero-body">
			<div class = "container has-text-centered">
				<slot>
				</slot>
			</div>
		</div>
	</section>
	`
});

Vue.component("UploadViewController", {
	data: () => {
		return {
			label: "Supported Types: " + ["png", "jpg"].join(", ").toUpperCase()
		};
	},
	created: function() {
		var vm = this;
		document.addEventListener("dragover", event => {
			event.preventDefault();
		});
		document.addEventListener("drop", event => {
			event.preventDefault();
			if (!event.dataTransfer.files || !event.dataTransfer.items) return;
			var file = event.dataTransfer.files[0]; // dataTransfer.files contains full path
			var item = event.dataTransfer.items[0].webkitGetAsEntry(); // dataTransfer.items[0].webkitGetAsEntry() allows us to find out if the uploaded file is a folder
			if (!item) return;
			if (item.isDirectory) {
				vm.finalize(file.path);
			}
			else {
				vm.label = "Sorry, you can only choose a folder.";
			}
		});
	},
	methods: {
		manualUpload: () => {
			console.log(this.$data);
			dialog.showOpenDialog(browserWindow, {
				properties: ["openDirectory"]
			}, selectedFolders => {
				if (selectedFolders) finalize(selectedFolders[0]);
			});
		},
		finalize: (path) => {
			bus.$emit("changeView", "ScanViewController");
			bus.$emit("setFolderPath", path);
		}
	},
	template: "#upload-template"
});

Vue.component("ScanViewController", {
	template: "#scan-template",
	created: function() {
		console.log('created');
		bus.$on("setFolderPath", (path) => console.log("hey!"));
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
		bus.$on("changeView", (view) => {
			screens.screen = view;
		});
	}
});
