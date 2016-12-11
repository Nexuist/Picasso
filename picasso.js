const {app, BrowserWindow} = require("electron");

let window = null; // Keep a reference to the main BrowserWindow at all times
let debug = true;

let load = (page) => window.loadURL(`file:///${__dirname}/${page}.html`);

/* Startup */
function start() {
	window = new BrowserWindow({
		minWidth: 320,
		minHeight: 240,
		backgroundColor: "#f5f5f5"
	});
	load("main");
	window.on("close", () => {
		window = null;
	});
}

app.on("ready", start);
app.on("window-all-closed", () => {
	// Stay active on macOS even when all windows are closed
	if (process.platform !== "darwin" || debug) app.quit();
});
app.on("activate", () => {
	// Recreate the window if it's closed and the app is open on macOS
	if (window === null) start();
});
