# PDF AI API

This repository provides an API for uploading PDF documents, extracting their text, and using Google Generative AI to answer questions based on the extracted text. The API is built using Express, Multer for handling file uploads, pdf-parse for extracting text from PDFs, and Mongoose for interacting with a MongoDB database.

## Table of Contents
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [Upload PDF](#upload-pdf)
  - [Ask Question](#ask-question)
- [Models](#models)
- [Technologies Used](#technologies-used)
- [License](#license)

## Getting Started

### Prerequisites
- Node.js
- npm
- MongoDB
- Google Generative AI API key

### Installation
1. Clone the repository:
    ```sh
    git clone https://github.com/your-username/pdf-ai-api.git
    cd pdf-ai-api
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory and add the required environment variables (see [Environment Variables](#environment-variables)).

4. Start the server:
    ```sh
    node index.js
    ```

The server will start running at `http://localhost:3001`.

## Environment Variables
Create a `.env` file in the root directory and add the following environment variables:

```
PORT=3001
MONGO_URI=your_mongo_connection_string
GEMINI_KEY=your_google_generative_ai_api_key
```

## API Endpoints

### Upload PDF
**Endpoint:** `POST /upload-pdf`

**Description:** Uploads a PDF document, extracts its text, and saves the text to the MongoDB database.

**Request:**
- **Headers:** `Content-Type: multipart/form-data`
- **Body:** A form-data object with a single file field named `file`.

**Response:**
- **200 OK:** `{ "id": "document_id", "filename": "uploaded_file_name" }`
- **500 Internal Server Error:** `{ "error": "error_message" }`

**Example Request:**
```sh
curl -X POST http://localhost:3001/upload-pdf -F 'file=@/path/to/your/document.pdf'
```

### Ask Question
**Endpoint:** `POST /ask-question`

**Description:** Asks a question based on the text extracted from a previously uploaded PDF document using Google Generative AI.

**Request:**
- **Headers:** `Content-Type: application/json`
- **Body:** A JSON object containing:
  - `pdfId`: The ID of the PDF document in the database.
  - `question`: The question to ask based on the document's text.

**Response:**
- **200 OK:** `{ "question": "your_question", "answer": "generated_answer" }`
- **404 Not Found:** `{ "error": "PDF document not found" }`
- **500 Internal Server Error:** `{ "error": "error_message" }`

**Example Request:**
```sh
curl -X POST http://localhost:3001/ask-question -H 'Content-Type: application/json' -d '{"pdfId": "document_id", "question": "your_question"}'
```

## Models

### PDF Document Model
**Schema:**
```javascript
const pdfSchema = new mongoose.Schema({
    filename: String,
    uploadDate: { type: Date, default: Date.now },
    pdfText: String
});
```

### PdfDocument
A Mongoose model representing a PDF document, with the following fields:
- `filename`: The original name of the uploaded PDF file.
- `uploadDate`: The date when the PDF was uploaded.
- `pdfText`: The text extracted from the PDF.

## Technologies Used
- Express
- Multer
- pdf-parse
- Mongoose
- MongoDB
- Google Generative AI

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
```
