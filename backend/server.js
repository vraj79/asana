const express = require("express");
const connectDB = require("./db");
const cors = require('cors');
const taskRouter = require("./routes/taskRoute");
const sectionRouter = require("./routes/sectionRouter");
const app = express();

app.use(express.json());
app.use(cors());

// routes
app.use('/api/task', taskRouter)
app.use('/api/section', sectionRouter)

app.listen(8080, connectDB(), () => {
    console.log("Server started at http://localhost:8080");
})