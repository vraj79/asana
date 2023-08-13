const express = require("express");
const Task = require("../models/taskModel");
const taskRouter = express.Router();

taskRouter.post('/', async (req, res) => {
    try {
        const task = await Task.create(req.body);
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json(error);
    }
})

taskRouter.get('/', async (req, res) => {
    try {
        const tasks = await Task.find({});
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json(error);
    }
})

taskRouter.delete('/:id', async (req, res) => {
    try {
        const tasks = await Task.findByIdAndDelete(req.params.id);
        res.status(200).json({msg:"Deleted Successfully"});
    } catch (error) {
        res.status(500).json(error);
    }
})

taskRouter.patch("/:id", async (req, res) => {
    try {
        let task =await Task.findByIdAndUpdate(req.params.id, req.body);
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json(error);
    }
})

module.exports = taskRouter