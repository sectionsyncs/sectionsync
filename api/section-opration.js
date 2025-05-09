const express = require('express');
const router = express.Router();
const Section = require('../models/section.model');
const project = require('../models/project.model');

router.post('/add', async (req, res) => {
  const { projectID, sectionID } = req.body;

  try {
    const projectData = await project.findById(projectID);
    const sectionData = await Section.findById(sectionID);

    if (!projectData || !sectionData) {
      return res.status(404).json({ message: 'Project or Section not found' });
    }

    const failedAssets = [];

    for (const asset of sectionData.assets) {
      try {
        const response = await fetch(
          `https://${projectData.store_name}.myshopify.com/admin/api/2024-10/themes/${projectData.themeId}/assets.json`,
          {
            method: "PUT",
            headers: {
              "X-Shopify-Access-Token": projectData.accessToken,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              asset: {
                key: asset.key,
                src: asset.path
              }
            }),
          }
        );

        if (!response.ok) {
          const errorResponse = await response.json();
          failedAssets.push({
            key: asset.key,
            error: errorResponse
          });
        }

      } catch (innerErr) {
        failedAssets.push({
          key: asset.key,
          error: innerErr.message
        });
      }
    }

    // Final response
    if (failedAssets.length > 0) {
      return res.status(207).json({
        message: 'Some assets failed to upload',
        failedAssets
      });
    }

    res.status(200).json({
      message: 'All assets uploaded successfully'
    });

  } catch (error) {
    console.error('Error in /add:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
