

// const express = require('express');
// const cors = require('cors');
// const multer = require('multer');
// const pdfParse = require('pdf-parse');
// const mongoose = require('mongoose');
// const fs = require('fs');
// const path = require('path');
// const bodyParser = require('body-parser')
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// require("dotenv").config();

// app.use(cors({ origin: 'http://localhost:3000' }));

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);


// const app = express();
// const port = process.env.PORT;

// const upload = multer({ dest: 'uploads/' });

// // Connect to MongoDB
// const uri = process.env.MONGO_URI
// // const uri = 'mongodb://localhost:27017/pdfDB';
// mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log('MongoDB connected'))
//     .catch(err => console.log(err));

// // Define PDF document schema and model
// const pdfSchema = new mongoose.Schema({
//     filename: String,
//     uploadDate: { type: Date, default: Date.now },
//     pdfText: String
// });

// const PdfDocument = mongoose.model('PdfDocument', pdfSchema);

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// // Endpoint for uploading PDF documents
// app.post('/upload-pdf', upload.single('file'), async (req, res) => {
//     const filePath = req.file.path;
//     const fileName = req.file.originalname;
//     const uploadDate = new Date();

//     try {
//         // Extract text from the PDF
//         const dataBuffer = fs.readFileSync(filePath);
//         const data = await pdfParse(dataBuffer);
//         const pdfText = data.text;

//         const pdfDocument = new PdfDocument({ filename: fileName, uploadDate, pdfText });
//         const savedDocument = await pdfDocument.save();

//         res.json({ id: savedDocument._id, filename: fileName });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     } finally {
//         fs.unlink(filePath, (err) => {
//             if (err) console.error('Failed to delete uploaded file:', err);
//         });
//     }
// });

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// // Endpoint for asking questions
// app.post('/ask-question', express.urlencoded({ extended: true }), async (req, res) => {
//     const { pdfId, question } = req.body;
//     // console.log(req.body.pdfID)
//     // console.log('Request Body:', req.body); // Log the request body for debugging
//     // console.log('PDF ID:', pdfId, 'Question:', question); // Log pdfId and question

//     try {
//         const pdfDocument = await PdfDocument.findById(pdfId);

//         const pdfText = pdfDocument.pdfText;

//         const model = genAI.getGenerativeModel({ model: "gemini-pro" });
//         const prompt = `Answer the following question based on the provided text:\n\nText: ${pdfText}\n\nQuestion: ${question}`
//         const result = await model.generateContent(prompt);
//         const response = result.response.text();

//         res.json({ question: question, answer: response });

//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}/`);
// });



const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001; // Default port if not provided in environment

const genAI = new (require('@google/generative-ai').GoogleGenerativeAI)(process.env.GEMINI_KEY);

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Define PDF document schema and model
const pdfSchema = new mongoose.Schema({
    filename: String,
    uploadDate: { type: Date, default: Date.now },
    pdfText: String
});

const PdfDocument = mongoose.model('PdfDocument', pdfSchema);

// Endpoint for uploading PDF documents
app.post('/upload-pdf', upload.single('file'), async (req, res) => {
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const uploadDate = new Date();

    try {
        // Extract text from the PDF
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        const pdfText = data.text;

        const pdfDocument = new PdfDocument({ filename: fileName, uploadDate, pdfText });
        const savedDocument = await pdfDocument.save();

        res.json({ id: savedDocument._id, filename: fileName });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        fs.unlink(filePath, (err) => {
            if (err) console.error('Failed to delete uploaded file:', err);
        });
    }
});

// Endpoint for asking questions
app.post('/ask-question', async (req, res) => {
    const { pdfId, question } = req.body;

    try {
        const pdfDocument = await PdfDocument.findById(pdfId);

        if (!pdfDocument) {
            return res.status(404).json({ error: 'PDF document not found' });
        }

        const pdfText = pdfDocument.pdfText;

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `Answer the following question based on the provided text:\n\nText: ${pdfText}\n\nQuestion: ${question}`;
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        res.json({ question: question, answer: response });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
