const { dialog, BrowserWindow, ipcRenderer } = require('electron');
const { autoUpdater } = require('electron-updater');
const isDev = require('electron-is-dev');
const download = require('./download');
const {version} = require('../package.json');
const messages = require('./messages-en');

var mainWindowGlobal;
let initialized = false;
// let updateFeed = '';

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

// Nuts Server
// https://github.com/GitbookIO/nuts
// const nutsURL = 'https://electron-autoupdater-starter-server.now.sh';
// const platform = `${os.platform()}_${os.arch()}`;

/* 
[on]
message
update-error
update-checking
update-available
update-not-available
update-downloaded
update-download-progress
[send]
restart-app
*/

function init (mainWindow){

  if (initialized || isDev) {
    // message(`Running in development ${version}`);
    return
  };

  initialized = true;
  // autoUpdater.setFeedURL(updateFeed);

  autoUpdater.on('error' , (error) => {
    let { message } = error;
    // message filter    
    if(message === messages.no_published_versions_on_github) {
      message = messages.no_versions_published;
    } else if(String(message).includes('Cannot download')){
      // const url = String(message).split('"');
      message = messages.cannot_download;
    } else if(String(message).includes('ENOENT: no such file or directory, open') && String(message).includes('.yml')){
      message = messages.yml_file_not_found_local;
    } else if(String(message).includes('.yml in the latest release artifacts')){
      message = messages.yml_file_not_found_http;
    } else if(isDev){
      message = `Error(Dev): ${message}`;
    } else {
      message = `${message}`;
    }
    // message
    content(mainWindow).then( win => {
      win.send('message', { type: 'update-error', message: `${messages.error} ${message}`, hide: false });
    })
    // downalod alternative
    downloadAltertive(mainWindow);
  });

  autoUpdater.once('checking-for-update', (ev, err) => {
    content(mainWindow).then( win => {
      win.send('message', { type: 'update-checking', message: messages.checking_for_updates });
    });
  });

  autoUpdater.once('update-available', () => {
    content(mainWindow).then( win => {
      win.send('message', { type: 'update-available', message: messages.update_avaliable_downloading }); // , hide: false
    });
  });

  autoUpdater.once('update-not-available', (ev, err) => {
    content(mainWindow).then( win => {
      win.send('message', { type: 'update-not-available', message: messages.update_not_avaliable, hide: true });
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    content(mainWindow).then( win => {
      win.send('message', { type: 'update-downloaded', message: messages.downloaded });
    });
    // const message = {
    //   type: 'info',
    //   buttons: ['Restart and Upgrade', 'Cancel'],
    //   title: `Update`,
    //   message: 'Do you want to do this?',
    //   detail: `A new version has been downloaded. Restart to apply the updates.`
    // }
    // dialog.showMessageBox(message, (res) => {
    //   if(res === 0) {
    //     ipcRenderer.send('restart-app');
    //   }
    // })
  })

  // autoUpdater
  autoUpdater.on('download-progress', function (data) {
    let message = '';
    // message += `${messages.download_progress_speed} ${data.bytesPerSecond} - `;
    message += `${messages.download_progress_percent} ${parseInt(data.percent)}% `;
    // message += `(${data.transferred} / ${data.total}) `;
    // content(mainWindow).send('update-download-progress', message);
    content(mainWindow).then( win => {
      win.send('message', { type: 'update-download-progress', message: message });
    });
  });

}

function downloadAltertive(mainWindow) {
  content(mainWindow).then( win => {
    win.send('message', { type: 'download-alternative-starting', message: messages.download_save_file });
    download.checkForUpdatesAndDownload(mainWindow);
  });
}

function checkForUpdates () {
  try {
    autoUpdater.checkForUpdates();
    autoUpdater.checkForUpdatesAndNotify();  
  } catch (error) {} 
}

function quitAndInstall () {
  autoUpdater.quitAndInstall();
}

function message (message) {
	dialog.showMessageBox({
		type: 'info',
		title: 'Message',
		message: message,
	});
}

module.exports = {
  init,
  checkForUpdates,
  quitAndInstall,
  message
}