import { Router } from "express";
import {
    bulkCreateDocumentLinksController,
    createDocumentLinkController,
    deleteDocumentLinkController,
    listDocumentLinksController,
} from "../controllers/documentLink.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

// Create or update a single document link
router.post("/", authMiddleware, createDocumentLinkController);

// Bulk create/update document links
router.post("/bulk", authMiddleware, bulkCreateDocumentLinksController);

// List all document links for a course
router.get("/:courseId", authMiddleware, listDocumentLinksController);

// Delete a document link
router.delete("/", authMiddleware, deleteDocumentLinkController);

export default router;
