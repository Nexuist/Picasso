Vue.component("load-row-view-controller", {
	template: "#load-row",
	methods: {
		requestMore: function() {
			NotificationCenter.$emit("requestMore");
			alert("hi meme!");
		}
	}
});