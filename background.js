chrome.app.runtime.onLaunched.addListener(function() {
	console.log("hi!");
  chrome.app.window.create("window.html", {
    id: "picasso2",
		innerBounds: {
			minHeight: 400,
			minWidth: 600
		}
  }, function(window) {
		window.onBoundsChanged.addListener(function() {
			console.log(window.innerBounds);
		})
	});
});
