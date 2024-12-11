CREATE POLICY "Business users can update their own job listings"
  ON job_listings FOR UPDATE
  USING (auth.uid() = business_id);

CREATE POLICY "Business users can delete their own job listings"
  ON job_listings FOR DELETE
  USING (auth.uid() = business_id);