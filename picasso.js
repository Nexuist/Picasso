const {app, BrowserWindow} = require("electron");

let window = null; // Keep a reference to the main BrowserWindow at all times

function start() {
	window = new BrowserWindow({
		minWidth: 800,
		minHeight: 600
	});
	window.loadURL(`file://${__dirname}/start.html`);
	window.on("close", () => {
		window = null;
	});
}

// Initialization finished
app.on("ready", start);

app.on("window-all-closed", () => {
	// Stay active on macOS even when all windows are closed
	if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
	// Recreate the window if it's closed and the app is open on macOS
	if (win === null) start();
});
