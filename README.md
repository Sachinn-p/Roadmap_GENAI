# Roadmap GENAI

A full-stack application for generating and visualizing roadmaps from PDF curriculum and objectives using AI.

## 🔐 Security Notice

**IMPORTANT**: This project uses API keys for Google Gemini and YouTube APIs. 
- ✅ All credentials have been removed from source code
- ✅ Use environment variables for all API keys
- ✅ See [SECURITY.md](SECURITY.md) for detailed security information
- ⚠️ Never commit `.env` files to version control

## Project Structure

```
roadmap/
├── backend/
│   ├── app.py
│   ├── db.py
│   ├── generate_Content.py
│   ├── pdfExtraction.py
│   ├── test.py
│   ├── templates/
│   │   ├── index.html
│   │   └── roadmap.html
│   ├── testfiles/
│   │   ├── curriculum.pdf
│   │   └── objective.pdf
│   └── uploads/
│       ├── curriculum.pdf
│       └── objective.pdf
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   │   └── vite.svg
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── components/
│       │   ├── Content.jsx
│       │   ├── CustomNode.jsx
│       │   ├── Form.jsx
│       │   ├── Header.jsx
│       │   ├── Home.jsx
│       │   ├── Roadmap.jsx
│       │   ├── Test.jsx
│       │   └── newRoadmap.jsx
│       └── assets/
│           ├── Images1.jpg
│           ├── Logo.png
│           ├── Logo2.png
│           └── react.svg
└── uploads/
    ├── curriculum.pdf
    └── objective.pdf
```

## Backend
- **Language:** Python
- **Main entry:** `backend/app.py`
- **Functionality:**
  - Extracts content from PDF files
  - Generates roadmap content
  - Serves HTML templates

## Frontend
- **Framework:** React (Vite)
- **Main entry:** `frontend/src/App.jsx`
- **Functionality:**
  - User interface for uploading PDFs
  - Visualizes generated roadmaps

## 🚀 Quick Start

### Prerequisites
- Docker (recommended) OR
- Python 3.11+ and Node.js 18+
- Google Gemini API Key
- YouTube Data API v3 Key

### Setup Environment Variables

1. **Copy environment templates:**
   ```bash
   cp .env.template .env
   cp backend/.env.template backend/.env
   cp frontend/.env.template frontend/.env
   ```

2. **Add your API keys** to each `.env` file:
   - Get Gemini API Key: https://makersuite.google.com/app/apikey
   - Get YouTube API Key: https://console.cloud.google.com/apis/credentials

3. **Edit the .env files** with your actual API keys:
   ```bash
   nano .env
   nano backend/.env
   nano frontend/.env
   ```

### Option 1: Docker (Recommended)

**Run with Docker:**
```bash
# Build the image
docker build -t roadmap-base .

# Run the container
docker run -d -p 5000:5000 --env-file .env --name roadmap-app roadmap-base

# Or use the build script
chmod +x build-docker.sh
./build-docker.sh
```

**Access the application:**
- Frontend: http://localhost:5000
- Backend API: http://localhost:5000/api/*

### Option 2: Local Development

**Backend Setup:**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

**Frontend Setup (in another terminal):**
```bash
cd frontend
npm install
npm run dev
```

**Or use the unified local script:**
```bash
chmod +x run-local.sh
./run-local.sh
```

## Usage
- Upload curriculum and objective PDFs via the frontend.
- The backend processes the files and generates a roadmap.
- The roadmap is visualized in the frontend.

## License
This project is for educational purposes.
