import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import note from "../models/notes.model.js";
import user from "../models/users.model.js";
import { deleteNote } from "./note.controller.js";

const userLogin = async(req, res) => {
    const { login, password } = req.body;

    try {
        const userExists = await user.findOne({ where: { username: login } }) || await user.findOne({ where: { email: login } });

        if (!userExists) {
            return res.status(400).json({ message: "user is not exists" });
        }

        const matchPassword = await bcrypt.compare(password, userExists.password_hash);
        if (!matchPassword) {
            return res.status(400).json({ message: "invalid credentials" });
        }

        const token = jwt.sign({ id: userExists.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });

        res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

        res.status(200).json({
            status: "success",
            message: "login successful",
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

const userRegister = async(req, res) => {
    const { username, email, password } = req.body;

    try {
        const userExists = await user.findOne({ where: { email } }) || await user.findOne({ where: { username } });

        if (userExists) {
            return res.status(400).json({ message: "user already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await user.create({
            username,
            email,
            password_hash: hashedPassword
        })
        res.status(201).json({
            status: "success",
            message: "user registered successfully",
            data: { id: newUser.id, email: newUser.email }
        });
    } catch (error) {
        res.status(500).json({ message: error });
    }
}

const deleteUser = async(req, res) => {
    try {
        const userId = req.params.id;

        const userRecord = await user.findOne({ where: { id: userId } });
        if (!userRecord) {
            return res.status(404).json({ message: "User not found" });
        }

        const relatedNotes = await note.findAll({ where: { user_id: userId } });

        for (const noteRecord of relatedNotes) {
            await deleteNote(noteRecord);
        }

        await userRecord.destroy();

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export { deleteUser, userLogin, userRegister };
