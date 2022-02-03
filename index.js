const inquirer = require('inquirer');
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    // MySQL username,
    user: 'root',
    // MySQL password
    // How do we deal with deploying this? Will the user have to put their own MySQL password in there?
    // Ask about this tomorrow morning
    password: '',
    database: 'company_db'
});

//Arrays to be used for dropdown menus that will vary based on database contents and
//objects that will be used to generate data based on dropdown 
//Will be initialized when the app is run
let listOfDepartmentNames = [];
let departmentNamesToIds = {};
let listOfRoleTitles = [];
let roleTitlesToIds = {};
//My array and object of employee names has an N/A entry since employees without managers
//are supposed to have null in their manager_id field in employee_table
let listOfEmployeeNames = ["N/A"];
let employeeNamesToIds = {"N/A": null};

//Function for initializing the above arrays
const buildNameArrays = () => {
    db.query("SELECT * FROM department_table", (err, data) => {
        if (err) {
            throw err;
        }
        for (let i = 0; i < data.length; i++) {
            listOfDepartmentNames.push(data[i].department_name);
            departmentNamesToIds[data[i].department_name] = data[i].id;
        }
    });
    db.query("SELECT * FROM role_table", (err, data) => {
        if (err) {
            throw err;
        }
        for (let i = 0; i < data.length; i++) {
            listOfRoleTitles.push(data[i].title);
            roleTitlesToIds[data[i].title] = data[i].id;
        }
    });
    db.query("SELECT * FROM employee_table", (err, data) => {
        if (err) {
            throw err;
        }
        for (let i = 0; i < data.length; i++) {
            listOfEmployeeNames.push(data[i].first_name + " " + data[i].last_name);
            employeeNamesToIds[data[i].first_name + " " + data[i].last_name] = data[i].id;
        }
    });
}



//Prompts to use in inquirer calls
//Prompt for navigating the main program loop
const mainMenuOptions = [{
    type: "list",
    message: "What would you like to do?",
    choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee's role", "Quit"],
    name: "mainMenuChoice"
}];

//Prompt for adding a department 
const departmentPrompt = [{
    type: "input",
    message: "Please enter the name of the department you would like to add to the database (maximum length: 30 characters): ",
    name: "newDepartment"
}];

//Prompt for adding a role
const rolePrompt = [
    {
        type: "input",
        message: "Please enter the title of the role you would like to add to the database (Maximum length: 30 characters): ",
        name: "newRole"
    }, 
    {
        type: "input",
        message: "Please enter the salary of the role you would like to add to the database: ",
        name: "salary"
    }, 
    {
        type: "list",
        message: "To what department does this role belong?",
        choices: listOfDepartmentNames,
        name: "departmentName"
    }
];

//Prompt for adding an employee
const employeePrompt = [
    {
        type: "input",
        message: "Please enter the first name of this new employee (maximum length: 30 characters): ",
        name: "firstName"
    }, 
    {
        type: "input",
        message: "Please enter the last name of this new employee (maximum length: 30 characters): ",
        name: "lastName"
    },
    {
        type: "list",
        message: "What role will this employee be taking on?",
        choices: listOfRoleTitles,
        name: "roleTitle"
    }, 
    {
        type: "list",
        message: "What is the name of this employee's manager?",
        choices: listOfEmployeeNames,
        name: "managerName"
    }
];

//Prompt for updating employee role
const updateEmployeePrompt = [
    {
        type: "list",
        message: "What is the name of the employee whose role you wish to change?",
        choices: listOfEmployeeNames,
        name: "employeeName"
    },
    {
        type: "list",
        message: "What new role will this employee be taking on?",
        choices: listOfRoleTitles,
        name: "newRoleTitle"
    }
];


//QUERIES
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
    db.query("SELECT employee_table.id AS employee_id, employee_table.first_name, employee_table.last_name, role_table.title AS role_title, department_table.department_name, role_table.salary, manager_table.first_name AS manager_first_name, manager_table.last_name AS manager_last_name FROM employee_table JOIN role_table ON employee_table.role_id = role_table.id LEFT JOIN department_table ON role_table.department_id = department_table.id LEFT JOIN employee_table AS manager_table ON employee_table.manager_id = manager_table.id",
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
        listOfDepartmentNames.push(newDepartment);
        departmentNamesToIds[newDepartment] = data.insertId;
        console.log("\nAdded " + newDepartment + " to department_table\n");
        runMainLoop();
    });
}

//Query to add role 
const addRole = async () => {
    const { newRole, salary, departmentName } = await inquirer.prompt(rolePrompt);
    const departmentId = departmentNamesToIds[departmentName];

    db.query("INSERT INTO role_table (title, salary, department_id) VALUES (?, ?, ?)", [newRole, salary, departmentId], (err, data) => {
        if (err) {
            throw err;
        }
        listOfRoleTitles.push(newRole);
        roleTitlesToIds[newRole] = data.insertId;
        console.log("\nAdded " + newRole + " to role_table\n");
        runMainLoop();
    })
}

const addEmployee = async () => {
    const { firstName, lastName, roleTitle, managerName } = await inquirer.prompt(employeePrompt);
    const roleId = roleTitlesToIds[roleTitle];
    const managerId = employeeNamesToIds[managerName];

    db.query("INSERT INTO employee_table (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", [firstName, lastName, roleId, managerId], (err, data) => {
        if (err) {
            throw err;
        }
        // console.log(data);
        listOfEmployeeNames.push(firstName + " " + lastName);
        employeeNamesToIds[firstName + " " + lastName] = data.insertId;
        console.log("\nAdded " + firstName + " " + lastName + " to employee_table\n");
        runMainLoop();
    });
}

const updateEmployeeRole = async () => {
    const { employeeName, newRoleTitle } = await inquirer.prompt(updateEmployeePrompt);
    const roleId = roleTitlesToIds[newRoleTitle];
    const employeeId = employeeNamesToIds[employeeName];

    db.query("UPDATE employee_table SET role_id = ? WHERE id = ?", [roleId, employeeId], (err, data) => {
        if (err) {
            throw err;
        }
        console.log("\Updated " + employeeName + "'s role\n");
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
        case "Add a role":
            addRole();
            break;
        case "Add an employee":
            addEmployee();
            break;
        case "Update an employee's role":
            updateEmployeeRole();
            break;
        default: 
            keepLooping = false;
            console.log("\nQuitting. Thank you for using Employee Tracker!");
            db.end();
            break;
        }
}

const runApp = async () => {
    buildNameArrays();
    console.log("\nWelcome to Employee Tracker!\n");
    runMainLoop();
}

runApp();