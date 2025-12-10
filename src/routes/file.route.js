import { Router } from "express";
import uploadFile from "../controllers/file.controller.js";
import upload from "../utils/upload.js";

const fileRouter = Router();

fileRouter.post("/upload/:noteId", upload.single("file"), uploadFile);

export default fileRouter;