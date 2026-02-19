-- Add foreign key constraint to link jobs.business_id to business_profiles.user_id
ALTER TABLE jobs
ADD CONSTRAINT fk_jobs_business
FOREIGN KEY (business_id)
REFERENCES business_profiles(user_id)
ON DELETE CASCADE;
