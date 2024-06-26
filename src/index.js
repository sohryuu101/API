const express = require('express');
const app = express();
const PORT = 8080;
const { taskList } = require('./defaultTasks');
const { userList } = require('./defaultUsers');
const generateRandomToken = require('./token');
const { emailExists, checkUserCredentials } = require('./checkEmailPass');

app.use(express.json())

app.listen(
    PORT, 
    () => console.log(`Server is running on http://localhost:${PORT}`)); 

app.get('/', (req, res) => {
    res.send('This is landing page, please make a http request as per the API documentation.');
});

// GET /tasks
// This endpoint will return all tasks in the taskList
app.get('/tasks', (req, res) => {
    res.status(200).send({
        "code": 200,
	    "message": "OK",
        "tasks": taskList
    });
});

// POST /tasks
// This endpoint will add a new task to the taskList
app.post('/tasks', (req, res) => {
    const tasks  = req.body.tasks;
    const completed = false;

    // Check if tasks array is present
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
        return res.status(400).send({
            "code": 400,
            "message": "Please provide a non-empty array of tasks."
        });
    }

    if (tasks.some(task => !task.task || task.task === "")) {
        return res.status(400).send({
            "code": 400,
            "message": "Invalid or missing task name in one of the tasks"
        });
    }

    const addedTasks = tasks.map(task => {
        const taskId = (taskList.length + 1).toString(); // Generate a new ID based on taskList length
        const newTask = { "id": taskId, "task": task.task, "completed": false };
        taskList.push(newTask);
        return newTask;
    });

    res.status(201).send({
        "code": 201,
        "message": "Created task(s)",
        "tasks": addedTasks
    });
});

// POST /register
// This endpoint will add a new user to the userList
app.post('/register', (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    if (email == "" || password == "") {
        return res.status(400).send(
            {
                "code": 400,
                "message": "Username or password is missing"
            }
        );
    }
    
    if (emailExists(userList, email)) {
        return res.status(409).send(
            {
                "code": 409,
                "message": "Email already exists"
            }
        );
    }
    
    if (password !== confirmPassword) {
        return res.status(400).send(
            {
                "code": 400,
                "message": "Password does not match"
            }
        );
    }

    const userId = (userList.length + 1).toString(); // Generate a new ID based on taskList length
    userList.push({ "id":`${userId}`, "name": `${name}`, "email": `${email}`, "password": `${password}` });

    res.status(201).send({
        "code": 201,
        "message": "User successfuly created",
        "user": {
            "id": `${userId}`,
            "name": `${name}`,
            "email": `${email}`
        }
    });
});

// POST /login
// This endpoint will return a token for the user
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (email == "" || password == "") {
        return res.status(400).send(
            {
                "code": 400,
                "message": "Username or password is missing"
            }
        );
    }

    if (!emailExists(userList, email)) {
        return res.status(404).send(
            {
                "code": 404,
                "message": "User not found, please regist first"
            }
        );
    
    }

    if (!checkUserCredentials(userList, email, password)) {
        return res.status(403).send(
            {
                "code": 403,
                "message": "Incorrect password"
            }
        );
    }

    const token = generateRandomToken(16);

    res.status(200).send({
        "code": 200,
        "message": "Login Succeed",
        "token": token
    });
});

// PATCH /tasks/:id
// This endpoint will update the name of a task with the given ID
app.patch('/tasks/:id', (req, res) => {
    const { id } = req.params; 
    const { newName } = req.body; 

    const taskIndex = taskList.findIndex(task => task.id === id);

    if (taskIndex === -1) {
        return res.status(404).send({
            "code": 404,
            "message": "Task not found"
        });
    }

    taskList[taskIndex].task = newName;

    res.status(200).send({
        "code": 200,
        "message": "Task updated",
        "updated": taskList[taskIndex]
    });
});

// DELETE /tasks/:id
// This endpoint will delete the task with the given ID
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params; 

    if (!id) {
        return res.status(400).send({
            "code": 400,
            "message": "Task ID is missing"
        });
    }

    const taskIndex = taskList.findIndex(task => task.id === id);


    if (taskIndex === -1) {
        return res.status(404).send({
            "code": 404,
            "message": "Task not found"
        });
    }


    const [deletedTask] = taskList.splice(taskIndex, 1);


    res.status(200).send({
        "code": 200,
        "message": "Task deleted",
        "task": deletedTask
    });
});