// routes/category.routes.js
const express = require('express');
const router = express.Router();
const Collection = require('../models/category.model');
const Section = require('../models/section.model');

router.post('/', async (req, res) => {
  const { name } = req.body;
  try {
    const category = await Collection.create({ name });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: 'Error creating category', error });
  }
});

router.get('/', async(req, res) => {
  try {
    const categories = await Collection.find();
    res.status(201).json(categories);
  }catch(error){
    res.status(400).json({ message: 'Error getting category', error });
  }
});

router.get('/:category', async (req, res) => {
  const { category } = req.params;

  try {
    const sections = await Section.find({ category });
    res.status(200).json(sections);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sections', error });
  }
});

module.exports = router;    
