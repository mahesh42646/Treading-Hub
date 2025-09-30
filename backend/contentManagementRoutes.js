const express = require('express');
const router = express.Router();
const ContentManagement = require('./models/ContentManagement');
const authMiddleware = require('./authMiddleware');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');

// Configure multer for generic content uploads
const storage = require('multer').diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// Get content by page
router.get('/:page', async (req, res) => {
  try {
    const { page } = req.params;
    const content = await ContentManagement.findOne({ page });
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    res.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update content (Admin only)
router.put('/:page', authMiddleware, async (req, res) => {
  try {
    const { page } = req.params;
    const updateData = req.body;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const content = await ContentManagement.findOneAndUpdate(
      { page },
      { $set: updateData },
      { new: true, upsert: true }
    );
    
    res.json({ message: 'Content updated successfully', content });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update specific section (Admin only)
router.put('/:page/:section', authMiddleware, async (req, res) => {
  try {
    const { page, section } = req.params;
    const updateData = req.body;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const updateQuery = {};
    updateQuery[section] = updateData;
    
    const content = await ContentManagement.findOneAndUpdate(
      { page },
      { $set: updateQuery },
      { new: true, upsert: true }
    );
    
    res.json({ message: 'Section updated successfully', content });
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add item to array section (Admin only)
router.post('/:page/:section/:arrayField', authMiddleware, async (req, res) => {
  try {
    const { page, section, arrayField } = req.params;
    const itemData = req.body;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const updateQuery = {};
    updateQuery[`${section}.${arrayField}`] = itemData;
    
    const content = await ContentManagement.findOneAndUpdate(
      { page },
      { $push: updateQuery },
      { new: true, upsert: true }
    );
    
    res.json({ message: 'Item added successfully', content });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update item in array section (Admin only)
router.put('/:page/:section/:arrayField/:itemId', authMiddleware, async (req, res) => {
  try {
    const { page, section, arrayField, itemId } = req.params;
    const updateData = req.body;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const content = await ContentManagement.findOne({ page });
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Find and update the specific item
    const arrayPath = `${section}.${arrayField}`;
    const array = content[section][arrayField];
    const itemIndex = array.findIndex(item => item._id.toString() === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    array[itemIndex] = { ...array[itemIndex].toObject(), ...updateData };
    await content.save();
    
    res.json({ message: 'Item updated successfully', content });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete item from array section (Admin only)
router.delete('/:page/:section/:arrayField/:itemId', authMiddleware, async (req, res) => {
  try {
    const { page, section, arrayField, itemId } = req.params;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const updateQuery = {};
    updateQuery[`${section}.${arrayField}`] = { _id: itemId };
    
    const content = await ContentManagement.findOneAndUpdate(
      { page },
      { $pull: updateQuery },
      { new: true }
    );
    
    res.json({ message: 'Item deleted successfully', content });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Save current content as default (Admin only)
router.post('/save-defaults', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    
    // Create default content structure
    const defaultContent = {
      home: content.home || {},
      about: content.about || {},
      contact: content.contact || {},
      lastUpdated: new Date().toISOString()
    };
    
    // Save to JSON file in public directory
    const publicDir = path.join(__dirname, '..', '..', 'public');
    const defaultFilePath = path.join(publicDir, 'default-content.json');
    
    await fs.writeFile(defaultFilePath, JSON.stringify(defaultContent, null, 2));
    
    res.json({ 
      success: true, 
      message: 'Content saved as default successfully',
      content: defaultContent
    });
  } catch (error) {
    console.error('Error saving defaults:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save defaults',
      error: error.message 
    });
  }
});

// Reset content to default (Admin only)
router.post('/reset-defaults', authMiddleware, async (req, res) => {
  try {
    const publicDir = path.join(__dirname, '..', '..', 'public');
    const defaultFilePath = path.join(publicDir, 'default-content.json');
    
    // Check if default file exists
    try {
      await fs.access(defaultFilePath);
    } catch (error) {
      return res.status(404).json({ 
        success: false, 
        message: 'No default content file found. Please save current content as default first.' 
      });
    }
    
    // Read default content
    const defaultContentData = await fs.readFile(defaultFilePath, 'utf8');
    const defaultContent = JSON.parse(defaultContentData);
    
    // Update all pages in database with default content
    const pages = ['home', 'about', 'contact'];
    const updatedContent = {};
    
    for (const page of pages) {
      if (defaultContent[page]) {
        const existingContent = await ContentManagement.findOne({ page });
        
        if (existingContent) {
          // Update existing content
          existingContent[page] = defaultContent[page];
          await existingContent.save();
          updatedContent[page] = existingContent[page];
        } else {
          // Create new content
          const newContent = new ContentManagement({
            page,
            [page]: defaultContent[page]
          });
          await newContent.save();
          updatedContent[page] = newContent[page];
        }
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Content reset to default successfully',
      content: updatedContent
    });
  } catch (error) {
    console.error('Error resetting defaults:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset to defaults',
      error: error.message 
    });
  }
});

module.exports = router;
