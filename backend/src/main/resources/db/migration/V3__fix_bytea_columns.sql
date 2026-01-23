-- Migration to fix BYTEA columns safely
-- This checks if a column is BYTEA before attempting conversion to TEXT/VARCHAR

DO $$ 
BEGIN 
    -- Jobs table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'title' AND data_type = 'bytea') THEN
        ALTER TABLE jobs ALTER COLUMN title TYPE VARCHAR(255) USING convert_from(title, 'UTF8');
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'category' AND data_type = 'bytea') THEN
        ALTER TABLE jobs ALTER COLUMN category TYPE VARCHAR(255) USING convert_from(category, 'UTF8');
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'location' AND data_type = 'bytea') THEN
        ALTER TABLE jobs ALTER COLUMN location TYPE VARCHAR(255) USING convert_from(location, 'UTF8');
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'description' AND data_type = 'bytea') THEN
        ALTER TABLE jobs ALTER COLUMN description TYPE TEXT USING convert_from(description, 'UTF8');
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'requirements' AND data_type = 'bytea') THEN
        ALTER TABLE jobs ALTER COLUMN requirements TYPE TEXT USING convert_from(requirements, 'UTF8');
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'responsibilities' AND data_type = 'bytea') THEN
        ALTER TABLE jobs ALTER COLUMN responsibilities TYPE TEXT USING convert_from(responsibilities, 'UTF8');
    END IF;

    -- Companies table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'description' AND data_type = 'bytea') THEN
        ALTER TABLE companies ALTER COLUMN description TYPE TEXT USING convert_from(description, 'UTF8');
    END IF;

    -- Applications table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'cover_letter' AND data_type = 'bytea') THEN
        ALTER TABLE applications ALTER COLUMN cover_letter TYPE TEXT USING convert_from(cover_letter, 'UTF8');
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'employer_notes' AND data_type = 'bytea') THEN
        ALTER TABLE applications ALTER COLUMN employer_notes TYPE TEXT USING convert_from(employer_notes, 'UTF8');
    END IF;

    -- Manual Payments table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'manual_payments' AND column_name = 'admin_notes' AND data_type = 'bytea') THEN
        ALTER TABLE manual_payments ALTER COLUMN admin_notes TYPE TEXT USING convert_from(admin_notes, 'UTF8');
    END IF;
END $$;
