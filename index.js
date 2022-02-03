const inquirer = require('inquirer');
const mysql = require('mysql2');
const figlet = require('figlet');

const db = mysql.createConnection({
    host: 'localhost',
    // MySQL username,
    user: 'root',
    // MySQL password
    // How do we deal with deploying this? Will the user have to put their own MySQL password in there?
    // Ask about this tomorrow morning
    password: 'password',
    database: 'company_db'
});

//Testing something
// db.query("SELECT first_name, last_name FROM employee_table",
// (err, data) => {
//     if (err) {
//         throw err;
//     }
//     console.log(data);
// });

//Prompts to use in inquirer calls
//Prompt for navigating the main program loop
const mainMenuOptions = [{
    type: "list",
    message: "What would you like to do?",
    choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Quit"],
    name: "mainMenuChoice"
}];

//Prompt for adding a department 
const departmentPrompt = [{
    type: "input",
    message: "Please enter the name of the department you would like to add to the database (Maximum length: 30 characters): ",
    name: "newDepartment"
}];

//Query to view departments
const viewAllDepartments = () => {
    db.query("SELECT department_name, id AS department_id FROM department_table", (err, data) => {
        if (err) {
            throw err;
        }
        console.table(data);
        runMainLoop();
    });
}

//Query to view all the roles
const viewAllRoles = () => {
    db.query("SELECT role_table.title AS role_title, role_table.id AS role_id, department_table.department_name AS department, role_table.salary FROM role_table JOIN department_table ON role_table.department_id = department_table.id", (err, data) => {
        if (err) {
            throw err;
        }
        console.table(data);
        runMainLoop();
    });
}

//Query to view all employees
const viewAllEmployees = () => {
    db.query("SELECT employee_table.id AS employee_id, employee_table.first_name, employee_table.last_name, role_table.title AS role_title, department_table.department_name, role_table.salary, manager_table.last_name AS manager_last_name FROM employee_table JOIN role_table ON employee_table.role_id = role_table.id JOIN department_table ON role_table.department_id = department_table.id JOIN employee_table AS manager_table ON employee_table.manager_id = manager_table.id",
    (err, data) => {
        if (err) {
            throw err;
        }
        console.table(data);
        runMainLoop();
    });
}

//Query to add department
const addDepartment = async () => {
    const { newDepartment } = await inquirer.prompt(departmentPrompt);

    db.query("INSERT INTO department_table (department_name) VALUES (?)", newDepartment, (err, data) => {
        if (err) {
            throw err;
        }
        console.log("\nAdded " + newDepartment + " to department_table\n");
        runMainLoop();
    });
}

const runMainLoop = async () => {
    const { mainMenuChoice } = await inquirer.prompt(mainMenuOptions);

    switch (mainMenuChoice) {
        case "View all departments":
            // query to view all departments
            viewAllDepartments();
            break;
        case "View all roles":
            viewAllRoles();
            break;
        case "View all employees":
            //query to view all employees
            viewAllEmployees();
            break;
        case "Add a department":
            addDepartment();
            break;
        default: 
            keepLooping = false;
            console.log("\nQuitting. Thank you for using Employee Tracker!");
            exit(0);
            break;
        }
}

const runApp = async () => {
    console.log("\nWelcome to Employee Tracker!\n");
    runMainLoop();
}

runApp();

//Pseudo-code 
//On startup, we immediately enter the main program loop
//We're prompted to view all departments, view all roles, view all employees, add a department, 
//add a role, add an employee, update an employee role
// -> view all departments
// -> -> print a formatted table displaying all department names and department ids