-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    phone_number VARCHAR(50),
    address TEXT,
    resume_path VARCHAR(500),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_email ON users(email);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    industry VARCHAR(255),
    website VARCHAR(255),
    logo_path VARCHAR(500),
    address TEXT NOT NULL,
    phone_number VARCHAR(50),
    employer_id BIGINT NOT NULL REFERENCES users(id),
    payment_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_employer_id ON companies(employer_id);
CREATE INDEX idx_name ON companies(name);

-- Create manual_payments table
CREATE TABLE IF NOT EXISTS manual_payments (
    id BIGSERIAL PRIMARY KEY,
    employer_id BIGINT NOT NULL REFERENCES users(id),
    file_path VARCHAR(500) NOT NULL,
    reference_number VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_REVIEW',
    admin_notes TEXT,
    verified_by BIGINT REFERENCES users(id),
    upload_date TIMESTAMP NOT NULL,
    verified_date TIMESTAMP
);

CREATE INDEX idx_employer_id_payment ON manual_payments(employer_id);
CREATE INDEX idx_status ON manual_payments(status);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    employment_type VARCHAR(50),
    min_salary DECIMAL(10, 2),
    max_salary DECIMAL(10, 2),
    requirements TEXT,
    responsibilities TEXT,
    company_id BIGINT NOT NULL REFERENCES companies(id),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_APPROVAL',
    approved_by BIGINT REFERENCES users(id),
    rejection_reason TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    published_at TIMESTAMP
);

CREATE INDEX idx_company_id ON jobs(company_id);
CREATE INDEX idx_status_job ON jobs(status);
CREATE INDEX idx_title ON jobs(title);
CREATE INDEX idx_category ON jobs(category);
CREATE INDEX idx_location ON jobs(location);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT NOT NULL REFERENCES jobs(id),
    job_seeker_id BIGINT NOT NULL REFERENCES users(id),
    resume_path VARCHAR(500) NOT NULL,
    cover_letter TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    employer_notes TEXT,
    applied_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_job_id ON applications(job_id);
CREATE INDEX idx_job_seeker_id ON applications(job_seeker_id);
CREATE INDEX idx_status_app ON applications(status);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(100) NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    link VARCHAR(500),
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_user_id ON notifications(user_id);
CREATE INDEX idx_read ON notifications(read);

