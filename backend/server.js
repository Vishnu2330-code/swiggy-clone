import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import Restaurant from "./models/Restaurant.js";
import User from "./models/User.js";
import { seedDatabase } from "./seeder.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Swiggy Clone MERN Backend is running smoothly 🚀",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database has no restaurants
    const restaurantCount = await Restaurant.countDocuments();
    if (restaurantCount === 0) {
      console.log("No restaurants found in database. Auto-seeding initial data...");
      await seedDatabase();
    }

    // Ensure at least one admin account exists for /admin/login
    const adminExists = await User.findOne({ role: "admin" });
    if (!adminExists) {
      await User.create({
        name: "Admin Manager",
        email: "admin@swiggy.com",
        password: "adminpassword123",
        phone: "+91 99887 76655",
        address: {
          street: "Admin Block, KK Nagar",
          city: "Madurai",
          pincode: "625020",
        },
        role: "admin",
      });
      console.log("Default admin account created (admin@swiggy.com)");
    }

    app.listen(PORT, () => {
      console.log(`🚀 Swiggy Backend Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
  }
};

startServer();
