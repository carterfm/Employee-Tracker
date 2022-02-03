DROP DATABASE IF EXISTS company_db;
CREATE DATABASE company_db;

USE company_db;

CREATE TABLE department_table (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(30) NOT NULL
);

CREATE TABLE role_table (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES department_table(id) ON DELETE SET NULL
    -- The elimination of a department doesn't necessarily mean a job is going away--it might just be being put
    -- under a different department
);

CREATE TABLE employee_table (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT,
    manager_id INT,
    FOREIGN KEY (role_id) REFERENCES role_table(id) ON DELETE CASCADE,
    -- I figure that if you delete a role, it means the employees associated with that role are fired
    FOREIGN KEY (manager_id) REFERENCES employee_table(id) ON DELETE SET NULL
    -- Managers, on the other hand, can change without one's job necessarily being lost
);

-- potentially change some of these these SET NULLs to cascade later depending on feedback from prof + TAs