-- Add new fields to erasmus_experiences for submission workflow
ALTER TABLE erasmus_experiences ADD COLUMN IF NOT EXISTS semester VARCHAR(20);
ALTER TABLE erasmus_experiences ADD COLUMN IF NOT EXISTS host_city VARCHAR(255);
ALTER TABLE erasmus_experiences ADD COLUMN IF NOT EXISTS host_country VARCHAR(255);
ALTER TABLE erasmus_experiences ADD COLUMN IF NOT EXISTS host_university_id VARCHAR(255);
ALTER TABLE erasmus_experiences ADD COLUMN IF NOT EXISTS home_university_id VARCHAR(255);
ALTER TABLE erasmus_experiences ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;
ALTER TABLE erasmus_experiences ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(255);
ALTER TABLE erasmus_experiences ADD COLUMN IF NOT EXISTS review_feedback TEXT;
ALTER TABLE erasmus_experiences ADD COLUMN IF NOT EXISTS revision_count INT DEFAULT 0;

-- Update status to use enum-like values
-- DRAFT | SUBMITTED | APPROVED | REJECTED | REVISION_NEEDED
COMMENT ON COLUMN erasmus_experiences.status IS 'DRAFT | SUBMITTED | APPROVED | REJECTED | REVISION_NEEDED';

-- Create review_actions table
CREATE TABLE IF NOT EXISTS review_actions (
  id VARCHAR(255) PRIMARY KEY,
  experience_id VARCHAR(255) NOT NULL,
  admin_id VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL, -- APPROVED | REJECTED | REVISION_REQUESTED
  feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (experience_id) REFERENCES erasmus_experiences(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_review_actions_experience ON review_actions(experience_id);
CREATE INDEX IF NOT EXISTS idx_review_actions_admin ON review_actions(admin_id);

-- Create city_statistics table for aggregated data
CREATE TABLE IF NOT EXISTS city_statistics (
  id VARCHAR(255) PRIMARY KEY,
  city VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  semester VARCHAR(20) NOT NULL, -- "2024-FALL" or "ALL"
  
  -- Accommodation statistics (in EUR cents)
  avg_monthly_rent_cents INT,
  median_rent_cents INT,
  min_rent_cents INT,
  max_rent_cents INT,
  rent_sample_size INT DEFAULT 0,
  
  -- Living expenses statistics (in EUR cents)
  avg_groceries_cents INT,
  avg_transport_cents INT,
  avg_eating_out_cents INT,
  avg_social_life_cents INT,
  avg_total_expenses_cents INT,
  expense_sample_size INT DEFAULT 0,
  
  -- Metadata
  last_calculated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(city, country, semester)
);

CREATE INDEX IF NOT EXISTS idx_city_stats_location ON city_statistics(city, country);
CREATE INDEX IF NOT EXISTS idx_city_stats_semester ON city_statistics(semester);

-- Add unique constraint for one submission per user per semester
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_semester_unique 
  ON erasmus_experiences(user_id, semester) 
  WHERE semester IS NOT NULL AND status != 'DRAFT';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_experiences_status_city ON erasmus_experiences(status, host_city, host_country);
CREATE INDEX IF NOT EXISTS idx_experiences_semester ON erasmus_experiences(semester);
CREATE INDEX IF NOT EXISTS idx_experiences_universities ON erasmus_experiences(host_university_id, home_university_id);

COMMENT ON TABLE review_actions IS 'Audit log for admin review actions on submissions';
COMMENT ON TABLE city_statistics IS 'Pre-calculated statistics for city pages, updated after each approval';
