const mongoose = require('mongoose');
const ContentManagement = require('./models/ContentManagement');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trading-hub';
console.log('Connecting to MongoDB:', MONGODB_URI);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

const generateDefaultContent = async () => {
  try {
    console.log('Generating default content JSON file...');
    
    // Wait for MongoDB connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Fetch all content from database
    const homeContent = await ContentManagement.findOne({ page: 'home' });
    const aboutContent = await ContentManagement.findOne({ page: 'about' });
    const contactContent = await ContentManagement.findOne({ page: 'contact' });
    
    console.log('Home content found:', !!homeContent);
    console.log('About content found:', !!aboutContent);
    console.log('Contact content found:', !!contactContent);
    
    // Create default content structure
    const defaultContent = {
      home: homeContent?.home || {},
      about: aboutContent?.about || {},
      contact: contactContent?.contact || {},
      lastUpdated: new Date().toISOString()
    };
    
    // Save to JSON file in public directory
    const publicDir = path.join(__dirname, '..', 'public');
    const defaultFilePath = path.join(publicDir, 'default-content.json');
    
    await fs.writeFile(defaultFilePath, JSON.stringify(defaultContent, null, 2));
    
    console.log('Default content JSON file generated successfully!');
    console.log('File saved to:', defaultFilePath);
    
  } catch (error) {
    console.error('Error generating default content:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

generateDefaultContent();
