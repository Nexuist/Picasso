const {app, BrowserWindow, ipcMain} = require("electron");

let window = null; // Keep a reference to the main BrowserWindow at all times
let debug = true;

/* Startup */
function start() {
	window = new BrowserWindow({
		minWidth: 640,
		minHeight: 480
	});
	window.loadURL(`file://${__dirname}/start.html`);
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
	if (win === null) start();
});

/* Event Handling */
ipcMain.on("processDirectory", (dirPath) => {

});

ipcMain.on("performActionOnFile", (action, filePath, opts) => {

});
