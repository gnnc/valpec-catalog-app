const electron = require('electron');
const JSONdb = require('simple-json-db');
const fs = require('fs');

class SimpleJsonDB {

  subPath = 'simplejsondb';
  opened = false;

  constructor(opts) {

    this.filename = opts.filename;
    if(!this.filename) throw new Error('Set database name');
    this.userDataPath = (electron.app || electron.remote.app).getPath('userData');

    this.open();
  }

  pathSync() {
    const p = `${this.userDataPath}/${this.subPath}`;
    try {
      if(p){
        if (!fs.existsSync(p)) {
          fs.mkdirSync(p);
          // console.log("Directory is created.");
        } else {
          // console.log("Directory already exists.");
        }  
      }
    } catch (err) {
      console.log('Cant create path (SimpleJsonDB)', err);
    }
  }

  open() {
    if(this.opened) return;
    this.pathSync()
    try {
      console.log(`Open SimpleJsonDB (${this.subPath}/${this.filename})`);
      this.database = new JSONdb(`${this.userDataPath}/${this.subPath}/${this.filename}.json`, {});      
      this.opened = true;
    } catch (error) {
      console.error('Cant create SimpleJsonDB'); 
    }
  }

  all() {
    return this.database .JSON();
  }

  toJSON() {
    return this.all();
  }

  sync() {
    this.database.sync();
  }

  replaceDB(data) {
    this.database.JSON({ data });
  }

  test() {

    this.open();

    // Put a key & value
    const j = { name: 'Natan Cabral', id: 1}
    const data = { name: 'Natan Cabral', id: 1, json: JSON.stringify(j)};
    const json = JSON.stringify(data);
    this.database.set('name', json);

    // Get value
    const v = this.database.get('name')
    console.log('(SimpleJsonDB) name=' + v, this.tratament(v));
    
  }

  isJSON(data) {
    if(!data) return false;
    if(typeof data === 'string') {
      const start = String(data).substring(0,1);
      const end = String(data).substring(-1,1);
      if(start === '[' && end === ']') {
        return true;
      }
      if(start === '{' && end === '}') {
        return true;
      }
      return false;
    }
    return false;
  }

  isObject(data) {
    if(typeof data === 'object') {
      if(Buffer.isBuffer(Buffer.from('abc'))) {
        return true;
      }
      return false;
    } else {
      return false;
    }
  }

  tratament(data, serialize) {
    serialize === undefined && (serialize = true); 
    if(this.isJSON(data)) {
      return serialize ? JSON.parse(data) : data;
    }
    if(this.isObject(data)) {
      return serialize ? data.toString('utf8') : JSON.stringify(data.toString('utf8'));
    }
    return data.toString();
  }

}

module.exports = SimpleJsonDB;