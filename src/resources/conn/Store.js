// create files json
const electron = require('electron');
const path = require('path');
const fs = require('fs');
const prune = require('json-prune');
const json_tools = require('json-helpers');

class Store {

  constructor(opts) {
    // Renderer process has to get `app` module via `remote`, whereas the main process can get it directly
    // app.getPath('userData') will return a string of the user's app data directory path.
    const userDataPath = (electron.app || electron.remote.app).getPath('userData');
    // We'll use the `name` property to set the file name and path.join to bring it all together as a string
    this.writeType = opts.writeType || 'write'; // write | append
    this.replace = opts.replace === undefined ? true : opts.replace;
    this.path = path.join(userDataPath, opts.path || '');
    this.file = path.join(this.path, opts.name + '.json');
    this.data = parseDataFile(this.path, opts.defaults);
    // console.log('path:', this.path);
  }
  
  // This will just return the property on the `data` object
  get() {
    // console.log(this.data);
    // console.log(this);
    return this.data;
    // return this.data[key];
  }
  
  // ...and this will set it
  set(val) {
    // this.data = val;
    // this.data[key] = val;
    
    if(typeof val === 'string') {
      this.data = val;
      console.log('isString');
    } else {
      try {
        this.data = json_tools.JSONParserV2.stringify(busEvent); // JSONParserV1
        // console.log('json-helpers > ', this.data);
        console.log('json-helpers');
      } catch (error) {
        try {
          this.data = JSON.stringify(val);
          console.log('stringify');
        } catch (error) {
          try {
            this.data = prune(val);  
            console.log('prune');  
          } catch (error) {
            this.data = `${val}`;  
            console.log('error when try stringfy');
          }
        }
      }
    }

    // Wait, I thought using the node.js' synchronous APIs was bad form?
    // We're not writing a server so there's not nearly the same IO demand on the process
    // Also if we used an async API and our app was quit before the asynchronous write had a chance to complete,
    // we might lose that data. Note that in a real app, we would try/catch this.

    try {
      // first check if directory already exists
      if(this.path){
        if (!fs.existsSync(this.path)) {
          fs.mkdirSync(this.path);
          console.log("Directory is created.");
        } else {
          console.log("Directory already exists.");
        }  
      }
    
    } catch (err) {
      console.log('Não é possível criar o diretório build (store)', err);
    }
  
    try {
      if(this.data){
        try {
          fs.writeFileSync(this.file, this.data);
          console.log('Done! Write file.');
        } catch (error) {
          console.log('Sorry, error', error);
        }
      } else {
        console.error('Data is empty');
      }
    } catch (error) {
      console.error('Cant save storage');
    }

  }

  clear() {    
    try {
      fs.writeFileSync(this.file, '');
      console.log('Clear done!');
    } catch (error) {
      console.log('Sorry, clear error', error);
    }
  }

  delete() {
    try {
      fs.unlinkSync(this.file);
      console.log('Clear done!');
    } catch (error) {
      console.log('Sorry, delete error', error);
    }
  }
}

function parseDataFile(filePath, defaults) {
  // We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.
  // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch(error) {
    // if there was some kind of error, return the passed in defaults instead.
    return defaults;
  }
}

// expose the class
module.exports = Store;