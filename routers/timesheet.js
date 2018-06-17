const express = require('express');
const router = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const {getTableRows, getTableRowById, deleteTableRowById} = require('./utils/query_functions');
const tableName = 'Timesheet';

// always check if an employee with the queried employee_id exists
router.use((req, res, next) => {
  const employeeId = req.params.employeeId;
  const selectEmployeePromise = getTableRowById('Employee', employeeId);
  selectEmployeePromise.then(employee => {
    next();
  })
  .catch(() => {
    res.status(404).send({});
  })
})

// routes
router.get('/', (req, res, next) => {
  const employeeId = req.params.employeeId;
  const selectTimesheetPromise = selectTimesheets(employeeId);
  selectTimesheetPromise.then(timesheets => {
    res.status(200).json({timesheets: timesheets});
  })
  .catch(code => {
    res.status(code).send({timesheets: []});
  })
});

router.post('/', (req, res, next) => {
  const employeeId = req.params.employeeId;
  const timesheet = req.body.timesheet;
  const postTimesheetPromise = postTimesheet(timesheet, employeeId);
  postTimesheetPromise.then(id => {
    return getTableRowById(tableName, id);
  })
  .then(timesheet => {
    res.status(201).json({timesheet: timesheet});
  })
  .catch(code => {
    res.status(code).json({timesheets: []});
  })
});

router.put('/:timesheetId', (req, res, next) => {
  const timesheetId = req.params.timesheetId;
  const timesheet = req.body.timesheet;
  const putPromise = putTimesheet(timesheet, timesheetId);
  putPromise.then(changes => {
    return getTableRowById(tableName, timesheetId);
  })
  .then(timesheet => {
    res.status(200).json({timesheet: timesheet});
  })
  .catch(code => {
    res.status(code).json({});
  })
});


router.delete('/:timesheetId', (req, res, next) => {
  const timesheetId = req.params.timesheetId;
  const deletePromise = deleteTableRowById(tableName, timesheetId);
  deletePromise.then(changes => {
    res.status(204).json({});
  })
  .catch(code => {
    res.status(code).json({});
  })
});

// timesheet-specific query functions
function selectTimesheets(id){
  return new Promise((resolve, reject) => {
    db.all(`select * from Timesheet where employee_id = ${id}`, (err, rows) => {
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

function postTimesheet(timesheet, id){
  return new Promise((resolve, reject) => {
    db.run(`insert into Timesheet (hours, rate, date, employee_id) values (?, ?, ?, ${id})`, [timesheet.hours, timesheet.rate, timesheet.date], function(err){
      if(err){
	reject(400);
      }else{
	resolve(this.lastID);
      }
    })
  })
}

function putTimesheet(timesheet, id){
  return new Promise((resolve, reject) => {
    db.run(`update Timesheet set hours = ?, rate = ?, date = ? where id = ${id}`, [timesheet.hours, timesheet.rate, timesheet.date], function(err){
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
