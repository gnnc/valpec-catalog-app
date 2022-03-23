const fs = require("fs");
const os = require('os');
const path = require("path");

exports.default = async (context) => {

  console.log("after pack hook");
  console.log("on linux debian copy 'yml-sample/app-update.yml' file to './dist/linux-unpacked/resources/'");

  // problem .deb fix
  // try {
  //   if(os.platform() === 'linux'){
  //     const data = fs.readFileSync('./yml-sample/app-update.yml', 'utf8');
  //     fs.writeFileSync( path.join(__dirname, 'dist','linux-unpacked','resources','app-update.yml'), data, 'utf8');
  //   }      
  // } catch (error) {
  //   console.log("Ops! Error on afterPackHook.js");
  // }

};

/*
const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

exports.default = async context => {

  let data = {
    provider: 'spaces',
    name: 'demoapp',
    region: 'nyc3',
    path: '/test/'
  };

  switch (process.platform) {
    case "win32": // win
      data.updaterCacheDirName = 'demo-app-updater';
      data.publisherName = ['Company Name LLC'];
      fs.writeFileSync(
        path.join(__dirname, 'dist','win-unpacked','resources','app-update.yml'), yaml.safeDump(data), 'utf8'
      );
      break;
    default: // unix
      data.updaterCacheDirName = 'demoapp-updater';
      fs.writeFileSync(
        path.join(__dirname, 'dist','mac','Demo App.app','Contents','Resources','app-update.yml'), yaml.safeDump(data), 'utf8'
      );
      break;
  }

  fs.writeFileSync(
      path.join(__dirname, 'dev-app-update.yml')
      , yaml.safeDump(data)
      , 'utf8'
  )
}
*/
