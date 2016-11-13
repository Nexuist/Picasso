window.$ = require("./js/jquery-3.1.1.min.js");

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
	</section
	`
});

Vue.component("image-item", {
	props: ["src", "title", "dimensions", "subtitle"],
	template: `
	<article class="media">
		<figure class="media-left">
			<p class="image is-64x64">
				<img :src="src">
			</p>
		</figure>
		<div class="media-content">
			<div class="content">
				<p>
					<strong>{{ title }}</strong>
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
		screen: "main",
		supportedTypes: supportedTypes.join(", ").toUpperCase()
	}
});
