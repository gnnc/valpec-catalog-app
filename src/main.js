const electron = require('electron');
const { app, BrowserWindow, Menu, Tray, ipcMain } = electron;
const path = require('path');
// --- electron-updater-app ---
const updater = require('./updater');
// --- electron-updater-app ---
const isDev = require('electron-is-dev');
// 
require('dotenv').config();

const LevelDB = require('./resources/conn/LevelDB');
const SimpleJsonDB = require('./resources/conn/SimpleJsonDB');
//const EjDB = require('./resources/conn/EjDB');

// AppData
// Article: https://cameronnokes.com/blog/how-to-store-user-data-in-electron/
// Mac OS: ~/Library/Application Support/<Your App Name (taken from the name property in package.json)>
// Windows: C:\Users\<you>\AppData\Local\<Your App Name>
// Linux: ~/.config/<Your App Name>
// https://github.com/sindresorhus/electron-store
// const Store = require('electron-store');
// or
// https://www.npmjs.com/package/electron-json-storage

// var prune = require('json-prune');
const fs = require('fs');
const Store = require('./resources/conn/Store');
const { default: axios } = require('axios');
const { download } = require('./download');
const DecompressZip = require('decompress-zip');
const { match } = require('assert');

// Renderer process has to get `app` module via `remote`, whereas the main process can get it directly
// app.getPath('userData') will return a string of the user's app data directory path.
const userDataPath = (electron.app || electron.remote.app).getPath('userData');

// First instantiate the class
const store = new Store({
  name: 'user-preferences', // filename
  // path: path.join('build'), // ,'src'
  defaults: {
    // 800x600 is the default size of our window
    windowBounds: { width: 800, height: 600 }
  }
});
const storeUser = new Store({
  name: 'user',
});
const storeData = new Store({
  name: 'data',
});
const storeImages = new Store({
  name: 'images',
});
const storePath = new Store({
  name: 'path',
});

function loadContent() {

  let file = path.join(userDataPath, 'build', 'index.html');

  console.log('file(1)', file);

  mainWindow.loadFile(file).then( data => {
  }).catch( err => {

    file = path.join(__dirname, 'data', 'build', 'index.html');
    console.log('file(2)', file);

    mainWindow.loadFile(file).then( data => {
    }).catch( err => {

      const url = 'https://produtos.valpec.com.br'; 

      mainWindow.loadURL(url).then( data => {
      }).catch( err => {

        mainWindow.loadFile('./src/index.html').then( data => {
        }).catch( err => {});
      
      });

    });

  });

  // option 1
  // mainWindow.loadFile('./src/build/index.html').then( data => {
  // }).catch( err => {});

  // option 2
  // const url = 'http://produtos.valpec.com.br'; 
  // const url = 'https://catalogo.valpec.com.br'; 
  // const url = 'http://localhost:4444'; 
  // mainWindow.loadURL(url).then( data => {
  // }).catch( err => {
  //   mainWindow.loadFile('./src/index.html').then( data => {
  //   }).catch( err => {});
  // });
  
}

// Init
function createWindow() {

  // console.log(process.env.ELECTRON_PRODUCTS_GET);
  // console.log(process.env.ELECTRON_IMAGES_GET);

  // First we'll get our height and width. This will be the defaults if there wasn't anything saved
  let { width, height } = store.get();

  mainWindow = new BrowserWindow({
    minWidth: 1200,
    minHeight: 650,
    width,
    height,
    webPreferences: {
      // --- electron-updater-app ---
      preload: path.join(__dirname, 'preload.js'),
      // --- electron-updater-app ---
      nodeIntegration: true,
      // nativeWindowOpen: false, --> is deprecated
    },
    show: false,
  });
  
  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  // The BrowserWindow class extends the node.js core EventEmitter class, so we use that API
  // to listen to events on the BrowserWindow. The resize event is emitted when the window size changes.
  mainWindow.on('resize', () => {
    // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
    // the height, width, and x and y coordinates.
    let { width, height } = mainWindow.getBounds();
    // Now that we have them, save them using the `set` method.
    store.set({ width, height });
  });

  // --- electron-updater-app ---
  mainWindow.once('ready-to-show', () => {

    updater.init(mainWindow); // auto update
    updater.checkForUpdates();

    mainWindow.maximize();
    mainWindow.show();

    preloadData();
    // await 
    downloadDataUpdates();
    // await 
    downloadDataImages();
    console.log('2');

    //donwloadBuild();

    // create auth
    let user = storeUser.get();
    console.log(user);
    // get indo
    // let { enrollment, pcUniqueKey, email, register_cpf, register_cnpj, name, company } = JSON.parse(user) || {};
    // // data
    // let data = {
    //   enrollment, 
    //   pcUniqueKey: pcUniqueKey || String(Math.random()).substring(2,10), 
    //   email, 
    //   register_cpf, 
    //   register_cnpj, 
    //   name, 
    //   company,
    // };
    // // save
    // storeUser.set(data);

  });
  // --- electron-updater-app ---

  mainWindow.webContents.once('dom-ready', () => {
    console.log('1');
  });

  mainWindow.webContents.on('unresponsive', async () => {
    const { response } = await dialog.showMessageBox({
      message: 'App has become unresponsive',
      title: 'Do you want to try forcefully reloading the app?',
      buttons: ['OK', 'Cancel'],
      cancelId: 1
    })
    if (response === 0) {
      contents.forcefullyCrashRenderer()
      contents.reload()
    }
  })

  loadContent();
  openDatabase();
}

// if(!isDev){
//   Menu.setApplicationMenu(null);
// }

// Ready
app.whenReady().then(() => {
  createWindow();  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}).catch( err => console.log(err) );

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    exitAll();
  }
});

function exitAll() {
  mainWindow = null;
  app.quit();
  app.exit();
}

ipcMain.on('version-app', (event) => {
  console.log(app.getVersion());
  event.sender.send('version-app', { version: app.getVersion() });
});

// --- electron-updater-app ---
ipcMain.on('restart-app', () => {
  try {
    updater.quitAndInstall();
    exitAll();      
  } catch (error) {
    // app.relaunch();
  }
});
// --- electron-updater-app ---

// BrowserWindow Trigger
// will-finish-launching: Triggered when the application completes the basic startup
// web-contents-created:webContents is created
// browser-window-created:BrowserWindow is created
// ready: Triggered when Electron completes initialization
// remote-require: Called when remote is introduced
// before-quit: Triggered before the application starts to close the window
// will-quit: Emitted when all windows have been closed and the application will exit
// quit: Issued when the application exits
// window-all-closed: Triggered when all windows are closed
// browser-window-focus: Emitted when browserWindow gains focus
// browser-window-blur: Emitted when the browserWindow loses focus
// ready-to-show: Triggered when the page has been rendered (but not yet displayed) and the window can be displayed
// move: Window move
// resize: Triggered after the window is resized
// close: Triggered when the window is about to be closed. It fires before the beforeunload and unload events of the DOM.
// blur: Lost focus, same app
// focus: Get focus, same app
// maximize: Triggered when the window is maximized
// unmaximize: Triggered when the window is maximized and exited
// minimize: Triggered when the window is minimized
// restore: Triggered when the window is minimized and restored

// Databse

function openDatabase() {
}
const leveldb = new LevelDB({
  filename: 'products',
}).test();
const sjdb = new SimpleJsonDB({
  filename: 'products',
}).test();
// const ejdb = new EjDB({
//   filename: 'products',
// });
// ejdb.test();

// --- catálogo ---

async function downloadDataUpdates() {

  const noCache = Math.floor(Math.random() * 100) + 1;
  axios.post(process.env.ELECTRON_PRODUCTS_GET ,{ key: 'GNNC', noCache  })
  .then(async (res) => {

    // // inject
    // try {
    //   await ejdb.putArray('products', res.data, { truncate: true });
    // } catch (error) {
    //   console.log('putArray ', error, __filename)    
    // }

    // // read
    // try {
    //   await ejdb.queryString('products', 'search', 'PIT BULL', { ignoreSpace: false });
    // } catch (error) {
    //   console.log('queryString ', error, __filename)    
    // }

    // await ejdb.all();
    // await ejdb.queryStringTest();

    console.log('Have new data');
    mainWindow.webContents.send('data-upgrade', res.data);

    try {
      storeData.set(res.data); // store object
    } catch (error) {
      console.log('Cant save local data ', error);
    }

  })
  .catch((err) => {
    console.log('Err ', err);
  });
}

function downloadDataImages() {
  axios.get(process.env.ELECTRON_IMAGES_GET)
  .then((res) => {
    console.log('Have new images');
    try {
      storeImages.set(res.data); // store object
    } catch (error) {
      console.log('Cant save local images ', error);
    }
  })
  .catch((err) => {
    console.log('Err ', err);
  });
}

function checkUpdate() {
  console.log('PRÉ-CHECA update');
  // downloadDataUpdates();
}

function preloadData() {

  // save file local path
  const dirt = path.join(userDataPath) + path.sep;
  storePath.set(dirt);

}


function getLocalData() {
  
  // REFORÇO - apenas quando o dom é carregad
  // preload file
  const dirt = path.join(userDataPath) + path.sep;
  mainWindow.webContents.send('user-data-path', dirt);
  const data = storeData.get();
  mainWindow.webContents.send('data', data);
  const images = storeImages.get();
  mainWindow.webContents.send('images', images);

  // REFORÇO - antecipa o preload
  // document react.js
  // mainWindow.webContents.executeJavaScript(`window.localStorage.setItem('userDataPath', '${dirt}');`);
  // mainWindow.webContents.executeJavaScript(`window.localStorage.setItem('data', '${data}')`);

}

ipcMain.on('init-and-get-local-data', getLocalData);
ipcMain.on('btn-check-updated-data', checkUpdate);

// --- catálogo ---

// myBrowserWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures, referrer, postBody) => {
//   event.preventDefault()
//   const win = new BrowserWindow({
//     webContents: options.webContents, // use existing webContents if provided
//     show: false
//   })
//   win.once('ready-to-show', () => win.show())
//   if (!options.webContents) {
//     const loadOptions = {
//       httpReferrer: referrer
//     }
//     if (postBody != null) {
//       const { data, contentType, boundary } = postBody
//       loadOptions.postData = postBody.data
//       loadOptions.extraHeaders = `content-type: ${contentType}; boundary=${boundary}`
//     }

//     win.loadURL(url, loadOptions) // existing webContents will be navigated automatically
//   }
//   event.newGuest = win
// })


function donwloadComplete(event) {

  const filename = path.join(userDataPath) + path.sep + 'build.zip';
  const unzipper = new DecompressZip(filename);
  const dirt = path.join(userDataPath) + path.sep;
  
  unzipper.on('error', function (err) {
    console.log('Caught an error');
  });
  
  unzipper.on('extract', function (log) {
    console.log('Finished extracting');
    loadContent();
  });
  
  unzipper.on('progress', function (fileIndex, fileCount) {
    console.log('Extracted file ' + (fileIndex + 1) + ' of ' + fileCount);
  });
  
  unzipper.extract({
    path: dirt, // .
    filter: function (file) {
      return file.type !== "SymbolicLink";
    }
  });

  // unzipper.on('list', function (files) {
  //   console.log('The archive contains:');
  //   console.log(files);
  // });

  // unzipper.list();

}

function donwloadBuild() {

  // remove exists file
  const filename = path.join(userDataPath, 'build.zip'); // path.sep ;

  try {

    fs.stat(filename, function(err, stat) {
      if(err == null) {
        fs.unlinkSync(filename);
        console.log('Remove file');
        console.log('File exists');
      } else if(err.code === 'ENOENT') {
        console.log('file does not exist');
        // fs.writeFile('log.txt', 'Some log\n');
      } else {
        console.log('Some other error: ', err.code);
      }
    });

  } catch (error) {
    console.log(error);
  }

  // directory path
  const dirt = path.join(userDataPath, 'build');

  try {

    // first check if directory already exists
    if (!fs.existsSync(dirt)) {
      fs.mkdirSync(dirt);
      console.log("Directory is created.");
    } else {
      console.log("Directory already exists.");
    }

    const url = 'https://www.gnnc.com.br/daybyday/download/build/build.zip';
    // directory: "./pdf" // "c:/Folder" If not defined go to /Download path
    download(mainWindow, url, { directory: dirt, onCompleted: donwloadComplete }); // directory: './aaa'  

  } catch (err) {
    console.log('Não é possível criar o diretório build', err);
  }

}

ipcMain.on('console-log', (e, ...arg) => {
  console.log(arg);
});