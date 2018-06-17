const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// general query functions for use in routers
module.exports = {
  // get all rows
  getTableRows: function(tableName){
    return new Promise((resolve, reject) => {
      db.all(`select * from ${tableName}`, (err, rows) => {
	if(err) {
	  reject(500);
	} else {
	  resolve(rows);
	}
      })
    })
  },
  // get one row by id
  getTableRowById: function(tableName, id){
    return new Promise((resolve, reject) => {
      db.get(`select * from ${tableName} where id = ${id}`, (err, row) => {
	if(err) {
	  reject(500);
	} else if(!row) {
	  reject(404);
	} else {
	  resolve(row);
	}
      })
    })
  },
  // delete row(s) by id
  deleteTableRowById: function(tableName, id){
    return new Promise((resolve, reject) => {
      db.run(`delete from ${tableName} where id = ${id}`, function(err, row){
	if(err) {
	  reject(500);
	} else if(!this.changes) {
	  reject(404);
	} else {
	  resolve(this.changes);
	}
      })
    })
  }
}
