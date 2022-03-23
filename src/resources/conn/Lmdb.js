// Windows
const electron = require('electron');
const {open} = require('lmdb');

class Lmdb {

  constructor(opts) {
    
    this.filename = opts.filename;
    if(!this.filename) throw new Error('Set database name');

    console.log('#### hi lmdb');
    this.test();
  }

  async test() {

    const userDataPath = (electron.app || electron.remote.app).getPath('userData');

    this.database = open({
      path: `${userDataPath}/lmdb/${this.filename}`,
      // any options go here, we can turn on compression like this:
      compression: true,
    });
    console.log('#### hi lmdb 2');
    await this.database.put('greeting', { someText: 'Hello, World!' });
    this.database.get('greeting').someText // 'Hello, World!'
    console.log('#### hi lmdb 3');
    // or
    this.database.transaction(() => {
      console.log('#### hi lmdb 4');
      this.database.put(0, { someText: 'Hello, World!' });
      this.database.get(0).someText // 'Hello, World!'
    });
    console.log('#### hi lmdb 5');

  }
}

module.exports = Lmdb;