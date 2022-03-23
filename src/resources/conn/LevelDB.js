// All - Unix | Windows  
// Type of storage, but create files
const electron = require('electron');
const levelup = require('levelup')
const leveldown = require('leveldown')

class LevelDB {

  subPath = 'leveldb';
  opened = false;

  constructor(opts) {

    this.filename = opts.filename;
    if(!this.filename) throw new Error('Set database name');
    this.userDataPath = (electron.app || electron.remote.app).getPath('userData');
    
    this.open();

  }

  open() {
    if(this.opened) return;
    try {
      console.log(`Open levelDB (${this.subPath}/${this.filename})`);
      this.database = levelup(leveldown(`${this.userDataPath}/${this.subPath}/${this.filename}`));
      this.opened = true;
    } catch (error) {
      console.error('Cant create levelDB'); 
    }
  }

  test() {

    this.open();

    // 2) Put a key & value
    const j = { name: 'Natan Cabral', id: 1}
    const data = { name: 'Natan Cabral', id: 1, json: JSON.stringify(j)};
    const json = JSON.stringify(data);

    this.database.put('name', 'AAAAA', (err) => {
      if (err) return console.log('Ooops!', err) // some kind of I/O error

      // 3) Fetch by key
      this.database.get('name', (err, value) =>  {
        if (err) return console.log('Ooops!', err) // likely the key was not found

        // Ta da!
        console.log('(levelDB) name=' + value, this.tratament(value));

      })
    });
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

module.exports = LevelDB;