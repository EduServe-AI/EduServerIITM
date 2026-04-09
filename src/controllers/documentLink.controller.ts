import { Request, Response } from "express";
import Course from "../models/course.model";
import {
    bulkUpsertDocumentLinks,
    deleteDocumentLink,
    listDocumentLinks,
    upsertDocumentLink,
} from "../services/documentLink.service";
import Responder from "../utils/responder";

/**
 * POST /document-links
 * Body: { courseId, sourceFilename, documentUrl }
 */
export const createDocumentLinkController = async (
  req: Request,
  res: Response
) => {
  try {
    const { courseId, sourceFilename, documentUrl } = req.body;

    if (!courseId || !sourceFilename || !documentUrl) {
      return Responder(res, {
        error: "courseId, sourceFilename, and documentUrl are required",
        httpCode: 400,
      });
    }

    // Verify course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return Responder(res, { error: "Course not found", httpCode: 404 });
    }

    const link = await upsertDocumentLink(courseId, sourceFilename, documentUrl);

    return Responder(res, {
      message: "Document link saved successfully",
      httpCode: 201,
      data: link,
    });
  } catch (error) {
    console.error("Error creating document link:", error);
    return Responder(res, {
      error: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred on the server.",
      httpCode: 500,
    });
  }
};

/**
 * POST /document-links/bulk
 * Body: { courseId, links: [{ sourceFilename, documentUrl }] }
 */
export const bulkCreateDocumentLinksController = async (
  req: Request,
  res: Response
) => {
  try {
    const { courseId, links } = req.body;

    if (!courseId || !links || !Array.isArray(links) || links.length === 0) {
      return Responder(res, {
        error: "courseId and a non-empty links array are required",
        httpCode: 400,
      });
    }

    // Validate each link entry
    for (const link of links) {
      if (!link.sourceFilename || !link.documentUrl) {
        return Responder(res, {
          error:
            "Each link must have sourceFilename and documentUrl",
          httpCode: 400,
        });
      }
    }

    // Verify course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return Responder(res, { error: "Course not found", httpCode: 404 });
    }

    const result = await bulkUpsertDocumentLinks(courseId, links);

    return Responder(res, {
      message: `${result.length} document link(s) saved successfully`,
      httpCode: 201,
      data: result,
    });
  } catch (error) {
    console.error("Error bulk creating document links:", error);
    return Responder(res, {
      error: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred on the server.",
      httpCode: 500,
    });
  }
};

/**
 * GET /document-links/:courseId
 */
export const listDocumentLinksController = async (
  req: Request,
  res: Response
) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return Responder(res, {
        error: "courseId is required",
        httpCode: 400,
      });
    }

    const links = await listDocumentLinks(courseId);

    return Responder(res, {
      message: "Document links retrieved successfully",
      httpCode: 200,
      data: { links },
    });
  } catch (error) {
    console.error("Error listing document links:", error);
    return Responder(res, {
      error: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred on the server.",
      httpCode: 500,
    });
  }
};

/**
 * DELETE /document-links
 * Body: { courseId, sourceFilename }
 */
export const deleteDocumentLinkController = async (
  req: Request,
  res: Response
) => {
  try {
    const { courseId, sourceFilename } = req.body;

    if (!courseId || !sourceFilename) {
      return Responder(res, {
        error: "courseId and sourceFilename are required",
        httpCode: 400,
      });
    }

    const deleted = await deleteDocumentLink(courseId, sourceFilename);

    if (deleted === 0) {
      return Responder(res, {
        error: "Document link not found",
        httpCode: 404,
      });
    }

    return Responder(res, {
      message: "Document link deleted successfully",
      httpCode: 200,
    });
  } catch (error) {
    console.error("Error deleting document link:", error);
    return Responder(res, {
      error: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred on the server.",
      httpCode: 500,
    });
  }
};
