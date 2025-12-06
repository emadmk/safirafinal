import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/lib/auth';
import { IncomingForm, File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new IncomingForm({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(500).json({ error: 'Failed to upload file' });
      }

      const uploadedFiles = files.file;
      if (!uploadedFiles) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const file = Array.isArray(uploadedFiles) ? uploadedFiles[0] : uploadedFiles;
      const oldPath = file.filepath;
      const ext = path.extname(file.originalFilename || '.jpg');
      const newFilename = `${uuidv4()}${ext}`;
      const newPath = path.join(uploadDir, newFilename);

      fs.renameSync(oldPath, newPath);

      const fileUrl = `/uploads/${newFilename}`;

      res.json({
        success: true,
        url: fileUrl,
        filename: newFilename,
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
}

export default requireAdmin(handler);
