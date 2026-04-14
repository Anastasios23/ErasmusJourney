-- Step 1: Break the FK chain from the junction table first
DROP TABLE IF EXISTS "destination_submissions";

-- Step 2: Drop the two tables destination_submissions joined
DROP TABLE IF EXISTS "destinations";
DROP TABLE IF EXISTS "form_submissions";

-- Step 3: Standalone orphans -- no FK dependencies
DROP TABLE IF EXISTS "custom_destinations";
DROP TABLE IF EXISTS "partnership_tracking";

-- Step 4: Stories cluster (story_engagements must go before stories due to FK)
DROP TABLE IF EXISTS "story_engagements";
DROP TABLE IF EXISTS "stories";

-- Step 5: Standalone stat table
DROP TABLE IF EXISTS "city_statistics";
