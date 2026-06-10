import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// 🔑 GoHighLevel API KEY (سيأتي من Render لاحقاً)
const GHL_API_KEY = process.env.GHL_API_KEY;

// اختبار السيرفر
app.get("/", (req, res) => {
  res.send("MultiMeed AI Operator is running 🚀");
});

// إنشاء Pipeline في GoHighLevel
app.post("/create_pipeline", async (req, res) => {
  const { name, stages } = req.body;

  try {
    const response = await axios.post(
      "https://services.leadconnectorhq.com/opportunities/pipelines/",
      {
        name,
        stages
      },
      {
        headers: {
          Authorization: `Bearer ${GHL_API_KEY}`,
          "Content-Type": "application/json",
          Version: "2021-07-28"
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json(err.response?.data || err.message);
  }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
