-- Confirm email for both seed users so they can sign in without email verification
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now()
WHERE email IN ('admin@company.com', 'alex.johnson@company.com');