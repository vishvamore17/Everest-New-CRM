import nextConnect from 'next-connect';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads folder if it doesn't exist
const uploadDir = './public/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Set up the API handler
const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ error: `Something went wrong: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  },
});

apiRoute.use(upload.single('image'));  // 'image' is the field name

apiRoute.post((req, res) => {
  res.status(200).json({ message: 'File uploaded successfully!', filePath: `/uploads/${req.file.filename}` });
});

export default apiRoute;

// Disable Next.js default body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};
