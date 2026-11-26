# Swiggy Clone - MERN Stack

A full-stack Swiggy Clone application built using the MERN stack (MongoDB, Express.js, React, Node.js) with Vite.

## Features

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Redux Toolkit / React Context
- **Backend**: Node.js, Express.js, MongoDB with Mongoose
- **Authentication**: JWT-based user authentication
- **Food Delivery Features**: Restaurant listings, menu browsing, cart management, search & filters, checkout flow

## Project Structure

```
├── backend/          # Express API server and MongoDB models
├── frontend/         # React + Vite frontend client
└── package.json      # Concurrently script to run both servers
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB running locally or MongoDB Atlas connection string

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Swiggy-clone-main
   ```

2. Install all dependencies:
   ```bash
   npm run install-all
   npm install
   ```

3. Setup Backend Environment Variables:
   Create a `.env` file in the `backend/` directory (see `backend/.env.example`):
   ```env
   PORT=5001
   MONGO_URI=mongodb://127.0.0.1:27017/swiggy_clone
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

4. Seed Sample Data (Optional):
   ```bash
   npm run seed
   ```

5. Run Frontend and Backend concurrently:
   ```bash
   npm run dev
   ```
   - Frontend runs at: `http://localhost:5173`
   - Backend runs at: `http://localhost:5001`
