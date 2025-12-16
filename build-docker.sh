#!/bin/bash

# Script to build and run the Roadmap GENAI Docker container

set -e

echo "🐳 Building Roadmap GENAI Docker image..."

# Build the Docker image
docker build -t roadmap-genai:latest .

echo "✅ Docker image built successfully!"

echo "🚀 Available commands:"
echo "  1. Run with docker run:"
echo "     docker run -p 5000:5000 --env-file .env roadmap-genai:latest"
echo ""
echo "  2. Run with docker-compose:"
echo "     docker-compose up -d"
echo ""
echo "  3. Run interactively:"
echo "     docker run -it -p 5000:5000 --env-file .env roadmap-genai:latest"

echo ""
echo "📝 Don't forget to:"
echo "  - Copy .env.template to .env and add your GEMINI_API_KEY"
echo "  - Ensure your .env file contains the required environment variables"

# Check if .env file exists
if [ ! -f .env ]; then
    echo ""
    echo "⚠️  WARNING: .env file not found!"
    echo "   Please copy .env.template to .env and configure your environment variables"
    echo "   cp .env.template .env"
fi
