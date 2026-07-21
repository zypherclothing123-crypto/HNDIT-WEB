const fs = require('fs');
const schema = fs.readFileSync('supabase/schema.sql', 'utf8');
const seed = fs.readFileSync('supabase/seed.sql', 'utf8');

const reset = `
-- 1. DROP THE EXISTING SCHEMA
DROP SCHEMA public CASCADE;

-- 2. RECREATE THE SCHEMA
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres, public;

-- 3. APPLY THE CORRECTED SCHEMA (with TEXT types for Clerk IDs)
${schema}

-- 4. INSERT SAMPLE DATA
${seed}

-- 5. INSERT THE ADMIN USER
INSERT INTO public.profiles (id, email, full_name, role) 
VALUES ('user_3GEmK6P2xPHLHsgYy6UYvCRwHNt', 'adminhndit@gmail.com', 'Admin User', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
`;

fs.writeFileSync('supabase/RESET_DATABASE.sql', reset);
console.log('Created RESET_DATABASE.sql successfully');
