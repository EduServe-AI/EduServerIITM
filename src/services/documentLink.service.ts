import DocumentLink from "../models/documentLink.model";

/**
 * Get document link URL for a given source filename and courseId.
 * Returns the URL string or null if no link is registered.
 */
export const getDocumentLink = async (
  courseId: string,
  sourceFilename: string
): Promise<string | null> => {
  const link = await DocumentLink.findOne({
    where: { courseId, sourceFilename },
    attributes: ["documentUrl"],
  });

  return link ? link.documentUrl : null;
};

/**
 * Get all document links for a course (batch lookup).
 * Returns a Map of sourceFilename → documentUrl.
 */
export const getDocumentLinksForCourse = async (
  courseId: string
): Promise<Map<string, string>> => {
  const links = await DocumentLink.findAll({
    where: { courseId },
    attributes: ["sourceFilename", "documentUrl"],
  });

  const linkMap = new Map<string, string>();
  links.forEach((link) => {
    linkMap.set(link.sourceFilename, link.documentUrl);
  });

  return linkMap;
};

/**
 * Resolve document URLs for an array of source filenames.
 * Returns an array of { sourceFilename, documentUrl | null }.
 */
export const resolveDocumentLinks = async (
  courseId: string,
  sourceFilenames: string[]
): Promise<{ sourceFilename: string; documentUrl: string | null }[]> => {
  const linkMap = await getDocumentLinksForCourse(courseId);

  return sourceFilenames.map((filename) => ({
    sourceFilename: filename,
    documentUrl: linkMap.get(filename) || null,
  }));
};

/**
 * Upsert (create or update) a document link.
 */
export const upsertDocumentLink = async (
  courseId: string,
  sourceFilename: string,
  documentUrl: string
): Promise<DocumentLink> => {
  const [link] = await DocumentLink.upsert({
    courseId,
    sourceFilename,
    documentUrl,
  });

  return link;
};

/**
 * Bulk upsert document links for a course.
 */
export const bulkUpsertDocumentLinks = async (
  courseId: string,
  links: { sourceFilename: string; documentUrl: string }[]
): Promise<DocumentLink[]> => {
  const results: DocumentLink[] = [];

  for (const { sourceFilename, documentUrl } of links) {
    const link = await upsertDocumentLink(courseId, sourceFilename, documentUrl);
    results.push(link);
  }

  return results;
};

/**
 * Delete a document link.
 */
export const deleteDocumentLink = async (
  courseId: string,
  sourceFilename: string
): Promise<number> => {
  return DocumentLink.destroy({
    where: { courseId, sourceFilename },
  });
};

/**
 * List all document links for a course.
 */
export const listDocumentLinks = async (courseId: string) => {
  return DocumentLink.findAll({
    where: { courseId },
    attributes: ["id", "sourceFilename", "documentUrl", "createdAt"],
    order: [["sourceFilename", "ASC"]],
  });
};
