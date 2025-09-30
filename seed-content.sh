#!/bin/bash

echo "Seeding content management data..."

# Navigate to backend directory
cd backend

# Run the seed script
node seedContentData.js

echo "Content seeding completed!"
