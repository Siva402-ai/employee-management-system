import { ObjectId } from "mongodb";

/**
 * Helper function to normalize an ID value for MongoDB queries.
 * Attempts to convert string IDs to ObjectId when possible.
 */
export function normalizeId(id: string | ObjectId | undefined): ObjectId | string | undefined {
  if (!id) return undefined;
  
  // If already an ObjectId, return as is
  if (id instanceof ObjectId) return id;
  
  // Try to convert string to ObjectId
  try {
    return new ObjectId(id);
  } catch {
    // If conversion fails, return original string
    return id;
  }
}

/**
 * Helper function to create a MongoDB query that matches against both
 * string IDs and ObjectIds
 */
export function createIdQuery(id: string | ObjectId) {
  const query: any = { $or: [] };
  
  // Always try to match the original string value against id field
  if (typeof id === 'string') {
    query.$or.push({ id });
  }

  // Try to match as ObjectId if possible
  try {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    query.$or.push({ _id: objectId });
  } catch {
    // If conversion fails, also try matching string against _id field
    // This handles cases where _id might be stored as a string
    if (typeof id === 'string') {
      query.$or.push({ _id: id });
    }
  }

  return query;
}