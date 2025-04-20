
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
.then(() => console.log("DB Connected"))
.catch(err => console.error("DB Connection Error:", err));

// Routes
app.use('/hymns', require('./routes/hymns'));

// Sample Route
app.get("/", (req, res) => {
    res.send("Backend is running...");
});

// Start the server
app.listen(PORT, () => console.log(`Server running...`));
