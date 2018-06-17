const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const {getTableRows, getTableRowById, deleteTableRowById} = require('./utils/query_functions');
const tableName = 'Employee';
    
// timesheet related requests will be handled by nested issues_router
const timesheet_router = require('./timesheet'); 
router.use('/:employeeId/timesheets', timesheet_router);

// routes
router.get('/', (req, res, next) => {
  const selectPromise = selectEmployees(tableName);
  selectPromise.then(rows => {
    res.status(200).json({employees: rows});
  })
  .catch(code => {
    res.status(code).send();
  })
});

router.post('/', (req, res, next) => {
  const employee = req.body.employee;
  const postEmployeePromise = postEmployee(employee);
  postEmployeePromise.then(id => {
    return getTableRowById(tableName, id);
  })
  .then(employee => {
    res.status(201).json({employee: employee});
  })
  .catch(code => {
    res.status(code).json({});
  })
});

router.get('/:employeeId', (req, res, next) => {
  const employeeId = req.params.employeeId;
  const selectPromise = getTableRowById(tableName, employeeId);
  selectPromise.then(employee => {
    res.status(200).json({employee: employee});
  })
  .catch(code => {
    res.status(code).json({});
  })
});

router.put('/:employeeId', (req, res, next) => {
  const employeeId = req.params.employeeId;
  const employee = req.body.employee;
  const putPromise = putEmployee(employee, employeeId);
  putPromise.then(changes => {
    return getTableRowById(tableName, employeeId);
  })
  .then(employee => {
    res.status(200).json({employee: employee});
  })
  .catch(code => {
    res.status(code).json({});
  })
});

router.delete('/:employeeId', (req, res, next) => {
  const employeeId = req.params.employeeId;
  const deletePromise = deleteEmployee(employeeId);
  deletePromise.then(changes => {
    return getTableRowById(tableName, employeeId);
  })
  .then(employee => {
    res.status(200).json({employee: employee});
  })
  .catch(code => {
    res.status(code).json({});
  })
});
  

// employee-specific query functions
function selectEmployees(){
  return new Promise((resolve, reject) => {
    db.all('select * from Employee where is_current_employee = 1', (err, rows) => {
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

function postEmployee(employee){
  return new Promise((resolve, reject) => {
    db.run(`insert into Employee (name, position, wage, is_current_employee) values (?, ?, ?, ?)`, [employee.name, employee.position, employee.wage, 1], function(err){
      if(err){
	reject(400);
      }else{
	resolve(this.lastID);
      }
    })
  })
}

function putEmployee(employee, id){
  return new Promise((resolve, reject) => {
    db.run(`update Employee set name = ?, position = ?, wage = ? where id = ${id}`, [employee.name, employee.position, employee.wage], function(err){
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

function deleteEmployee(id){
  return new Promise((resolve, reject) => {
    db.run(`update Employee set is_current_employee = 0 where id = ${id}`, function(err){
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
