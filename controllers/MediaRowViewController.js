Vue.component("media-row-view-controller", {
	template: `
	<template id = "MediaRowView">
		<article class="media">
			<div v-if = "selected" class = "selection-overlay"></div>
			<figure class="media-left">
				<p class="image is-64x64">
					<img :src="src" style = "height: 100%">
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
	</template>
	`,
	props: ["src", "title", "dimensions", "subtitle", "id"],
	created: function() {
		let vm = this;
		NotificationCenter.$on("select", function(n) {
			vm.selected = (n == vm.id) ? true : false;
		});
	},
	data: () => {
		return {
			selected: false
		};
	}
});
