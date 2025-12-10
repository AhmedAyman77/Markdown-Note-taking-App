import { Router } from "express";
import { uploadFile, removeFile } from "../controllers/file.controller.js";
import upload from "../utils/upload.js";

const fileRouter = Router();

fileRouter.post("/:noteId", upload.single("file"), uploadFile);
fileRouter.delete("/:fileId", removeFile);

export default fileRouter;