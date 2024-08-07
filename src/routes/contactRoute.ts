import express from "express";
import { handleIdentifyContact } from "../controllers/contact";
import validateRequest from "../middlewares/validateRequest";

const router = express.Router();

router.post("/", validateRequest, handleIdentifyContact);

export default router;
