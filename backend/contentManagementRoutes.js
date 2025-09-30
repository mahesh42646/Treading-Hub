const express = require('express');
const router = express.Router();
const ContentManagement = require('./models/ContentManagement');
const authMiddleware = require('./authMiddleware');

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

module.exports = router;
