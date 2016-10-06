const {app, BrowserWindow, ipcMain} = require("electron");

let window = null; // Keep a reference to the main BrowserWindow at all times
let debug = true;

let load = (page) => window.loadURL(`file:///${__dirname}/${page}.html`);

/* Startup */
function start() {
	window = new BrowserWindow({
		minWidth: 640,
		minHeight: 480
	});
	load("start");
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

/* Event Handling */
ipcMain.on("processFolder", (folderPath) => {
	load("processing");
});

ipcMain.on("performActionOnFile", (action, filePath, opts) => {

});
