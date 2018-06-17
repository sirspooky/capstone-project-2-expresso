const express = require('express');
const router = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const {getTableRows, getTableRowById, deleteTableRowById} = require('./utils/query_functions');
const tableName = 'MenuItem';

// always check if the menu with the queried menu_id exists
router.use((req, res, next) => {
  const menuId = req.params.menuId;
  const selectMenuPromise = getTableRowById('Menu', menuId);
  selectMenuPromise.then(menu => {
    next();
  })
  .catch(() => {
    res.status(404).send({});
  })
})

// routes
router.get('/', (req, res, next) => {
  const menuId = req.params.menuId;
  const selectMenuItemPromise = selectMenuItems(menuId);
  selectMenuItemPromise.then(menuItems => {
    res.status(200).json({menuItems: menuItems});
  })
  .catch(code => {
    res.status(code).send({menuItems: []});
  })
});

router.post('/', (req, res, next) => {
  const menuId = req.params.menuId;
  const menuItem = req.body.menuItem;
  const postMenuItemPromise = postMenuItem(menuItem, menuId);
  postMenuItemPromise.then(id => {
    return getTableRowById(tableName, id);
  })
  .then(menuItem => {
    res.status(201).json({menuItem: menuItem});
  })
  .catch(code => {
    res.status(code).json({menuItems: []});
  })
});

router.put('/:menuItemId', (req, res, next) => {
  const menuItemId = req.params.menuItemId;
  const menuItem = req.body.menuItem;
  const putPromise = putMenuItem(menuItem, menuItemId);
  putPromise.then(changes => {
    return getTableRowById(tableName, menuItemId);
  })
  .then(menuItem => {
    res.status(200).json({menuItem: menuItem});
  })
  .catch(code => {
    res.status(code).json({});
  })
});

router.delete('/:menuItemId', (req, res, next) => {
  const menuItemId = req.params.menuItemId;
  const deletePromise = deleteTableRowById(tableName, menuItemId);
  deletePromise.then(changes => {
    res.status(204).json({});
  })
  .catch(code => {
    res.status(code).json({});
  })
});
  

// menuItem-specific query functions
function selectMenuItems(id){
  return new Promise((resolve, reject) => {
    db.all(`select * from MenuItem where menu_id = ${id}`, (err, rows) => {
      if(err) {
	reject(500);
      } else if(!rows.length) {
	reject(400);
      } else {
	resolve(rows);
      }
    })
  })
}

function postMenuItem(menuItem, id){
  return new Promise((resolve, reject) => {
    db.run(`insert into MenuItem (name, description, inventory, price, menu_id) values (?, ?, ?, ?, ${id})`, [menuItem.name, menuItem.description, menuItem.inventory, menuItem.price], function(err){
      if(err){
	reject(400);
      }else{
	resolve(this.lastID);
      }
    })
  })
}

function putMenuItem(menuItem, id){
  return new Promise((resolve, reject) => {
    db.run(`update MenuItem set name = ?, description = ?, inventory = ?, price = ? where id = ${id}`, [menuItem.name, menuItem.description, menuItem.inventory, menuItem.price], function(err){
      if(err){
	reject(400);
      }else if(!this.changes){
	reject(404);
      }else{
	resolve(this.changes);
      }
    })
  })
}

module.exports = router;
