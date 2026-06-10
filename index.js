import express from "express";
import axios from "axios";

const app = express();

app.use(express.json());

const GHL_API_KEY = process.env.GHL_API_KEY;
const LOCATION_ID = process.env.LOCATION_ID;

const ghl = axios.create({
  baseURL: "https://services.leadconnectorhq.com",
  headers: {
    Authorization: `Bearer ${GHL_API_KEY}`,
    Version: "2021-07-28",
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

app.get("/", (req, res) => {
  res.send("MultiMeed AI Operator is running 🚀");
});

/**
 * Test GoHighLevel connection
 */
app.get("/test-ghl", async (req, res) => {
  try {
    if (!LOCATION_ID) {
      return res.status(400).json({
        success: false,
        error: "LOCATION_ID environment variable is missing"
      });
    }

    const response = await ghl.get(`/locations/${LOCATION_ID}`);

    res.json({
      success: true,
      data: response.data
    });

  } catch (err) {
    res.status(err.response?.status || 500).json({
      success: false,
      error: err.response?.data || err.message
    });
  }
});

/**
 * Create Contact
 */
app.post("/create-contact", async (req, res) => {
  try {
    const response = await ghl.post("/contacts/", {
      locationId: LOCATION_ID,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone
    });

    res.json({
      success: true,
      data: response.data
    });

  } catch (err) {
    res.status(err.response?.status || 500).json({
      success: false,
      error: err.response?.data || err.message
    });
  }
});

/**
 * Health Check
 */
app.get("/health", (req, res) => {
  res.json({
    status: "online",
    service: "MultiMeed AI Operator"
  });
});

/**
 * Create Test Contact
 */
app.get("/create-test-contact", async (req, res) => {
  try {
    const testEmail = `test-${Date.now()}@multimeed.com`;

    const response = await ghl.post("/contacts/", {
      locationId: LOCATION_ID,
      firstName: "Test",
      lastName: "AI Operator",
      email: testEmail,
      phone: "+15555550123"
    });

    res.json({
      success: true,
      message: "Test contact created successfully",
      data: response.data
    });

  } catch (err) {
    res.status(err.response?.status || 500).json({
      success: false,
      error: err.response?.data || err.message
    });
  }
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`MultiMeed AI Operator running on port ${PORT}`);
});
