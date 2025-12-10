import note from "../models/notes.model.js";

const createNote = async(req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.user.id;

        const newNote = await note.create({
            user_id: userId,
            title,
            content
        });
        res.status(201).json(newNote);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteNote = async(req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.id;

        const noteToDelete = await note.findOne({ where: { id, user_id: userId } });
        if (!noteToDelete) {
            return res.status(404).json({ message: "Note not found" });
        }

        // TODO
        // delete files related to the note if any

        await noteToDelete.destroy();
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

        await noteToUpdate.save();
        res.status(200).json(noteToUpdate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


export { createNote, deleteNote, getNotes, getNoteById, updateNote };