import file from '../models/files.model.js';
import { processFileName } from '../utils/upload.js';
import path from 'path';

const uploadFile = async(req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const uploadedFile = req.file;
        const noteId = req.params.noteId;
        const baseDir = process.cwd(); // get project root directory

        // Save file info to DB
        await file.create({
            note_id: noteId,
            original_name: uploadedFile.originalname,
            stored_name: processFileName(uploadedFile.originalname),
            path: uploadedFile.path,
            mime_type: uploadedFile.mimetype,
            size: uploadedFile.size
        })

        console.log(req.file);

        res.status(200).json({
            message: "File uploaded successfully",
            file: {
                filename: uploadedFile.filename,
                path: uploadedFile.path,
                size: uploadedFile.size,
                mimetype: uploadedFile.mimetype
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

export default uploadFile;