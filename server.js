const express = require('express');
const PORT = process.env.PORT || 4000;
const bodyParser = require('body-parser');
const morgan = require('morgan'); //logging
const employee_router = require('./routers/employee');
const menu_router = require('./routers/menu');

const app = express();
module.exports = app;
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(express.static('.'));
// enable cors
app.use(function (req, res, next) {
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
res.setHeader('Access-Control-Allow-Credentials', true);
next();
});
app.use('/api/employees', employee_router);
app.use('/api/menus', menu_router);

app.listen(PORT, (err) => {
  if(err){
    console.log(err);
  }else{
    console.log(`Server up at port ${PORT}`);
  }
})

