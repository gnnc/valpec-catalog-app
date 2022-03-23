const {BrowserWindow, ipcRenderer} = require('electron');
const os = require('os');
const path = require('path');
const {latestStableVersion} =  require("latest-stable-version");
const down = require("electron-dl").download;
const messages = require('./messages-en');
const {release, version} = require('../package.json');

var mainWindowGlobal;
var tryLatestVersion = true;

function content(mainWindow) {
  return new Promise( (resolve, reject) => {
    if(mainWindowGlobal) {
      resolve(mainWindowGlobal);
    } else if(mainWindow) {
      resolve(mainWindow);
    } else if(BrowserWindow.getFocusedWindow()){
      try {
        mainWindowGlobal = BrowserWindow.getFocusedWindow().webContents;
      } catch (error) {
        if(ipcRenderer){
          mainWindowGlobal = ipcRenderer;
        } else {
          reject(error);
        }
      }
    }
  });
}

// function getContent() {
//   let getAll, getFocus, webContents;
//   getAll = BrowserWindow.getAllWindows()[0];
//   if(getAll){
//     if('webContents' in getAll){
//       getAll.webContents && (webContents = getAll.webContents);
//     }
//   }
//   getFocus = BrowserWindow.getFocusedWindow();
//   if(getFocus){
//     if('webContents' in getFocus){
//       getFocus.webContents && (webContents = getFocus.webContents);
//     }  
//   }
//   webContents || (webContents = ipcRenderer);
//   return webContents;
// }

// function content() {
//   if(mainContent) return mainContent;
//   return mainContent = getContent();
// }

// {
//   filename: 'file.zip',
//   path: '/path/file.zip',
//   fileSize: 503320,
//   mimeType: 'application/zip',
//   url: 'https://example.com/file.zip'
// }

function getRelease() {
  
  if(!tryLatestVersion) return;

  const { owner, repo, template } = release;

  return new Promise((resolve, reject) => {

    latestStableVersion({
      owner: owner,
      repo: repo,
    }).then( v => {

      tryLatestVersion = true;

      if(Number(v) <= Number(version) || v === version) {
        reject({ error: messages.update_not_avaliable, updated: true });
        return;
      }
      
      let extension = '';
      let url = template;
    
      switch(os.platform()) {
        case 'darwin': extension = 'dmg'; break;
        case 'win32':  extension = 'exe'; break;
        case 'win64':  extension = 'exe'; break;
        case 'linux':  extension = 'deb'; break;
      }

      url = url.replace(/\[owner\]/g, owner);
      url = url.replace(/\[repo\]/g, repo);
      url = url.replace(/\[extension\]/g, extension);
      url = url.replace(/\[version\]/g, v);

      if(!owner || !repo || !extension || !v) {
        reject({ error: messages.download_error_url, updated: false });
        return;
      }

      resolve(url);

    }).catch( error => {

      tryLatestVersion = true;
      resolve({ error: messages.download_file_corrupted, updated: false });

    });
  });
}

function downloadProgress(progress) {

  content(null).then( win => {
    win.send('message', { type: 'download-progress', message: `${messages.download_progress_percent} ${progress.percent * 100 >> 0}%` });
  }).catch( () => {});

}

function downloadComplete(file) {

  let fileName = '';
  let message;
  let type;
  if('errorTitle' in file || 'errorMessage' in file) { // file.hasOwnProprety(errorTitle)
    type = 'download-error';
    message = messages.download_error;
  } else {
    type = 'download-completed';
    message = messages.download_complete;
    fileName = file.path && String(file.path).split(path.delimiters).pop();
  }
  content(null).then( win => {
    win.send('message', { type, message })
    setTimeout(() => {
      win.send('message', { type, message: `${messages.download_open_download_folder} ${fileName}`, hide: true, time: 5000});
    },2000);
  }).catch( () => {});

}

function onCancel(file) {

  content(null).then( win => {
    win.send('message', { type: 'download-alternative-canceled', message: messages.download_canceled });
  }).catch( () => {});

}

/**
 * 
 * @param {String} url 
 * @param {Object} properties 
 * properties: {
 *   openFolderWhenDone: true,
 *   saveAs: true, 
 *   // directory: "./pdf" // "c:/Folder" If not defined go to /Download path
 * },
 */
function download(mainWindow, url, properties) {

  let info = {
    onProgress: downloadProgress,
    onCompleted: downloadComplete,
    onCancel: onCancel,
    openFolderWhenDone: true,
    saveAs: false,
    // directory: "./pdf" // "c:/Folder" If not defined go to /Download path
  };

  if(properties) {
    info = { ...info, ...properties };
  }

  return down(mainWindow, url, info)
  // .then( dl => {
  //   console.log('complete:', dl); // Full file path
  //   console.log('complete:file:', dl.getSavePath());
  // });
}

function checkForUpdates(mainWindow) {

  getRelease().then( () => {

    content(mainWindow).then( win => {
      win.send('message',{ type: 'download-alternative-found', message: messages.download_found });
      win.send('download-alternative-found');
    }).catch( () => {});

  }).catch( error => {

    content(mainWindow).then( win => {
      win.send('message',{ type: 'download-alternative-error', message: messages.download_error});
    }).catch( () => {});

  });

}

function checkForUpdatesAndDownload(mainWindow) {

  getRelease().then( url => {
    
    content(mainWindow).then( win => {
      win.send('message',{ type: 'download-alternative-found', message: messages.download_found });
      win.send('download-alternative-found');

      download(win, url).then( dl => {
        // run app
      }).catch( data => {
        let message;
        if(String(data).includes('was interrupted')){
          message = messages.download_was_interrupted;
        } else {
          message = messages.download_bad_server_connection;
        }
        win.send('message',{ type: 'download-alternative-corrupted', message: message, hide: true });
      });
  
    }).catch( () => {});
        
  }).catch( data => {
    content(mainWindow).then( win => {
      win.send('message',{ type: 'download-alternative-error', message: data.error || messages.download_error, hide: true });
    }).catch( () => {});
  });

}

module.exports = {
  download,
  checkForUpdates,
  checkForUpdatesAndDownload,
}

// const downloadItems = [];
// ipcMain.on(
//   'download-update',
//   async (event, { url, downloadPath, updateIdentificator }) => {
//     if (win) {
//       await download(win, url, {
//         directory: downloadPath,
//         onStarted: item => {
//           downloadItems[updateIdentificator] = item;
//           win.content().send('download-update-started', {
//             fileName: item.getFilename(),
//             updateIdentificator,
//           });
//         },
//         onProgress: currentProgress => {
//           win.content().send('download-update-progress', {
//             currentProgress,
//             updateIdentificator,
//           });
//         },
//       });
//       win.content().send('download-update-finished', {
//         updateIdentificator,
//       });
//     }
//   },
// );