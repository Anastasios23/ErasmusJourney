#!/bin/bash

echo "Starting Erasmus Journey Backend Server..."
echo "Port: 5000"
echo "Press Ctrl+C to stop"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the server
node index.js
