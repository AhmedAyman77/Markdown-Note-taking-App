import file from "../models/files.model.js";
import note from "../models/notes.model.js";
import { renderMarkdown } from "../utils/markdown.utils.js";
import { deleteFile } from "./file.controller.js";

async function deleteNote(noteRecord) {
    // get all files related to this note and delete them from storage
    const files = await file.findAll({ where: { note_id: noteRecord.id } });

    for (const fileRecord of files) {
        await deleteFile(fileRecord);
    }

    await noteRecord.destroy();
}

const createNote = async(req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.user.id;

        // render markdown to HTML
        const html = renderMarkdown(content);

        const newNote = await note.create({
            user_id: userId,
            title,
            content,
        });
        res.status(201).json({
            render_content: html,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const removeNote = async(req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.id;

        const noteRecord = await note.findOne({ where: { id, user_id: userId } });
        if (!noteRecord) {
            return res.status(404).json({ message: "Note not found" });
        }

        await deleteNote(noteRecord);

        res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getNotes = async(req, res) => {
    try {
        const userId = req.user.id;
        const notes = await note.findAll({ where: { user_id: userId } });
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getNoteById = async(req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.id;

        const foundNote = await note.findOne({ where: { id, user_id: userId } });
        if (!foundNote) {
            return res.status(404).json({ message: "Note not found" });
        }

        res.status(200).json(foundNote);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateNote = async(req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.id;
        const { title, content } = req.body;

        const noteToUpdate = await note.findOne({ where: { id, user_id: userId } });
        if (!noteToUpdate) {
            return res.status(404).json({ message: "Note not found" });
        }

        noteToUpdate.title = title || noteToUpdate.title;
        noteToUpdate.content = content || noteToUpdate.content;

        // render the updated note
        const html = renderMarkdown(noteToUpdate.content);

        await noteToUpdate.save();
        res.status(200).json({
            noteToUpdate,
            renderedContent: html
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


export { createNote, deleteNote, getNoteById, getNotes, removeNote, updateNote };