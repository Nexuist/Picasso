Vue.component("upload-view-controller", {
	template: `
	<section class = "hero is-fullheight is-light" id = "UploadView">
		<div class = "hero-body">
			<div class = "container has-text-centered">
				<h1 class = "title">Drag in a folder containing images.</h1>
				<a v-on:click = "manualUpload" class = "button is-dark is-outlined">
					<span class = "icon">
						<i class = "fa fa-folder-open"></i>
					</span>
					<span>Or, choose a folder</span>
				</a>
				<h5>{{label}}</h5>
				<br/>
				<p class="control">
					<label class= "checkbox">
						<input type = "checkbox" v-model = "recursively"> Scan recursively</input>
					</label>
				</p>
			</div>
		</div>
	</section>
	`,
	data: () => {
		return {
			label: "Supported Types: " + supportedFileTypes.join(", ").toUpperCase(),
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
			NotificationCenter.folderPath = path;
			NotificationCenter.recursively = this.recursively;
			NotificationCenter.$emit("changeView", "ScanViewController");
		}
	},
});