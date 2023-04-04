const express = require("express");
const bodyParser = require("body-parser");
const mongodb = require("mongodb");

const app = express();
app.use(bodyParser.json());


const MongoClient = mongodb.MongoClient;
const url = "mongodb://localhost:27017";
const dbName = "todoList";

MongoClient.connect(url, {
    useNewUrlParser: true
}, function (err, client) {
    if (err) throw err;

    const db = client.db(dbName);
    const tasks = db.collection("tasks");
    const projects = db.collection("projects");

    // API endpoints for tasks
    app.post("/tasks", (req, res) => {
        const task = req.body;

        tasks.insertOne(task, (err, result) => {
            if (err) throw err;

            res.send(result.ops[0]);
        });
    });

    app.get("/tasks", (req, res) => {
        tasks.find({}).toArray((err, docs) => {
            if (err) throw err;

            res.send(docs);
        });
    });

    app.put("/tasks/:id", (req, res) => {
        const id = new mongodb.ObjectID(req.params.id);
        const task = req.body;

        tasks.updateOne({
            _id: id
        }, {
            $set: task
        }, (err, result) => {
            if (err) throw err;

            tasks.findOne({
                _id: id
            }, (err, doc) => {
                if (err) throw err;

                res.send(doc);
            });
        });
    });


    app.delete("/tasks/:id", (req, res) => {
        const id = new mongodb.ObjectID(req.params.id);

        tasks.deleteOne({
            _id: id
        }, (err, result) => {
            if (err) throw err;

            res.send({
                message: "Task deleted"
            });
        });
    });


    app.put("/tasks/:id/done", (req, res) => {
        const id = new mongodb.ObjectID(req.params.id);

        tasks.updateOne({
            _id: id
        }, {
            $set: {
                done: true
            }
        }, (err, result) => {
            if (err) throw err;

            tasks.findOne({
                _id: id
            }, (err, doc) => {
                if (err) throw err;

                res.send(doc);
            });
        });
    });

    app.get("/tasks/:status", (req, res) => {
        const status = req.params.status;

        tasks.find({
            status: status
        }).toArray((err, docs) => {
            if (err) throw err;

            res.send(docs);
        });
    });

    // Search tasks by name
    app.get('/tasks/search/:name', (req, res) => {
        const name = req.params.name;
        db.collection('tasks').find({
            name: {
                $regex: name,
                $options: 'i'
            }
        }).toArray((err, result) => {
            if (err) return console.log(err);
            res.send(result);
        });
    });

    //create a project

    app.post("/projects", (req, res) => {
        const project = req.body;

        mongoClient.connect((err, client) => {
            if (err) throw err;

            const db = client.db("todoList");
            db.collection("projects").insertOne(project, (err, result) => {
                if (err) throw err;

                console.log("Project created");
                res.send(result.ops[0]);
                client.close();
            });
        });
    });

    //list all projects
    app.get("/projects", (req, res) => {
        mongoClient.connect((err, client) => {
            if (err) throw err;

            const db = client.db("todoList");
            db.collection("projects")
                .find()
                .toArray((err, projects) => {
                    if (err) throw err;

                    res.send(projects);
                    client.close();
                });
        });
    });

    //edit a project
    app.put("/projects/:id", (req, res) => {
        const id = new ObjectId(req.params.id);
        const updates = req.body;

        mongoClient.connect((err, client) => {
            if (err) throw err;

            const db = client.db("todoList");
            db.collection("projects").updateOne({
                    _id: id
                }, {
                    $set: updates
                },
                (err, result) => {
                    if (err) throw err;

                    console.log("Project updated");
                    res.send(result);
                    client.close();
                }
            );
        });
    });

    //delete a project
    app.delete("/projects/:id", (req, res) => {
        const id = new ObjectId(req.params.id);

        mongoClient.connect((err, client) => {
            if (err) throw err;

            const db = client.db("todoList");
            db.collection("projects").deleteOne({
                _id: id
            }, (err, result) => {
                if (err) throw err;

                console.log("Project deletd")

                res.send(result);
                client.close();
            });
        });
    });

    //assign a task to a project
    app.post('/projects/:projectId/tasks/:taskId', (req, res) => {
        const projectId = req.params.projectId;
        const taskId = req.params.taskId;

        Project.findOneAndUpdate({
                _id: projectId
            }, {
                $push: {
                    tasks: taskId
                }
            }, {
                new: true
            })
            .then(project => {
                res.json(project);
            })
            .catch(error => {
                res.status(500).json({
                    error: error.message
                });
            });
    });

    //filter tasks by project name
    app.get('/tasks', (req, res) => {
        const projectName = req.query.projectName;

        Task.find({
            project: projectName
        }, (err, tasks) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json(tasks);
            }
        });


    });

    app.get('/projects/sort/due_date', (req, res) => {
        db.collection('projects')
            .find()
            .sort({
                due_date: 1
            })
            .toArray((err, projects) => {
                if (err) throw err;
                res.send(projects);
            });
    });

    //sort projects by dates 

    //start date 
    app.get('/projects/sort/start_date', (req, res) => {
        db.collection('projects')
            .find()
            .sort({
                start_date: 1
            })
            .toArray((err, projects) => {
                if (err) throw err;
                res.send(projects);
            });
    });
    //sort by due date     
    app.get('/projects/sort/due_date', (req, res) => {
        db.collection('projects')
          .find()
          .sort({ due_date: 1 })
          .toArray((err, projects) => {
            if (err) throw err;
            res.send(projects);
          });
      });
      
});