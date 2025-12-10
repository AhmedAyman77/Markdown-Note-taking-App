import multer from "multer";
import path from "path";

const baseDir = process.cwd();

export const processFileName = (originalName) => {
    return Date.now() + "-" + originalName;
}

// Storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(baseDir, "src", process.env.UPLOAD_DIR));
    },
    filename: (req, file, cb) => {
        const unique = processFileName(file.originalname);
        cb(null, unique);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = JSON.parse(process.env.ALLOWED_FILE_TYPES);

    if (!allowed.includes(file.mimetype)) {
        return cb(new Error("File type not allowed"), false);
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) } // 10 MB
});

export default upload;