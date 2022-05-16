create table login(
    email varchar(255) primary key,
    password varchar(255)
    username varchar(255));
create table department(
    dept_id int primary key,
    dept_name varchar(255),
    description text);
create table project(
    project_id int primary key,
    project_name varchar(255),
    description text);
create table employee(
    emp_id int primary key,
    emp_name varchar(255),
    email varchar(255),
    phone varchar(255),
    dept_id int,
    project_id int,
    age int,
    salary int,
    image varchar(255),
    foreign key(email) references login(email),
    foreign key(dept_id) references department(dept_id),
    foreign key(project_id) references project(project_id));
