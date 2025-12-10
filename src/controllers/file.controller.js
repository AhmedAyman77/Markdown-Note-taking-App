import { exec } from 'child_process';
import file from '../models/files.model.js';
import { processFileName } from '../utils/upload.js';
import note from '../models/notes.model.js';

const uploadFile = async(req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const uploadedFile = req.file;
        const noteId = req.params.noteId;

        // Verify that the note exists and belongs to the user
        const userId = req.user.id;
        const checkNote = await note.findOne({ where: { id: noteId, user_id: userId } });
        if (!checkNote) {
            // remove the uploaded file since the note does not exist
            deletePhysicalFile(uploadedFile.path);
            return res.status(404).json({ message: "Note not found" });
        }

        // Save file info to DB
        await file.create({
            note_id: noteId,
            original_name: uploadedFile.originalname,
            stored_name: processFileName(uploadedFile.originalname),
            path: uploadedFile.path,
            mime_type: uploadedFile.mimetype,
            size: uploadedFile.size
        })

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

const removeFile = async(req, res) => {
    try {
        const fileId = req.params.fileId;
        const userId = req.user.id;

        // Find the file and ensure it belongs to a note owned by the user
        const fileRecord = await file.findOne({
            where: { id: fileId },
            include: {
                model: note,
                where: { user_id: userId }
            }
        });

        if (!fileRecord) {
            return res.status(404).json({ message: "File not found or access denied" });
        }

        await deleteFile(fileRecord);

        res.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

async function deleteFile(fileRecord) {
    const filePath = fileRecord.path;

    // delete the physical file
    deletePhysicalFile(filePath)

    // Delete the file record from the database
    await fileRecord.destroy();
}

function deletePhysicalFile(filePath) {
    // Delete the file from filesystem
    exec(`rm "${filePath}"`, async(err) => {
        if (err) {
            return res.status(500).json({ message: `Error deleting file from server: ${err.message}` });
        }
    });
}

export { deleteFile, removeFile, uploadFile };