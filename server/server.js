const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const clientPath = path.join(__dirname, '../client');
const tasksFilePath = path.join(__dirname, 'tasks.json');

app.use(bodyParser.json());
app.use(express.static(clientPath));

// Endpoint to get tasks
app.get('/tasks', (req, res) => {
    fs.readFile(tasksFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading tasks file');
        }
        res.send(JSON.parse(data || '[]'));
    });
});

// Endpoint to save tasks
app.post('/tasks', (req, res) => {
    const tasks = req.body;
    fs.writeFile(tasksFilePath, JSON.stringify(tasks, null, 2), 'utf8', (err) => {
        if (err) {
            return res.status(500).send('Error writing tasks file');
        }
        res.send('Tasks saved successfully');
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
