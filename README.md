Bloom Forecasting and Visualization System
🌸 Overview
Bloom is a comprehensive system for forecasting and visualizing blooming seasons worldwide. It combines machine learning predictions with interactive 3D web visualizations to help users track and explore nature's blooming cycles. The system consists of a FastAPI backend for data processing and forecasting, and a React-based frontend for immersive user experiences.

🏗️ Architecture
The project is organized into two main components:

Backend (backend/): Python FastAPI service handling data processing, ML forecasting, and API endpoints
Frontend (blossom-watch/): React web application with 3D visualizations and interactive maps
🚀 Quick Start
Prerequisites
Python 3.10+
Node.js 16+
Google Earth Engine account (for NDVI data)
Gemini API key (for chatbot functionality)
Installation
Clone the repository


git clone <repository-url>
cd bloom
Set up the backend


cd backend
pip install -r requirements.txt
# Create .env file with required environment variables
cp .env.example .env
# Edit .env with your API keys
Set up the frontend


cd ../blossom-watch
npm install
Start the services


# Terminal 1: Start backend
cd backend
uvicorn main:app --reload --port 8000

# Terminal 2: Start frontend
cd ../blossom-watch
npm run dev
Access the application

Frontend: http://localhost:5173
Backend API: http://localhost:8000
API Documentation: http://localhost:8000/docs
🔧 Backend Configuration
Environment Variables
Create a backend/.env file with the following variables:


GEE_SERVICE_ACCOUNT=your-gee-service-account@project.iam.gserviceaccount.com
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
BLOOM_MODEL_PATH=bloom_forecast_model.pkl
GEMINI_API_KEY=your-gemini-api-key
Google Earth Engine Setup
Create a Google Cloud Project
Enable Earth Engine API
Create a service account with Earth Engine access
Download the service account key JSON file
Set the GOOGLE_APPLICATION_CREDENTIALS path
📊 API Endpoints
Bloom Map Data

GET /bloom-map?lat={latitude}&lon={longitude}&year={year}
Returns NDVI data, bloom status, and map tiles for a specific location.

Bloom Forecast

GET /bloom-forecast?months={number}
Provides ML-based bloom predictions for upcoming months.

Bloom Chatbot

POST /ask
Content-Type: application/json

{
  "question": "When do cherry blossoms bloom in Japan?"
}
AI-powered chatbot for bloom-related queries.

🎨 Frontend Features
Interactive 3D Hero Section
Animated 3D blossom flowers using React Three Fiber
Custom 3D flower cursor
Smooth scroll animations with Framer Motion
World Map Visualization
Interactive Leaflet map with OpenStreetMap tiles
Click-to-explore blooming locations
Real-time bloom data integration
Animated flower effects on interaction
Seasonal Timeline
Horizontal scrolling timeline
Season-specific bloom information
Parallax floating elements
Responsive design for all devices
Additional Features
Floating chat interface
Email subscription modal
Fully responsive design
Optimized 3D performance
🧠 Machine Learning Components
Bloom Forecasting Model
Framework: Facebook Prophet
Data: Historical NDVI and bloom data
Output: Monthly bloom predictions
Model File: bloom_forecast_model.pkl
NDVI Processing
Source: Google Earth Engine MODIS data
Processing: Custom NDVI estimation algorithms
Integration: Real-time satellite data fetching
Bloom Classification
Species Recognition: ML-based flower species identification
Data Source: bloom_data.csv with global bloom information
Features: Seasonal patterns, geographic distribution
📁 Project Structure

bloom/
├── README.md                    # Main project documentation
├── bloom_forecast_model.pkl     # Trained ML model
├── backend/                     # FastAPI backend
│   ├── main.py                  # Main API application
│   ├── model.py                 # ML model loading and forecasting
│   ├── gee.py                   # Google Earth Engine integration
│   ├── ndvi_utils.py            # NDVI processing utilities
│   ├── bloom_data.csv           # Bloom database
│   ├── requirements.txt         # Python dependencies
│   └── README.md                # Backend documentation
├── blossom-watch/               # React frontend
│   ├── public/                  # Static assets (videos, images)
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── services/            # API integration services
│   │   └── App.jsx              # Main application
│   ├── package.json             # Node dependencies
│   └── README.md                # Frontend documentation
└── .gitignore                   # Git ignore rules

🛠️ Technologies Used
Backend
FastAPI: Modern Python web framework
Google Earth Engine: Satellite data processing
Facebook Prophet: Time series forecasting
Sentence Transformers: Semantic search for chatbot
Pandas: Data manipulation
Uvicorn: ASGI server
Frontend
React 18: UI framework with hooks
Vite: Fast build tool and dev server
Three.js/React Three Fiber: 3D graphics
Framer Motion: Animations and transitions
React Leaflet: Interactive maps
Tailwind CSS: Utility-first styling
🔄 Data Flow
Satellite Data: Google Earth Engine fetches NDVI data
Processing: Backend processes raw satellite data
Forecasting: ML model generates bloom predictions
Visualization: Frontend displays interactive 3D maps and timelines
Interaction: User queries trigger real-time data updates
📈 Performance Optimizations
Lazy Loading: Components and models load on demand
Caching: API responses cached for improved performance
Optimized 3D: Efficient Three.js rendering with LOD
Code Splitting: Vite-based bundle optimization
Responsive Images: Adaptive loading based on device
🤝 Contributing
Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request
📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Google Earth Engine team for satellite data access
Facebook for Prophet forecasting library
Three.js community for 3D graphics tools
React ecosystem for excellent development tools
Made with ❤️ for nature lovers and data enthusiasts everywhere! 🌸
