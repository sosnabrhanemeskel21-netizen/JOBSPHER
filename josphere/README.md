# JobSpher - Job Board Application

A full-stack job board application built with React and Spring Boot, enabling employers to post jobs and job seekers to browse and apply for positions.

## 🎯 Project Overview

JobSpher is a comprehensive job board platform that connects employers and job seekers. The application features role-based access control with three user types: **Admin**, **Employer**, and **Job Seeker**.

### Key Features

- **User Management**
  - User registration and authentication with JWT
  - Role-based access control (Admin, Employer, Job Seeker)
  - Secure password storage using BCrypt

- **Job Management**
  - Employers can create and manage job postings
  - Job approval workflow (Admin approval required)
  - Advanced job search with filters (keyword, category, location, salary range)
  - Job status tracking (Pending Approval, Active, Closed, Rejected)

- **Application Management**
  - Job seekers can apply to jobs with resume and cover letter
  - Employers can view and manage applications
  - Application status tracking (Submitted, Shortlisted, Rejected, Hired)

- **Company Management**
  - Employers can register and manage their company profiles
  - Company logo and information management
  - Payment verification system for employers

- **Admin Features**
  - Job approval/rejection
  - Payment verification management
  - User and company management
  - Dashboard with statistics

- **Notifications**
  - Real-time notifications for application status updates
  - Job approval notifications
  - Payment verification notifications

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 19.2.3
- React Router 6.20.0
- Axios for API calls
- CSS for styling

**Backend:**
- Spring Boot 3.4.12
- Java 17
- PostgreSQL database
- JWT authentication
- Flyway for database migrations
- OpenAPI/Swagger for API documentation

**Infrastructure:**
- Docker for containerization
- Nginx for frontend serving
- PostgreSQL for data persistence

### Project Structure

```
josphere/
├── frontend/                 # React frontend application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── context/         # React Context (AuthContext)
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   └── App.js           # Main application component
│   ├── Dockerfile           # Frontend Docker configuration
│   └── package.json         # Frontend dependencies
│
├── jobSpher/                # Spring Boot backend application
│   ├── src/main/java/com/jobSpher/jobSpher/
│   │   ├── controller/      # REST API controllers
│   │   ├── service/         # Business logic layer
│   │   ├── repository/      # Data access layer
│   │   ├── model/           # Entity models
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── security/        # Security configuration
│   │   ├── exception/       # Exception handling
│   │   └── config/          # Configuration classes
│   ├── src/main/resources/
│   │   ├── application.properties  # Application configuration
│   │   └── db/migration/    # Flyway database migrations
│   └── Dockerfile           # Backend Docker configuration
│
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites

- **Java 17** or higher
- **Node.js 18** or higher
- **PostgreSQL 12** or higher
- **Maven 3.6+** (or use Maven wrapper)
- **Docker** (optional, for containerized deployment)

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd josphere
```

#### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE jobSpher_DB;
```

#### 3. Backend Configuration

Navigate to the backend directory:

```bash
cd jobSpher
```

Create `src/main/resources/application.properties` with the following configuration (or copy from `application.properties.example` if available):

```properties
spring.application.name=jobSpher

# PostgreSQL connection
spring.datasource.url=jdbc:postgresql://localhost:5432/jobSpher_DB
spring.datasource.username=postgres
spring.datasource.password=YOUR_DATABASE_PASSWORD

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# JWT Configuration (use environment variable in production)
jwt.secret=YOUR_SECRET_KEY_MIN_256_BITS_FOR_SECURITY
jwt.expiration=86400000

# File Upload Configuration
file.upload-dir=uploads
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Server Configuration
server.port=8080

# Flyway Configuration
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.flyway.validate-on-migrate=true
```

**⚠️ Security Note:** In production, use environment variables for sensitive values like database passwords and JWT secrets.

#### 4. Run Backend

Using Maven wrapper:

```bash
./mvnw spring-boot:run
```

Or using Maven directly:

```bash
mvn spring-boot:run
```

The backend API will be available at `http://localhost:8080`

#### 5. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create `.env` file (optional, for custom API URL):

```env
REACT_APP_API_URL=http://localhost:8080/api
```

#### 6. Run Frontend

```bash
npm start
```

The frontend will be available at `http://localhost:3000`

### Docker Setup (Alternative)

Build and run using Docker Compose (create `docker-compose.yml` if needed):

```bash
docker-compose up --build
```

Or build and run individually:

**Backend:**
```bash
cd jobSpher
docker build -t jobspher-backend .
docker run -p 8080:8080 jobspher-backend
```

**Frontend:**
```bash
cd frontend
docker build -t jobspher-frontend .
docker run -p 80:80 jobspher-frontend
```

## 📚 API Documentation

Once the backend is running, API documentation is available via Swagger UI:

- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **OpenAPI JSON:** http://localhost:8080/v3/api-docs

### API Endpoints Overview

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

#### Jobs
- `GET /api/jobs` - Search and list jobs (public)
- `GET /api/jobs/{id}` - Get job details (public)
- `POST /api/jobs` - Create a job (EMPLOYER only)
- `GET /api/jobs/my` - Get my jobs (EMPLOYER only)

#### Applications
- `POST /api/applications` - Apply to a job (JOB_SEEKER only)
- `GET /api/applications/my` - Get my applications (JOB_SEEKER only)
- `GET /api/applications/job/{jobId}` - Get applications for a job (EMPLOYER only)
- `PUT /api/applications/{id}/status` - Update application status (EMPLOYER only)

#### Companies
- `POST /api/companies` - Create company profile (EMPLOYER only)
- `GET /api/companies/my` - Get my company (EMPLOYER only)
- `PUT /api/companies/my` - Update company profile (EMPLOYER only)

#### Admin
- `GET /api/admin/jobs/pending` - Get pending jobs (ADMIN only)
- `PUT /api/admin/jobs/{id}/approve` - Approve job (ADMIN only)
- `PUT /api/admin/jobs/{id}/reject` - Reject job (ADMIN only)
- `GET /api/admin/payments/pending` - Get pending payments (ADMIN only)
- `PUT /api/admin/payments/{id}/verify` - Verify payment (ADMIN only)

#### Files
- `POST /api/files/upload` - Upload file (resume, logo, payment proof)
- `GET /api/files/download/{filePath}` - Download file (public)

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 👥 User Roles

### Admin
- Approve/reject job postings
- Verify employer payments
- Manage users and companies
- View system statistics

**Default Admin Credentials:**
- Email: `admin@jobspher.com`
- Password: `admin123`

⚠️ **Change the default admin password in production!**

### Employer
- Register company profile
- Create job postings (requires admin approval)
- Upload payment verification documents
- View and manage job applications
- Update company information

### Job Seeker
- Browse and search jobs
- Apply to jobs with resume and cover letter
- View application status
- Update profile and resume

## 🔒 Security

### Authentication
- JWT-based stateless authentication
- Tokens expire after 24 hours (configurable)
- Secure password hashing using BCrypt

### Authorization
- Role-based access control (RBAC)
- Method-level security using Spring Security
- Protected endpoints based on user roles

### Security Best Practices
- ✅ Passwords are hashed using BCrypt
- ✅ JWT tokens for stateless authentication
- ✅ SQL injection protection via JPA/Hibernate
- ✅ CORS configuration
- ✅ Input validation using Jakarta Validation

### Production Security Checklist
- [ ] Change default admin password
- [ ] Use strong JWT secret (256+ bits)
- [ ] Store sensitive config in environment variables
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Implement rate limiting
- [ ] Add request logging and monitoring
- [ ] Regular security updates for dependencies

## 🗄️ Database

The application uses PostgreSQL with Flyway for database migrations. Schema is automatically created and updated through migration scripts located in `jobSpher/src/main/resources/db/migration/`.

### Main Tables
- `users` - User accounts and authentication
- `companies` - Company profiles
- `jobs` - Job postings
- `applications` - Job applications
- `manual_payments` - Payment verification records
- `notifications` - User notifications

### Database Migrations

Flyway migrations run automatically on application startup. Migration files follow the naming convention:
- `V{version}__{description}.sql`

Example: `V1__create_tables.sql`, `V2__seed_data.sql`

## 🧪 Testing

### Backend Tests

Run backend tests:

```bash
cd jobSpher
./mvnw test
```

### Frontend Tests

Run frontend tests:

```bash
cd frontend
npm test
```

**Note:** Test coverage is currently minimal. Consider adding comprehensive unit and integration tests.

## 📦 Building for Production

### Backend

Build JAR file:

```bash
cd jobSpher
./mvnw clean package -DskipTests
```

The JAR file will be in `target/jobSpher-0.0.1-SNAPSHOT.jar`

Run the JAR:

```bash
java -jar target/jobSpher-0.0.1-SNAPSHOT.jar
```

### Frontend

Build production bundle:

```bash
cd frontend
npm run build
```

The optimized build will be in the `build/` directory.

## 🌍 Environment Variables

### Backend Environment Variables

Create `.env` file or set environment variables:

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/jobSpher_DB
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_password
JWT_SECRET=your_256_bit_secret_key
JWT_EXPIRATION=86400000
FILE_UPLOAD_DIR=uploads
```

Then update `application.properties` to use environment variables:

```properties
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
jwt.secret=${JWT_SECRET}
```

### Frontend Environment Variables

```bash
REACT_APP_API_URL=http://localhost:8080/api
```

## 🐛 Troubleshooting

### Backend Issues

**Port 8080 already in use:**
- Change port in `application.properties`: `server.port=8081`

**Database connection error:**
- Verify PostgreSQL is running
- Check database credentials in `application.properties`
- Ensure database `jobSpher_DB` exists

**Flyway migration errors:**
- Check PostgreSQL logs
- Verify database user has proper permissions
- Check migration files for syntax errors

### Frontend Issues

**API calls failing:**
- Verify backend is running on correct port
- Check `REACT_APP_API_URL` in `.env`
- Verify CORS configuration in backend
- Check browser console for errors

**Build errors:**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style Guidelines

- **Backend:** Follow Java naming conventions and Spring Boot best practices
- **Frontend:** Follow React best practices and JavaScript ES6+ standards
- **Comments:** Add meaningful comments for complex logic
- **Documentation:** Update README and API documentation for new features

## 📝 License

[Add your license here]

## 👨‍💻 Authors

[Add author information here]

## 🙏 Acknowledgments

- Spring Boot framework
- React library
- PostgreSQL database
- All open-source contributors

---

**Note:** This project is for educational/demonstration purposes. For production use, ensure all security best practices are implemented and thoroughly tested.

