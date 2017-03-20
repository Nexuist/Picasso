const {app, BrowserWindow, ipcMain} = require("electron");

var openedWindows = 0;

function start() {
	openedWindows++;
	window = new BrowserWindow({
		minWidth: 320,
		minHeight: 240,
		backgroundColor: "#f5f5f5"
	});
	window.loadURL(`file:///${__dirname}/app.html`);
	//window.webContents.openDevTools();
	window.on("close", () => openedWindows--);
}

app.on("ready", start);
app.on("window-all-closed", () => (process.platform !== "darwin") && app.quit());	// Stay active on macOS even when all windows are closed
app.on("activate", () => (openedWindows == 0) && start());	// Recreate the window if it's closed and the app is open on macOS