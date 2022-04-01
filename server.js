require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const mongodb = require("mongodb")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secret = "bhjgiklmd"
const mongoClient = mongodb.MongoClient;

app.use(cors());
app.use(express.json());

let authenticate = function (req, res, next) {
    if (req.headers.authorization) {
        try {
            let result = jwt.verify(req.headers.authorization, secret);
            next();
        } catch (error) {
            res.status(401).json({ message: "Token Invalid" })
        }
    } else {
        res.status(401).json({ message: "Not Authorized" })
    }
}

//user register
app.post("/register", async (req, res) => {
    try {
        let connection = await mongoClient.connect(process.env.url);
        let db = connection.db(process.env.DB_Name);

        //Password encrypt
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(req.body.password, salt);
        req.body.password = hash;
        await db.collection("userDetails").insertOne(req.body)
        await connection.close();
        res.json({ message: "user created!!" })
    } catch (error) {
        console.log(error)
    }
})


//user login
app.post("/login", async (req, res) => {
    try {
        let connection = await mongoClient.connect(process.env.url);
        let db = connection.db(process.env.DB_Name);
        let user = await db.collection("userDetails").findOne({ email: req.body.email })
        if (user) {
            let passwordResult = await bcrypt.compare(req.body.password, user.password)
            if (passwordResult) {
                let token = jwt.sign({ userid: user._id }, secret, { expiresIn: "1h" });
                res.json({ token })
            } else {
                res.status(401).json({ message: "Email Id or Password did not match" })
            }
        } else {
            res.status(401).json({ message: "Email Id or Password did not match" })
        }
    } catch (error) {
        console.log(error)
    }
})

//userdashboard
app.get("/userdashboard", authenticate, function (req, res) {
    res.json({ authorization: "successful" })
})

//get all tasks
app.get("/task", async (req, res) => {
    try {
        let connection = await mongoClient.connect(process.env.url)

        let db = connection.db(process.env.DB_Name)
        let tasks = await db.collection("tasks").find({}).toArray()
        await connection.close();
        res.json(tasks)
    } catch (error) {
        console.log(error)
    }

})

//get single task
app.get("/task/:id", async function (req, res) {

    try {
        let connection = await mongoClient.connect(process.env.url);
        let db = connection.db(process.env.DB_Name);
        let objId = mongodb.ObjectId(req.params.id)
        let task = await db.collection("tasks").findOne({ _id: objId })
        await connection.close()
        if (task) {
            res.json(task)
        } else {
            res.status(401).json({ message: "task Not Found" })
        }
    } catch (error) {
        res.status(500).json({ message: "Something Went Wrong" })
    }
})

// create a task
app.post("/create", async (req, res) => {

    try {
        let connection = await mongoClient.connect(process.env.url)
        let db = connection.db(process.env.DB_Name)
        await db.collection("tasks").insertOne(req.body)
        await connection.close();
        res.json({ message: "task added" })
    } catch (error) {
        console.log(error)
    }
})

//update task
app.put("/task/:id", async function (req, res) {
    try {
        let connection = await mongoClient.connect(process.env.url);
        let db = connection.db(process.env.DB_Name);
        let objId = mongodb.ObjectId(req.params.id)
        await db.collection("tasks").updateOne({ _id: objId }, { $set: req.body })
        await connection.close()
        res.json({ message: "task updated" })
    } catch (error) {
        console.log(error)
    }
})


//delete task
app.delete("/task/:id", async function (req, res) {
    try {
        let connection = await mongoClient.connect(process.env.url);
        let db = connection.db(process.env.DB_Name);
        let objId = mongodb.ObjectId(req.params.id)
        await db.collection("tasks").deleteOne({ _id: objId })
        await connection.close();
        res.json({ message: "task Deleted" })
    } catch (error) {
        console.log(error)
    }
});

//submit task Form

//get submitted tasklist
app.get("/getsubmitedtask", async (req, res) => {
    try {
        let connection = await mongoClient.connect(process.env.url)
        let db = connection.db(process.env.DB_Name)
        let users = await db.collection("taskSubmit").find({}).toArray()
        await connection.close();
        res.json(users)
    } catch (error) {
        console.log(error)
    }
})

//get single task by admin
app.get("/getSubmitedtask/:id", async function (req, res) {

    try {
        let connection = await mongoClient.connect(process.env.url);
        let db = connection.db(process.env.DB_Name);
        let objId = mongodb.ObjectId(req.params.id)
        let task = await db.collection("taskSubmit").findOne({ _id: objId })
        await connection.close()
        if (task) {
            res.json(task)
        } else {
            res.status(401).json({ message: "Data Not Found" })
        }
    } catch (error) {
        res.status(500).json({ message: "Something Went Wrong" })
    }
})

//update submitted task by admin
app.put("/getSubmitedtask/:id", async function (req, res) {
    try {
        let connection = await mongoClient.connect(process.env.url);
        let db = connection.db(process.env.DB_Name);
        let objId = mongodb.ObjectId(req.params.id)
        await db.collection("taskSubmit").updateOne({ _id: objId }, { $set: req.body })
        await connection.close()
        res.json({ message: "task updated" })
    } catch (error) {
        console.log(error)
    }
})

// submit task
app.post("/submittask", async (req, res) => {

    try {
        let connection = await mongoClient.connect(process.env.url)
        let db = connection.db(process.env.DB_Name)
        await db.collection("taskSubmit").insertOne(req.body)
        await connection.close();
        res.json({ message: "user added" })
    } catch (error) { 
        console.log(error)
    }
})


app.listen(process.env.PORT, () => {
    console.log("Server is running in", process.env.PORT);
})