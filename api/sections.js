// routes/section.routes.js
const express = require('express');
const router = express.Router();
const Section = require('../models/section.model');

router.get('/', async(req, res) => {
  try {
    const sections = await Section.find();
    res.status(201).json(sections);
  }catch(error){
    res.status(400).json({ message: 'Error getting Sections', error });
  }
});

router.post('/', async (req, res) => {
  const { category, title, image, video, assets } = req.body;

  try {
    const section = await Section.create({
      category,
      title,
      image,
      video,
      assets
    });
    res.status(201).json(section);
  } catch (error) {
    res.status(400).json({ message: 'Error creating section', error });
  }
});

module.exports = router;
