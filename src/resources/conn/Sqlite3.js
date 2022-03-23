// Windows
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:'); //mode: sqlite3.OPEN_READONLY

class Sqlite3 {

  database = null;

  constructor(opts) {
    this.filename = opts.filename || opts.name;
    this.mode = opts.mode;
    // options database sqlite3
    this.conn = {
      filename:`./${this.filename}.sqlite3`, 
      mode: this.mode,
    };
  }

  open() {
    this.database = new sqlite3.Database(this.conn, errorOpen);
  }

  openCached() {
    this.database = new sqlite3.cached.Database(this.conn, errorOpen);
  }

  get() {
    this.database;
  }

  all(sql) {
    this.database.all(sql, (err, rows) => {
      console.log(sql, err, rows);
    });
  }

  each(sql) {
    this.database.each(sql, (err, rows) => {
      console.log(sql, err, rows);
    });
  }

  exec(sql) {
    database.exec(sql, (err, rows) => {
      console.log(sql, err, rows);
    });
  }

  serialize() {
    this.database.serialize(function() {
      // Queries scheduled here will be serialized.
      this.database.serialize(function(data) {
        // Queries scheduled here will still be serialized.
        console.log(data);
      });
      // Queries scheduled here will still be serialized.
    });
  }

  test() {
    db.serialize(function() {
      db.run("CREATE TABLE lorem (info TEXT)");
  
      var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
      for (var i = 0; i < 10; i++) {
          stmt.run("Ipsum " + i);
      }
      stmt.finalize();
  
      db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
          console.log(row.id + ": " + row.info);
      });
    });
  
    db.close();  
  }
  
  test2() {
    // Directly in the function arguments.
    db.run("UPDATE tbl SET name = ? WHERE id = ?", "bar", 2);

    // As an array.
    db.run("UPDATE tbl SET name = ? WHERE id = ?", [ "bar", 2 ]);

    // As an object with named parameters.
    db.run("UPDATE tbl SET name = $name WHERE id = $id", {
        $id: 2,
        $name: "bar"
    });
  }

}

function errorOpen(err) {
  if (err) console.error('Database opening error: ', err);
}

// expose the class
module.exports = Sqlite3;