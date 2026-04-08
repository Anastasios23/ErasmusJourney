-- AlterTable
ALTER TABLE "public"."erasmus_experiences" ADD COLUMN     "publicWordingOverrides" JSONB;

CREATE OR REPLACE FUNCTION "public".try_parse_jsonb(input TEXT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
BEGIN
  IF input IS NULL OR BTRIM(input) = '' THEN
    RETURN NULL;
  END IF;

  RETURN input::jsonb;
EXCEPTION
  WHEN others THEN
    RETURN NULL;
END;
$$;

WITH parsed_admin_notes AS (
  SELECT
    id,
    "public".try_parse_jsonb("adminNotes") AS parsed
  FROM "public"."erasmus_experiences"
)
UPDATE "public"."erasmus_experiences" AS experience
SET
  "publicWordingOverrides" = parsed_admin_notes.parsed -> 'publicWordingEdits',
  "adminNotes" = NULLIF(
    BTRIM(parsed_admin_notes.parsed ->> 'legacyAdminNotes'),
    ''
  )
FROM parsed_admin_notes
WHERE experience.id = parsed_admin_notes.id
  AND jsonb_typeof(parsed_admin_notes.parsed) = 'object'
  AND jsonb_typeof(parsed_admin_notes.parsed -> 'publicWordingEdits') = 'object';

DROP FUNCTION "public".try_parse_jsonb(TEXT);
