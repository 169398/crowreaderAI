// Import the necessary libraries
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { BlobServiceClient } = require("@azure/storage-blob");
const msRest = require("@azure/ms-rest-js");
const {
  ComputerVisionClient,
} = require("@azure/cognitiveservices-computervision");

// Create an Express app
const app = express();
const port = 5000;

// Enable CORS for all routes
app.use(cors());

// Azure Blob Storage configuration
const blobServiceClient = BlobServiceClient.fromConnectionString(
  "DefaultEndpointsProtocol=https;AccountName=edubrain;AccountKey=x1EIyAYsdsfl3HrdehAMsTxKABYi199D4uW7wlLMEFFnaE7WFASNTNM1m4KleBi/qBsz7fklmaNx+AStrl2TxQ==;EndpointSuffix=core.windows.net"
);
const containerClient = blobServiceClient.getContainerClient("pdfs");

// Azure Cognitive Services configuration
const computerVisionClient = new ComputerVisionClient(
  new msRest.ApiKeyCredentials({
    inHeader: {
      "Ocp-Apim-Subscription-Key": "2eab152d050f4cfa9e5314114d137807",
    },
  }),
  "https://southafricanorth.api.cognitive.microsoft.com/vision/v3.0/"
);

// Multer setup for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// CORS middleware for the /upload route
app.options("/upload", cors()); // Enable pre-flight requests for the /upload route
app.post("/upload", cors(), upload.single("file"), async (req, res) => {
  try {
    // Your existing upload code
    const file = req.file;
    const blobName = `${Date.now()}-${file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(file.buffer, file.size);

    // Extract text using Azure Cognitive Services
    const { text } = await computerVisionClient.read({
      language: "en",
      raw: true,
      source: blockBlobClient.url,
    });

    // Respond with the extracted text
    res.json({ text });
  } catch (error) {
    console.error("File upload failed:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Serve static files from the React app
const reactAppPath = path.join(__dirname, "path_to_your_react_build_folder");
app.use(express.static(reactAppPath));

// For any other route, serve the React app's HTML file
app.get("*", (req, res) => {
  res.sendFile(path.join(reactAppPath, "index.html"));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
