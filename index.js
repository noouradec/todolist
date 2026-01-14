const path = require("path");
const {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  dialog,
  desktopCapturer,
} = require("electron");
const fs = require("fs");

let win;
let tray;

function createWindow() {
  win = new BrowserWindow({
    width: 550,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.removeMenu();
  win.loadFile("index.html");

  ipcMain.on("load-page", (event, page) => {
    win.loadFile(page);
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'icon.png'));
  tray.setToolTip("My Todo App");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show App",
      click: () => {
        win.show();
      },
    },
    {
      label: "Quit",
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  // Click icon to toggle window visibility
  tray.on("click", () => {
    if (win.isVisible()) win.hide();
    else win.show();
  });
}

app.whenReady().then(() => {
  if (process.platform === "darwin") {
    app.dock.setIcon(path.join(__dirname, "icon.png"));
  }
  createWindow();
  createTray(); // <-- Add this to create the tray icon

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Optional: keep app running even when window is closed
app.on("window-all-closed", (e) => {
  // Prevent app from quitting on macOS
  if (process.platform !== "darwin") {
    app.quit();
  } else {
    e.preventDefault();
  }
});
