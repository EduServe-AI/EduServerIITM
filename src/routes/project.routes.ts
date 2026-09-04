import { Router } from "express";
import { getAllProjects, getMilestoneById, getProjectById } from "../controllers/project.controller";

const router = Router();

router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.get("/:id/milestones/:milestoneId", getMilestoneById);

export default router;
