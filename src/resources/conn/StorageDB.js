// only works preload.js, window.localStorage 
const localStorageDB = require('localstoragedb');

class StorageDB {

	constructor() {
		this.test();
	}

	test() {

		// Initialise. If the database doesn't exist, it is created
		var lib = new localStorageDB("products", window.localStorage);

		// Check if the database was just created. Useful for initial database setup
		if( lib.isNew() ) {

				// create the "books" table
			lib.createTable("books", ["code", "title", "author", "year", "copies"]);

			// insert some data
			lib.insert("books", {code: "B001", title: "Phantoms in the brain", author: "Ramachandran", year: 1999, copies: 10});
			lib.insert("books", {code: "B002", title: "The tell-tale brain", author: "Ramachandran", year: 2011, copies: 10});
			lib.insert("books", {code: "B003", title: "Freakonomics", author: "Levitt and Dubner", year: 2005, copies: 10});
			lib.insert("books", {code: "B004", title: "Predictably irrational", author: "Ariely", year: 2008, copies: 10});
			lib.insert("books", {code: "B005", title: "Tesla: Man out of time", author: "Cheney", year: 2001, copies: 10});
			lib.insert("books", {code: "B006", title: "Salmon fishing in the Yemen", author: "Torday", year: 2007, copies: 10});
			lib.insert("books", {code: "B007", title: "The user illusion", author: "Norretranders", year: 1999, copies: 10});
			lib.insert("books", {code: "B008", title: "Hubble: Window of the universe", author: "Sparrow", year: 2010, copies: 10});

			// commit the database to localStorage
			// all create/drop/insert/update/delete operations should be committed
			lib.commit();
			
		}

		// rows for pre-population
		var rows = [
			{code: "B001", title: "Phantoms in the brain", author: "Ramachandran", year: 1999, copies: 10},
			{code: "B002", title: "The tell-tale brain", author: "Ramachandran", year: 2011, copies: 10},
			{code: "B003", title: "Freakonomics", author: "Levitt and Dubner", year: 2005, copies: 10},
			{code: "B004", title: "Predictably irrational", author: "Ariely", year: 2008, copies: 10},
			{code: "B005", title: "Tesla: Man out of time", author: "Cheney", year: 2001, copies: 10},
			{code: "B006", title: "Salmon fishing in the Yemen", author: "Torday", year: 2007, copies: 10},
			{code: "B007", title: "The user illusion", author: "Norretranders", year: 1999, copies: 10},
			{code: "B008", title: "Hubble: Window of the universe", author: "Sparrow", year: 2010, copies: 10}
		];

		// create the table and insert records in one go
		lib.createTableWithData("books", rows);
	
	}

	// Altering
	/*
	// If database already exists, and want to alter existing tables
	if(! (lib.columnExists("books", "publication")) ) {
		lib.alterTable("books", "publication", "McGraw-Hill Education");
		lib.commit(); // commit the deletions to localStorage
	}

	// Multiple columns can also added at once
	if(! (lib.columnExists("books", "publication") && lib.columnExists("books", "ISBN")) ) {
		lib.alterTable("books", ["publication", "ISBN"], {publication: "McGraw-Hill Education", ISBN: "85-359-0277-5"});
		lib.commit(); // commit the deletions to localStorage
	}
	*/

	// Query
	/*
	// simple select queries
	lib.queryAll("books", {
		query: {year: 2011}
	});
	lib.queryAll("books", {
		query: {year: 1999, author: "Norretranders"}
	});

	// select all books
	lib.queryAll("books");

	// select all books published after 2003
	lib.queryAll("books", {
		query: function(row) {    // the callback function is applied to every row in the table
			if(row.year > 2003) {		// if it returns true, the row is selected
				return true;
			} else {
				return false;
			}
		}
	});

	// select all books by Torday and Sparrow
	lib.queryAll("books", {
			query: function(row) {
							if(row.author == "Torday" || row.author == "Sparrow") {
							return true;
						} else {
							return false;
				}
			},
			limit: 5
	});
	*/

	// Update
	/*
	// change the title of books published in 1999 to "Unknown"
	lib.update("books", {year: 1999}, function(row) {
		row.title = "Unknown";

		// the update callback function returns to the modified record
		return row;
	});

	// add +5 copies to all books published after 2003
	lib.update("books",
		function(row) {	// select condition callback
			if(row.year > 2003) {
				return true;
			} else {
				return false;
			}
		},
		function(row) { // update function
			row.copies+=5;
			return row;
		}
	);
	*/
	
	// Detele
	/*
	// delete all books published in 1999
	lib.deleteRows("books", {year: 1999});

	// delete all books published before 2005
	lib.deleteRows("books", function(row) {
		if(row.year < 2005) {
			return true;
		} else {
			return false;
		}
	});

	lib.commit(); // commit the deletions to localStorage
	*/

}

module.exports = StorageDB