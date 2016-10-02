function onLaunch() {
	var windowOptions = {
    id: "picasso",
		innerBounds: {
			minHeight: 400,
			minWidth: 600
		}
	};
	chrome.app.window.create("start.html", windowOptions);
}

chrome.app.runtime.onLaunched.addListener(onLaunch);
