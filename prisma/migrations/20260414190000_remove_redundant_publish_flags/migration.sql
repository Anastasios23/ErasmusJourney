-- Remove redundant publish booleans from the canonical submission model.
ALTER TABLE "erasmus_experiences"
DROP COLUMN "adminApproved",
DROP COLUMN "isPublic";
