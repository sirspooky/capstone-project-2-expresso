const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const {getTableRows, getTableRowById, deleteTableRowById} = require('./utils/query_functions');
const tableName = 'Menu';
    
// menuItem related requests will be handled by nested issues_router
const menuItem_router = require('./menuItem'); 
router.use('/:menuId/menu-items', menuItem_router);

// routes
router.get('/', (req, res, next) => {
  const selectPromise = getTableRows(tableName);
  selectPromise.then(rows => {
    res.status(200).json({menus: rows});
  })
  .catch(code => {
    res.status(code).send();
  })
});

router.post('/', (req, res, next) => {
  const menu = req.body.menu;
  const postMenuPromise = postMenu(menu);
  postMenuPromise.then(id => {
    return getTableRowById(tableName, id);
  })
  .then(menu => {
    res.status(201).json({menu: menu});
  })
  .catch(code => {
    res.status(code).json({});
  })
});

router.get('/:menuId', (req, res, next) => {
  const menuId = req.params.menuId;
  const selectPromise = getTableRowById(tableName, menuId);
  selectPromise.then(menu => {
    res.status(200).json({menu: menu});
  })
  .catch(code => {
    res.status(code).json({});
  })
});

router.put('/:menuId', (req, res, next) => {
  const menuId = req.params.menuId;
  const menu = req.body.menu;
  const putPromise = putMenu(menu, menuId);
  putPromise.then(changes => {
    return getTableRowById(tableName, menuId);
  })
  .then(menu => {
    res.status(200).json({menu: menu});
  })
  .catch(code => {
    res.status(code).json({});
  })
});

router.delete('/:menuId', (req, res, next) => {
  const menuId = req.params.menuId;
  const checkMenuItemsPromise = checkMenuItemsByMenuId(menuId);
  checkMenuItemsPromise.then(() => {
    return deletePromise = deleteTableRowById(tableName, menuId);
  })
  .then(changes => {
    res.status(204).json({});
  })
  .catch(code => {
    res.status(code).json({});
  })
});
  

// menu-specific query functions
function selectMenus(){
  return new Promise((resolve, reject) => {
    db.all('select * from Menu where is_current_menu = 1', (err, rows) => {
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

function postMenu(menu){
  return new Promise((resolve, reject) => {
    db.run(`insert into Menu (title) values (?)`, [menu.title], function(err){
      if(err){
	reject(400);
      }else{
	resolve(this.lastID);
      }
    })
  })
}

function putMenu(menu, id){
  return new Promise((resolve, reject) => {
    db.run(`update Menu set title = ? where id = ${id}`, [menu.title], function(err){
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

// check if a menu has associated menu items
// reject if yes, otherwise resolve 0
function checkMenuItemsByMenuId(id){
  return new Promise((resolve, reject) => {
    db.all(`select * from MenuItem where menu_id = ${id}`, function(err, rows){
      if(err){
	reject(400);
      }else if(rows.length){
	reject(400);
      }else{
	resolve(0);
      }
    })
  })
}

module.exports = router;
