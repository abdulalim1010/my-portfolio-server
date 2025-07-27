const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster2.emeucb3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster2`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let contactCollection;

async function run() {
  try {
    await client.connect();

    const db = client.db("portfolioDB");
    contactCollection = db.collection("contacts");

    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ DB error", err);
  }
}

run().catch(console.dir);

// Routes declared OUTSIDE run()
app.get("/", (req, res) => {
  res.send("🚀 Portfolio Server Running");
});

// Pagination example route
// Existing GET route
app.get("/contacts", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;

  try {
    const total = await contactCollection.countDocuments({});
    const contacts = await contactCollection
      .find({})
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    res.send({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      contacts,
    });
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch contacts" });
  }
});

// ✅ NEW POST route
app.post("/contacts", async (req, res) => {
  try {
    const contact = req.body;
    const result = await contactCollection.insertOne(contact);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ error: "Failed to save contact" });
  }
});


// Start server AFTER DB connection attempt (optional wait)
app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});
