import express from "express";
import {
  addDoctor,
  getDoctors,
  getDoctorById,
} from "../controllers/doctor.controller.js";

const doctorRouter = express.Router();


doctorRouter.post("/add", addDoctor);

doctorRouter.get("/", getDoctors);

doctorRouter.get("/:id", getDoctorById);

export default doctorRouter;
