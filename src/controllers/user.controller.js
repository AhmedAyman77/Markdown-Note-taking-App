import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import user from "../models/users.model.js";

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

        res.status(200).json({
            status: "success",
            token,
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

export { userLogin, userRegister };