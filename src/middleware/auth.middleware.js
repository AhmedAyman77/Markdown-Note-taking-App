import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    // get token from cookies
    const authToken = req.cookies.token;
    console.log("Auth Header:", authToken);
    if (!authToken) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authToken;

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
}

export default authMiddleware;