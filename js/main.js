window.$ = require("./js/jquery-3.1.1.min.js");
const {webFrame} = require("electron");
webFrame.setZoomLevelLimits(1, 1);

const supportedTypes = ["png", "jpg"];


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

Vue.component("upload-screen", {
	data: () => {
		return {
			supportedTypes: ["png", "jpg"]
		};
	},
	template: `
	<hero id = "upload-screen">
		<h1 class = "title">Drag in a folder with pictures in it.</h1>
		<a class = "button is-dark is-outlined" onclick = "screens.screen = 'scan-screen';">
			<span class = "icon">
				<i class = "fa fa-folder-open"></i>
			</span>
			<span>Or, choose a folder</span>
		</a>
		<h5 class = "content upload">Supported images: {{ supportedTypes.join(", ").toUpperCase() }}</h5>
	</hero>
	`
});

Vue.component("scan-screen", {
	template: `
	<hero id = "scan-screen">
		<progress class = "progress is-primary is-large catalog" value = "0" max = "100"></progress>
		<p class = "content">Scanning files...</p>
		<a class="button is-danger is-outlined" onclick = "screens.screen = 'main-screen';">
			<span class="icon">
				<i class="fa fa-ban"></i>
			</span>
			<span>Cancel</span>
		</a>
	</hero>`
});

let bus = new Vue();

Vue.component("main-screen", {
	methods: {
		select: function(n) {
			bus.$emit("select", n);
			bus.$emit("test");
		}
	},
	template: `
	<div class="columns is-mobile" id = "main-screen">
		<div id = "sidebar">
			<sidebar-row v-on:click.native = "select(n)" v-for = "n in 10" src = "https://placehold.it/32x32" :title = "'Image ' + n" subtitle = "Test" dimensions = "64x64" :id = "n"></sidebar-row>
		</div>
		<div class="column" id = "content">
			<img src = "https://placehold.it/600x600" />
		</div>
	</div>`
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
		screen: "main-screen",
	}
});
