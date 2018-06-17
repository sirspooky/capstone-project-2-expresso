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

app.use('/api/employees', employee_router);
app.use('/api/menus', menu_router);

app.listen(PORT, (err) => {
  if(err){
    console.log(err);
  }else{
    console.log(`Server up at port ${PORT}`);
  }
})

