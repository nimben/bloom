
---

# 🌸 Bloom Forecasting and Visualization System

**Bloom** is a comprehensive platform for forecasting and visualizing global blooming seasons. It combines **machine learning**, **satellite data**, and **interactive 3D web visualization** to help users explore nature’s blooming cycles dynamically.

The system integrates a **FastAPI backend** for forecasting and a **React-based frontend** for immersive visualization.

---

## 🏗️ Architecture

The project is divided into two main components:

* **Backend (`backend/`)** → Handles data processing, ML forecasting, and API endpoints (FastAPI).
* **Frontend (`blossom-watch/`)** → React web application with 3D blossoms, interactive maps, and a dynamic seasonal timeline.

---

## 🚀 Quick Start

### **Prerequisites**

* Python **3.10+**
* Node.js **16+**
* Google Earth Engine account (for NDVI data)
* Buildin AI (for chatbot functionality)

### **Installation**

```bash
# Clone the repository
git clone <repo-url>
cd bloom
```

#### **Set up the backend**

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` with your API keys and configurations.

#### **Set up the frontend**

```bash
cd ../blossom-watch
npm install
```

### **Start the services**

Terminal 1 – **Backend:**

```bash
cd backend
uvicorn main:app --reload --port 8000
```

Terminal 2 – **Frontend:**

```bash
cd ../blossom-watch
npm run dev
```

### **Access the Application**

* **Frontend:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:8000](http://localhost:8000)
* **API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🔧 Backend Configuration

### **Environment Variables**

Create a `backend/.env` file:

```env
GEE_SERVICE_ACCOUNT=your-gee-service-account@project.iam.gserviceaccount.com
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
BLOOM_MODEL_PATH=bloom_forecast_model.pkl
GEMINI_API_KEY=your-gemini-api-key
```

### **Google Earth Engine Setup**

1. Create a Google Cloud Project
2. Enable the **Earth Engine API**
3. Create a **Service Account** with Earth Engine access
4. Download its **key JSON file**
5. Set the `GOOGLE_APPLICATION_CREDENTIALS` path

---

## 📊 API Endpoints

### **Bloom Map Data**

```
GET /bloom-map?lat={latitude}&lon={longitude}&year={year}
```

Returns NDVI data, bloom status, and map tiles for a specific location.

### **Bloom Forecast**

```
GET /bloom-forecast?months={number}
```

Returns ML-based bloom predictions for the upcoming months.

### **Bloom Chatbot**

```
POST /ask
Content-Type: application/json

{
  "question": "When do cherry blossoms bloom in Japan?"
}
```

AI-powered chatbot that answers bloom-related questions.

---

## 🎨 Frontend Features

### **3D & Interactive UI**

* Animated **3D blossom flowers** using React Three Fiber
* **Custom flower cursor** following user movement
* Smooth scroll & section transitions via Framer Motion

### **World Map Visualization**

* **Leaflet**-based map with OpenStreetMap tiles
* **Tap-to-explore** dynamic blooming areas
* Real-time bloom data integration
* Blooming animation overlays

### **Seasonal Timeline**

* Horizontally scrolling timeline
* Insta-story style seasonal bloom videos
* Parallax floating effects
* Fully responsive for all screen sizes

### **Additional**

* Floating chat assistant 💬
* Email subscription modal
* Optimized 3D rendering and performance

---

## 🧠 Machine Learning Components

### **Bloom Forecasting Model**

* **Framework:** Facebook Prophet
* **Data:** Historical NDVI & bloom datasets
* **Output:** Monthly bloom predictions
* **Model File:** `bloom_forecast_model.pkl`

### **NDVI Processing**

* **Source:** Google Earth Engine (MODIS data)
* **Processing:** Custom NDVI estimation scripts
* **Integration:** Real-time satellite fetching

### **Bloom Classification**

* ML-based species recognition
* **Data Source:** `bloom_data.csv`
* **Features:** Seasonal patterns, geographic trends

---

## 📁 Project Structure

```
bloom/
├── README.md
├── bloom_forecast_model.pkl
├── backend/
│   ├── main.py
│   ├── model.py
│   ├── gee.py
│   ├── ndvi_utils.py
│   ├── bloom_data.csv
│   ├── requirements.txt
│   └── README.md
├── blossom-watch/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.jsx
│   ├── package.json
│   └── README.md
└── .gitignore
```

---

## 🛠️ Technologies Used

### **Backend**

* **FastAPI** – Modern Python web framework
* **Google Earth Engine** – Satellite NDVI data
* **Facebook Prophet** – Time series forecasting
* **Sentence Transformers** – Bloom chatbot
* **Pandas**, **Uvicorn**

### **Frontend**

* **React 18** + **Vite**
* **Three.js / React Three Fiber** – 3D blossoms
* **Framer Motion** – Smooth animations
* **React Leaflet** – Interactive world map
* **Tailwind CSS** – Utility-first design

---

## 🔄 Data Flow

1. **Satellite Data:** Earth Engine fetches NDVI data
2. **Processing:** Backend cleans and processes data
3. **Forecasting:** ML model predicts bloom cycles
4. **Visualization:** Frontend renders 3D & map-based visuals
5. **Interaction:** User queries and chats trigger live updates

---

## 📈 Performance Optimizations

* Lazy loading components & models
* Caching of API responses
* Optimized Three.js rendering
* Code splitting via Vite
* Responsive image loading

---

## 🤝 Contributing

```bash
git checkout -b feature/amazing-feature
git commit -m "Add amazing feature"
git push origin feature/amazing-feature
```

Then open a Pull Request ❤️

---

## 📄 License

Licensed under the **MIT License** — see `LICENSE` for details.

---

## 🙏 Acknowledgments

* **NASA & Google Earth Engine** for open satellite data
* **Facebook Prophet** team for forecasting tools
* **Three.js** & **React community** for visualization support
* Made with ❤️ for **nature lovers & data enthusiasts**

---
