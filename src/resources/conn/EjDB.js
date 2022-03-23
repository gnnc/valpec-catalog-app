// const { EJDB2 } = require('node-ejdb-lite');

// async function run() {
//   const db = await EJDB2.open('src/database/database.db', { truncate: true });

//   var id = await db.put('parrots', {'name': 'Bianca', 'age': 4});
//   console.log(`Bianca record: ${id}`);

//   id = await db.put('parrots', {'name': 'Darko', 'age': 8});
//   console.log(`Darko record: ${id}`);

//   const j = { name: 'Natan Cabral', id: 1}
//   const data = { name: 'Natan Cabral', id: 1, age: 8, json: JSON.stringify(j)};
//   // const json = JSON.stringify(data);
//   id = await db.put('parrots', data)
  
//   console.log('query 1');
//   const q = db.createQuery('/[age > :age]', 'parrots');

//   for await (const doc of q.setNumber('age', 3).stream()) {
//     console.log(`Found ${doc}`);
//   }

//   console.log('query 2');
//   // https://www.npmjs.com/package/node-ejdb-lite
//   const word1 = 'Natan Cabr';
//   const word2 = 'Dar';
//   // const q2 = db.createQuery(`/[name ~ "${word1}"]`, 'parrots');
//   const q2 = db.createQuery(`/[name ~ "${word1}"] or /[name ~ "${word2}"]`, 'parrots');

//   for await (const doc of q2.stream()) {
//     console.log(`Found ${doc}`);
//   }

//   await db.close();
// }

// run();

// All - Unix | Mac | Windows
const { rejects } = require('assert');
const electron = require('electron');
const fs = require('fs');
const { EJDB2 } = require('node-ejdb-lite');

class EjDB {

  subPath = 'src/database'; ///ejdb2
  isOpened = false;

  constructor(opts) {
    this.filename = opts.filename;
    if(!this.filename) throw new Error('Set database name');
    this.userDataPath = (electron.app || electron.remote.app).getPath('userData');
    // this.open();
  }

  open(opts) {
    return new Promise(async (resolve, reject) => {
      try {
        this.database = await EJDB2.open(`${this.subPath}/${this.filename}.db`, { ...opts }); //, { truncate: true });
        resolve(this.database);
      } catch (error) {
        reject(error);
      }
    })
  }

  async test(opts) {

    this.database = await this.open(opts);

    // var id = await this.database.put('parrots', {'name': 'Bianca', 'age': 4});
    // console.log(`Bianca record: ${id}`);
  
    // id = await this.database.put('parrots', {'name': 'Darko', 'age': 8});
    // console.log(`Darko record: ${id}`);

    // const j = { name2: 'Natan Cabral', id2: 1}
    // const data = { name: 'Natan Cabral', id: 1, age: 8, json: JSON.stringify(j)};
    // // const json = JSON.stringify(data);
    // id = await this.database.put('parrots', data)
    
    console.log('query 1');
    const q = this.database.createQuery('/[age > :age]', 'parrots');

    for await (const doc of q.setNumber('age', 3).stream()) {
      console.log(`Found ${doc}`, doc);
    }

    console.log('query 2');
    // https://www.npmjs.com/package/node-ejdb-lite
    const word1 = 'Natan Cabr';
    const word2 = 'Dar';
    // const q2 = this.database.createQuery(`/[name ~ "${word1}"]`, 'parrots');
    const q2 = this.database.createQuery(`/[name ~ "${word1}"] or /[name ~ "${word2}"]`, 'parrots');

    for await (const doc of q2.stream()) {
      console.log(`Found ${doc}`);
    }
    
    try {
      await this.database.close();
    } catch (error) {
      console.error(error);
    }

    // setTimeout(() => {
    //   console.log('Run test again');
    //   test();
    // }, 10000)
  
  }

  /**
   * 
   * @param {String} table 
   * @param {Array} data 
   */
  async putArray(table, data, opts) {

    // open
    this.database = await this.open(opts);

    console.log('putArray start');
    // /FILTERS | del
    // this.database.createQuery(`/* | del`, 'table')
    let id;
    for await (const item of data) {
      id = await this.database.put(table, item);
      console.log(id, item.id);
    }
    console.log('putArray end');
    await this.database.close();

  }

  /**
   * 
   * @param {String} table - products 
   * @param {Array} array - [{key: 'name', value: 'value' }] 
   * @param {String} op - Operation: OR | AND 
   */
  async queryStringArray(table, array, op, opts) {

    // open
    this.database = await this.open(opts);

    op && (op = 'or')

    const qArr = [];
    array && array.forEach(item => {
      const {key, value} = item;
      qArr.push(`/[${key} ~ "${value}"]`);
    });
    const qString = qArr.join(` ${String(op).toLowerCase()} `);
    const q = this.database.createQuery(qString, table);

    for await (const doc of q.stream()) {
      console.log(`Found ${doc}`);
    }
    await this.database.close();
 
  }

  async queryStringTest(opts) {

    console.log('queryStringTest start');
    this.database = await this.open(opts);

    // https://www.npmjs.com/package/node-ejdb-lite
    const word1 = 'Natan';
    const word2 = 'mercedes';
    // const q = this.database.createQuery(`/[maker ~ "MERCE"] | limit 5`, 'products');
    // const q = this.database.createQuery(`/* | limit 2`, 'products');
    const q = this.database.createQuery(`/[search re ".*PIT BULL.*"] | limit 5`, 'products'); //  | limit 5 | asc /firstName | /{firstName,lastName}

    for await (const doc of q.stream()) {
      console.log(`---------------------`);
      const {id, _raw, _json} = doc;
      console.log(id, JSON.parse(_raw), _json);
    }
    
    console.log('queryStringTest end');
    console.log('queryStringTest start 2');

    const q2 = this.database.createQuery(`/[search re ".*PIT*.BULL.*"] | limit 5`, 'products'); //  | limit 5 | asc /firstName | /{firstName,lastName}

    for await (const doc2 of q2.stream()) {
      const {id, _raw, _json} = doc2;
      console.log(id, JSON.parse(_raw), _json);
    }
    
    console.log('queryStringTest end 2');

    await this.database.close();
  }

  async getId(table, id) {
    const doc = await db.get(table, id);
  }

  async all(table, opts) {
    
    this.database = await this.open(opts);

    // https://www.npmjs.com/package/node-ejdb-lite
    const q = this.database.createQuery(`/*`, table);

    for await (const doc of q.stream()) {
      const {id, _raw, _json} = doc;
      console.log(id, JSON.parse(_raw), _json);
    }
    
    await this.database.close();
    
  }

  async queryString(table, key, value, opts) {

    console.log('queryString start', __filename);
    // open
    this.database = await this.open(opts);

    // opts tratament
    opts.ignoreSpace || (opts.ignoreSpace = false);

    // replace spaces or not
    value = opts.ignoreSpace ? value.replace(/\s+/g,'.*') : value;

    // query re -> regular expression
    const q = this.database.createQuery(`/[${key} re ".*${value}.*"]`, table);

    // regex 
    // https://regexr.com/
    // string test
    // V953 953 6008001375002  HELICE VENTILADOR ONIBUS VOLARE / MARCOPOLO HELICE 10 PAS VOLARE AGRALE / VOLARE MWM Ø470  CW LINHA HÉLICES / VENTILADORES  1932109 AGRALE  6000 / 7500 / 8500VOLARE A6 / A8 / V8L

    console.log('queryString for', __filename);

    for await (const doc of q.stream()) {
      const {id, _raw, _json} = doc;
      console.log(id, JSON.parse(_raw), _json);
    }
    
    console.log('queryString end', __filename);
    await this.database.close();
  }

  async queryStringAllKeys(table, value, opts) {
    await this.queryString(table, '**', value, opts); 
  }

  tratament(data, serialize) {
  }

}

module.exports = EjDB;