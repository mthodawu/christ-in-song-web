
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB Connection Error:", err));

// Routes
app.use('/hymns', require('./routes/hymns'));

// Sample Route
app.get("/", (req, res) => {
    res.send("Backend is running...");
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
