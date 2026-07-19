const { app, BrowserWindow, ipcMain } = require("electron");

app.disableHardwareAcceleration();

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 400,
    height: 450,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    frame: false, 
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile("index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.on('minimize-window', () => {
  if (win) win.minimize();
});

ipcMain.on('close-window', () => {
  if (win) win.close();
});