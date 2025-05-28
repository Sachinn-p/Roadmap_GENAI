# Roadmap Project

A full-stack application for generating and visualizing roadmaps from PDF curriculum and objectives.

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

## Getting Started

### Backend
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies (if any, e.g., Flask, PyPDF2):
   ```bash
   pip install -r requirements.txt
   ```
3. Run the backend server:
   ```bash
   python app.py
   ```

### Frontend
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage
- Upload curriculum and objective PDFs via the frontend.
- The backend processes the files and generates a roadmap.
- The roadmap is visualized in the frontend.

## License
This project is for educational purposes.
