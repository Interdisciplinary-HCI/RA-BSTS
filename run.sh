#!/bin/bash
# Run this script to start all services, but run at your own risk. 
# 
# Exiting the terminal does not automatically stop the services, 
# so be ready to kill them manually if needed.  For example:
# lsof -i :5001 //  Get the process ID (PID) using the port number
# kill <PID> // Kill the process using the PID


PROJECT_DIR=$(pwd)

# Run Chroma
docker run -p 8000:8000 -v $PROJECT_DIR/backend/chroma_data:/data ghcr.io/chroma-core/chroma:latest &

# Run Ollama
ollama serve &

# Run Backend
cd $PROJECT_DIR/backend
node server.js &

# Run Frontend
cd ..
npm run dev &