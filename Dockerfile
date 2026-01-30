
# Multi-stage Docker build for Roadmap GENAI application

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files for better cache
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source code
COPY frontend/ ./

# Build the frontend
RUN npm run build

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies (gcc for some Python packages, nginx)
RUN apt-get update \
    && apt-get install -y gcc nginx \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backend/requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ ./

# Copy built frontend files to backend static directory
COPY --from=frontend-builder /app/frontend/dist ./static

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy backend .env file (for local dev only; for production, use --env-file or secrets manager)
# Remove/comment this line for production builds!
COPY backend/.env .env

# Set environment variables (can be overridden at runtime)
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PYTHONPATH=/app

# Expose HTTP port
EXPOSE 80

# Health check (for NGINX)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/healthz || exit 1

# Start both Flask backend and NGINX
CMD ["sh", "-c", "python app.py & nginx -g 'daemon off;'"]
