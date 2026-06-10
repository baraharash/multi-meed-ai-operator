import express from "express";
import axios from "axios";
import OpenAI from "openai";

const app = express();
app.use(express.json());

const GHL_API_KEY = process.env.GHL_API_KEY;
const LOCATION_ID = process.env.LOCATION_ID;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

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

app.get("/health", (req, res) => {
  res.json({
    status: "online",
    service: "MultiMeed AI Operator"
  });
});

app.get("/test-ghl", async (req, res) => {
  try {
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

async function createContact(args) {
  const response = await ghl.post("/contacts/", {
    locationId: LOCATION_ID,
    firstName: args.firstName,
    lastName: args.lastName || "",
    email: args.email || "",
    phone: args.phone || ""
  });

  return response.data;
}

app.post("/ai-command", async (req, res) => {
  try {
    const userCommand = req.body.command;

    if (!userCommand) {
      return res.status(400).json({
        success: false,
        error: "Missing command"
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are MultiMeed AI Operator. Convert user requests into safe GoHighLevel actions. Only call available functions. Do not invent missing details. If required information is missing, respond with a clarification question."
        },
        {
          role: "user",
          content: userCommand
        }
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "create_contact",
            description: "Create a contact inside GoHighLevel",
            parameters: {
              type: "object",
              properties: {
                firstName: { type: "string" },
                lastName: { type: "string" },
                email: { type: "string" },
                phone: { type: "string" }
              },
              required: ["firstName"]
            }
          }
        }
      ],
      tool_choice: "auto"
    });

    const message = completion.choices[0].message;

    if (!message.tool_calls || message.tool_calls.length === 0) {
      return res.json({
        success: false,
        message: message.content || "No action selected"
      });
    }

    const toolCall = message.tool_calls[0];
    const functionName = toolCall.function.name;
    const args = JSON.parse(toolCall.function.arguments);

    let result;

    if (functionName === "create_contact") {
      result = await createContact(args);
    } else {
      return res.status(400).json({
        success: false,
        error: "Unsupported function"
      });
    }

    res.json({
      success: true,
      action: functionName,
      arguments: args,
      result
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
