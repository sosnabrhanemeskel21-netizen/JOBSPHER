# Database Setup Instructions

## Issue Found
The database `jobSpher_DB` does not exist in PostgreSQL. This is causing the "Login failed" error.

## Solution: Create the Database

### Option 1: Using PostgreSQL Command Line (if psql is in PATH)
```bash
psql -U postgres
CREATE DATABASE "jobSpher_DB";
\q
```

### Option 2: Using pgAdmin (GUI)
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on "Databases" → "Create" → "Database"
4. Enter database name: `jobSpher_DB`
5. Click "Save"

### Option 3: Using SQL Command in PowerShell
If you have PostgreSQL installed, you can run:
```powershell
# Find PostgreSQL bin directory (common locations):
# C:\Program Files\PostgreSQL\<version>\bin\psql.exe
# Or check: Get-Command psql -ErrorAction SilentlyContinue

# Then run:
& "C:\Program Files\PostgreSQL\<version>\bin\psql.exe" -U postgres -c "CREATE DATABASE \"jobSpher_DB\";"
```

### Option 4: Let Spring Boot Create It (Not Recommended)
You can temporarily change `spring.jpa.hibernate.ddl-auto=create` in `application.properties`, but this will drop all data on restart. Use only for initial setup.

## Verify Database Connection

After creating the database, you can test the connection by running:
```bash
cd josphere\jobSpher
mvn exec:java "-Dexec.mainClass=com.jobSpher.jobSpher.util.DatabaseConnectionTest"
```

## Current Database Configuration

Your `application.properties` is configured with:
- **URL**: `jdbc:postgresql://localhost:5432/jobSpher_DB`
- **Username**: `postgres`
- **Password**: `1234`

**Note**: Make sure:
1. PostgreSQL service is running
2. The password `1234` is correct for the `postgres` user
3. The database `jobSpher_DB` exists (case-sensitive)

## After Database Creation

Once the database is created, Spring Boot will automatically:
- Run Flyway migrations to create tables
- Initialize the admin user (admin@jobspher.com / admin123)

You can then start the application:
```bash
cd josphere\jobSpher
mvn spring-boot:run
```

