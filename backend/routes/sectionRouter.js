const express = require("express");
const Section = require("../models/sectionModel");
const sectionRouter = express.Router();

sectionRouter.post('/', async (req, res) => {
    try {
        const section = await Section.create(req.body);
        res.status(201).json(section);
    } catch (error) {
        res.status(500).json(error);
    }
})

sectionRouter.get('/', async (req, res) => {
    try {
        const sections = await Section.find({});
        res.status(200).json(sections);
    } catch (error) {
        res.status(500).json(error);
    }
})

sectionRouter.delete('/:id', async (req, res) => {
    try {
        const section = await Section.findByIdAndDelete(req.params.id);
        res.status(200).json({ msg:"Deleted" });
    } catch (error) {
        res.status(500).json(error);
    }
})

module.exports = sectionRouter