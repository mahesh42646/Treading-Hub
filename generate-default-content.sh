#!/bin/bash
echo "Generating default content JSON file..."
cd backend && node generateDefaultContent.js
echo "Default content generation completed!"
