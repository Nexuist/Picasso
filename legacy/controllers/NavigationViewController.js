new Vue({
	el: "#NavigationViewController",
	data: {
		visibleViewController: "main-view-controller"
	},
	created: function() {
		NotificationCenter.$on("changeView", (view) => screens.screen = view);
	}
});