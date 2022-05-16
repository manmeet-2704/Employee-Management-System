const mysql=require('mysql');
const pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME
});
let loggedIn=false;
let userName;
exports.view=(req,res)=>{
  if (!loggedIn) {
    res.render('login');
  }
  else{
  pool.getConnection((err,connection)=>{
    if(err) throw err;
    console.log('Connected as ID '+connection.threadId);
    connection.query('SELECT * FROM EMPLOYEE ORDER BY EMP_ID', (err, rows) => {
      connection.release();
      if (!err) {
        let removedEmployee=null;
        res.render('home', {rows});
      }
      else {
        console.log(err);
      }
      console.log('The data from the employee' + rows);
    })
  });
}
}
exports.login=(req,res)=>{
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log('Connected as ID ' + connection.threadId);
    const {email,password}=req.body;
    connection.query('SELECT * FROM LOGIN WHERE EMAIL=? AND PASSWORD=?', [email,password], (err, rows) => {
      connection.release();
      if (!err) {
        let success='danger';
        if(rows.length<=0) res.render('login',{alert: 'Invalid Email and/or Password',success});
        else{
          loggedIn = true;
          username=rows[0].username;
          res.redirect('/');
        }
      }
      else {
        console.log(err);
      }
    })
  });
}
exports.find=(req,res)=>{
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log('Connected as ID ' + connection.threadId);
    let searchName=req.body.search;
    connection.query('SELECT * FROM EMPLOYEE WHERE EMP_NAME LIKE ?', ['%'+searchName+'%'], (err, rows) => {
      connection.release();
      if (!err) {
        res.render('home', { rows });
      }
      else {
        console.log(err);
      }
      console.log('The data from the employee' + rows);
    })
  });
}

exports.form=(req,res)=>{
  res.render('add-employee');
}
exports.create=(req,res)=>{
  let image=req.files.image;
  let uploadPath='upload/'+image.name;
  image.mv(uploadPath,(err)=>{
    if(err) return res.status(500).send(err);
  const {emp_name,email,phone,dept_id,project_id,salary,age}=req.body;
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log('Connected as ID ' + connection.threadId);
    connection.query('INSERT INTO EMPLOYEE SET EMP_NAME=?, EMAIL=?, PHONE=?, DEPT_ID=?, PROJECT_ID=?,IMAGE=?, SALARY=?, AGE=?', [emp_name,email,phone,dept_id,project_id,image.name,salary,age], (err, rows) => {
      connection.release();
      if (!err) {
        res.render('add-employee', { alert: 'Employee added successfully!' });
      }
      else {
        console.log(err);
      }
    })
  });
});
}


exports.edit=(req,res)=>{
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log('Connected as ID ' + connection.threadId);
    connection.query('SELECT *FROM EMPLOYEE WHERE EMP_ID=?',[req.params.emp_id], (err, rows) => {
      connection.release();
      if (!err) {
        res.render('edit-employee', {rows});
      }
      else {
        console.log(err);
      }
    })
  });
}

exports.update=(req,res)=>{
  const { emp_name, email, phone, dept_id, project_id, salary, age} = req.body;
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log('Connected as ID ' + connection.threadId);
    connection.query('UPDATE EMPLOYEE SET EMP_NAME=?, EMAIL=?, PHONE=?, DEPT_ID=?, PROJECT_ID=?, SALARY=?, AGE=? WHERE EMP_ID=?', [emp_name, email, phone, dept_id, project_id, salary,age, req.params.emp_id], (err, rows) => {
      connection.release();
      if (!err) {
        pool.getConnection((err, connection) => {
          if (err) throw err;
          console.log('Connected as ID ' + connection.threadId);
          connection.query('SELECT *FROM EMPLOYEE WHERE EMP_ID=?', [req.params.emp_id], (err, rows) => {  
            connection.release();
            if (!err) {
              res.render('edit-employee', { alert: ' Updated Successfully', rows });
            }
            else {
              console.log(err);
            }
          })
        }); 
      }
      else {
        console.log(err);
      }
    })
  });
}

exports.delete=(req,res)=>{
  pool.getConnection((err,connection)=>{
    if(err) throw err;
    console.log('Connected as ID '+ connection.threadId);
    connection.query('DELETE FROM EMPLOYEE WHERE EMP_ID=?', [req.params.emp_id], (err, rows) => {
      connection.release();
      if (!err) {
        let removedEmployee='ok';
        connection.query('SELECT * FROM EMPLOYEE',(err,rows)=>{
          res.render('home',{rows,removedEmployee});
        })
      }
      else {
        console.log(err);
      }
      console.log('The data from the employee' + rows);
    });
  })
}


exports.viewEmployee = (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log('Connected as ID ' + connection.threadId);
    connection.query('SELECT * FROM EMPLOYEE WHERE EMP_ID=?', [req.params.emp_id], (err, rows) => {
      connection.release();
      if (!err) {
        res.render('view-employee', {rows});
      }
      else {
        console.log(err);
      }
      console.log('The data from the employee' + rows);
    })
  });
}

exports.viewDepartments=(req,res)=>{
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log('Connected as ID ' + connection.threadId);
    connection.query('SELECT * FROM DEPARTMENT', (err, rows) => {
      connection.release();
      if (!err) {
        res.render('view-departments', { rows });
      }
      else {
        console.log(err);
      }
    })
  });
}
exports.viewProjects=(req,res)=>{
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log('Connected as ID ' + connection.threadId);
    connection.query('SELECT * FROM PROJECT', (err, rows) => {
      connection.release();
      if (!err) {
        res.render('view-projects', { rows });
      }
      else {
        console.log(err);
      }
      console.log('The data from the employee' + rows);
    })
  });
}

exports.singleDept=(req,res)=>{
  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query('SELECT * FROM DEPARTMENT NATURAL JOIN EMPLOYEE WHERE DEPT_ID=?', [req.params.dept_id],(err,rows)=>{
      connection.release();
      if(!err && rows.length>0) res.render('view-department',{rows});
      else if(rows.length<=0){
        pool.getConnection((err,connection)=>{
          if(err) throw err;
          connection.query('SELECT * FROM DEPARTMENT WHERE DEPT_ID=?', [req.params.dept_id],(err,rows)=>{
            connection.release();
            if(!err) res.render('view-department',{rows, alert: 'No Employees currently working in this Department!'});
            else throw err;
          })
        })
      }
      else throw err;
    })
})
}

exports.signup=(req,res)=>{
  res.render('signup');
}

exports.signupSubmit=(req,res)=>{
  const {email,password,username}=req.body;
  pool.getConnection((err,connection)=>{
    connection.release();
    if(err) throw err;
    let success='success';
    connection.query('INSERT INTO LOGIN SET EMAIL=?, PASSWORD=?, USERNAME=?', [email,password,username],(err,rows)=>{
      if(err){
        success="danger"
        res.render('signup', {alert: 'Invalid Email and/or Password'})
      }
      res.render('login',{alert: 'Account created!',success});
    })
  })
}


exports.singleProject=(req,res)=>{
  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query('SELECT * FROM PROJECT NATURAL JOIN EMPLOYEE WHERE PROJECT_ID=?', [req.params.project_id], (err, rows) => {
      connection.release();
      if (!err && rows.length > 0) res.render('view-project', { rows });
      else if (rows.length <= 0) {
        pool.getConnection((err, connection) => {
          if (err) throw err;
          connection.query('SELECT * FROM PROJECT WHERE PROJECT_ID=?', [req.params.project_id], (err, rows) => {
            connection.release();
            if (!err) res.render('view-project', { rows, alert: 'No Employees currently working on this Project!' });
            else throw err;
          })
        })
      }
      else throw err;
    })
  })
}