const express=require('express');
const app=express();
const port=process.env.PORT||8000;
const exphbs=require('express-handlebars');
const bodyParser=require('body-parser');
const mysql=require('mysql');
const fileUpload=require('express-fileUpload'); 
require('dotenv').config();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/public',express.static(__dirname+'/public'));
app.use('/upload',express.static(__dirname+'/upload'));  
app.engine('hbs', exphbs.engine({extname: '.hbs'}));
app.set('view engine', 'hbs');
app.use(fileUpload());
const pool=mysql.createPool({
  connectionLimit: 100,
  host: process.env.DB_HOST,  
  user: process.env.DB_USER,
  database: process.env.DB_NAME
});
pool.getConnection((err,connection)=>{
  if(err) throw err;
  console.log('Connected as ID '+connection.threadId);
});
const routes=require('./server/routes/user');
app.use('/',routes);
app.listen(port,()=>{
  console.log('Listening on port:'+port);
})