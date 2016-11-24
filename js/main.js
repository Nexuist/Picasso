const {webFrame} = require("electron");

webFrame.setZoomLevelLimits(1, 1); // Disable zooming for the entire window

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
			types: ["png", "jpg"]
		};
	},
	computed: {
		supportedTypes: function() {
			return this.types.join(", ").toUpperCase();
		}
	},
	template: `#upload-template`
});

Vue.component("scan-screen", {
	template: `#scan-template`
});

let bus = new Vue();

Vue.component("main-screen", {
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
		screen: "upload-screen",
	}
});
