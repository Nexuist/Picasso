Vue.component("main-view-controller", {
	template: `
	<template id = "MainView">
		<div id = "MainView" class="columns is-mobile">
			<div id = "sidebar">
				<media-row v-on:click.native = "select(id)" v-for = "(item, id) in visibleMedia" :src = "item.path" :title = "item.name" subtitle = "Test" :dimensions = "item.width + ' x ' + item.height" :id = "id"></media-row>
				<load-row></load-row>
			</div>
			<div class="column" id = "content">
				<img src = "https://placehold.it/600x600" />
			</div>
		</div>
	</template>
	`,
	data: () => {
		return {
			media: NotificationCenter.media,
			visibleMedia: NotificationCenter.media.slice(0, 10)
		}
	},
	created: function() {
		let vm = this;
	},
	methods: {
		select: function(n) {
			NotificationCenter.$emit("select", n);
		}
	},
});