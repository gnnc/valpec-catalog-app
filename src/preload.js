// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', function(){

  // REMOVE THIS
  // try {
  //   const replaceText = (selector, text) => {
  //     const element = document.getElementById(selector)
  //     if (element) element.innerText = text
  //   }
  
  //   for (const type of ['chrome', 'node', 'electron']) {
  //     replaceText(`${type}-version`, process.versions[type])
  //   }      
  // } catch (error) {
  //   console.log('Remove many lines on preload.js');
  // }
  // REMOVE THIS

  const { ipcRenderer } = require('electron');
  const messages = require('./messages-en');

  let notification        = document.getElementById('notification');
  let notificationMessage = document.getElementById('notification-message');
  let restartButton       = document.getElementById('notification-restart-button');
  let version             = document.getElementById('version');

  // [
  //   { node: 'p', text: 'Waiting', id: 'notification-message', className: 'hidden', name: '' },
  //   { node: 'button', text: 'Cancel', id: 'notification-cancel-button', className: '', name: '' },
  //   { node: 'button', text: 'Restart', id: 'notification-restart-button', className: 'hidden', name: '' },
  //   { node: 'button', text: 'Download', id: 'notification-download-button', className: 'hidden', name: '' },
  // ].forEach( (element) => {
    
  //   const { node, text, id, className, name } = element;
  //   const el = document.createElement(node);
  //   const tx = document.createTextNode(text);
  //   el.id = id;
  //   el.name = name;
  //   // el.classList.add(className);
  //   el.className = className;
  //   el.appendChild(tx);
  //   document.body.appendChild(el);
  
  // });

  /*
  [on] 
  version-app
  update-error
  update-checking
  update-available
  update-not-available
  update-downloaded
  update-download-progress
  [send]
  version-app
  */

  // Message ----------------------------------------------

  function showMessage(data) {

    let {type, message, hide, time} = data;

    time = time || 2000;

    if(type === 'update-downloaded'){
      restartButton && restartButton.classList.remove('hidden'); // hidden
    }

    if(!notification) return; // notification not exists

    // notification.classList.remove('hidden'); // hidden
    notification.classList.add('fadeIn')
    notificationMessage.innerText = message;

    if (hide !== undefined) {
      setTimeout(() => {
        if(hide){
          // notification.classList.add('hidden');
          notification.classList.remove('fadeIn');
          notification.classList.add('fadeOut');
        }else{
          // notification.classList.remove('hidden');
          notification.classList.add('fadeIn');
          notification.classList.remove('fadeOut');
        }
      }, time);
    }
  }

  ipcRenderer.on('console', (event, consoleMsg) => {
    console.log(consoleMsg);
  })
  
  ipcRenderer.on('message', (event, data) => {
    showMessage(data);
  })

  notification && notification.addEventListener('dblclick', () => {
    notification.classList.remove('fadeIn');
    notification.classList.add('fadeOut')
  });
  restartButton && restartButton.addEventListener('click',() => ipcRenderer.send('restart-app'));

  // Download Alternative

  // code...

  // Version

  ipcRenderer.send('version-app');
  ipcRenderer.on('version-app', (event, arg) => {
    version && (version.innerText = `${messages.version} ${arg.version}`);
    ipcRenderer.removeAllListeners('version-app');
  });

  // catálogo ---------------------------------------------------------- 

  // mainWindow.webContents.once('dom-ready', () => {});
  // mainWindow.once('did-finish-load', () => {});

  // check data
  let contentlist = document.getElementById('content-list');
  contentlist && contentlist.addEventListener('click',() => ipcRenderer.send('btn-check-updated-data'));

  // init get local data
  ipcRenderer.send('init-and-get-local-data');

  // send path
  ipcRenderer.on('user-data-path', (event, arg) => {
    window.userDataPath = arg;
    window.localStorage.setItem('userDataPath', arg);
  });

  // send data
  ipcRenderer.on('data', (event, arg) => {
    window.data = arg;
    window.localStorage.setItem('data', arg);
  });

  // send data
  ipcRenderer.on('data-upgrade', (event, arg) => {
    window.dataUpgrade = arg;
    window.localStorage.setItem('dataUpgrade', arg);
  });
  
  // send images
  ipcRenderer.on('images', (event, arg) => {
    window.images = arg;
    window.localStorage.setItem('images', arg);
  });

  // dispatch
  document.dispatchEvent(new Event('loadData', { bubbles: false, cancelable: false}));
  document.addEventListener('loadDataElectron',(event) => {
    ipcRenderer.send('console-log', 'loaddata (document) VOLTEI', event);
  });
  window.addEventListener('loadDataElectron',(event) => {
    ipcRenderer.send('console-log', 'loaddata (window) VOLTEI', event);
  });

  ipcRenderer.send('console-log', 'preload loaded');

  // Database 

 
});