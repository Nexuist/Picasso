new Vue({
	el: "#NavigationViewController",
	data: {
		visibleViewController: "upload-view-controller"
	},
	created: function() {
		NotificationCenter.$on("changeView", (view) => screens.screen = view);
	}
});