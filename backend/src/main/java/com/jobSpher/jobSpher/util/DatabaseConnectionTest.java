package com.jobSpher.jobSpher.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * Utility class to test database connectivity
 * Run this as a standalone test to verify database connection settings
 */
public class DatabaseConnectionTest {
    
    private static final String DB_URL = "jdbc:postgresql://localhost:5432/jobSpher_DB";
    private static final String POSTGRES_URL = "jdbc:postgresql://localhost:5432/postgres"; // Connect to default postgres DB
    private static final String DB_USERNAME = "postgres";
    private static final String DB_PASSWORD = "1234";
    private static final String DB_NAME = "jobSpher_DB";
    
    public static void main(String[] args) {
        System.out.println("=== Database Connection Test ===");
        System.out.println("Target Database: " + DB_NAME);
        System.out.println("Username: " + DB_USERNAME);
        System.out.println("Password: " + (DB_PASSWORD.isEmpty() ? "(empty)" : "***"));
        System.out.println();
        
        try {
            // Load PostgreSQL driver
            Class.forName("org.postgresql.Driver");
            System.out.println("✓ PostgreSQL driver loaded successfully");
            
            // First, try to connect to postgres database to check if we can create the target database
            System.out.println("Step 1: Connecting to PostgreSQL server (postgres database)...");
            Connection postgresConnection = DriverManager.getConnection(POSTGRES_URL, DB_USERNAME, DB_PASSWORD);
            System.out.println("✓ Connected to PostgreSQL server successfully!");
            
            // Check if target database exists
            System.out.println("Step 2: Checking if database '" + DB_NAME + "' exists...");
            boolean dbExists = checkDatabaseExists(postgresConnection, DB_NAME);
            
            if (!dbExists) {
                System.out.println("✗ Database '" + DB_NAME + "' does not exist.");
                System.out.println("Creating database '" + DB_NAME + "'...");
                createDatabase(postgresConnection, DB_NAME);
                System.out.println("✓ Database '" + DB_NAME + "' created successfully!");
            } else {
                System.out.println("✓ Database '" + DB_NAME + "' already exists.");
            }
            
            postgresConnection.close();
            
            // Now try to connect to the target database
            System.out.println();
            System.out.println("Step 3: Connecting to target database '" + DB_NAME + "'...");
            Connection connection = DriverManager.getConnection(DB_URL, DB_USERNAME, DB_PASSWORD);
            
            if (connection != null && !connection.isClosed()) {
                System.out.println("✓ Database connection successful!");
                System.out.println("Database: " + connection.getCatalog());
                System.out.println("Driver: " + connection.getMetaData().getDriverName());
                System.out.println("Driver Version: " + connection.getMetaData().getDriverVersion());
                System.out.println("Database Product: " + connection.getMetaData().getDatabaseProductName());
                System.out.println("Database Version: " + connection.getMetaData().getDatabaseProductVersion());
                
                connection.close();
                System.out.println("✓ Connection closed successfully");
            }
            
        } catch (ClassNotFoundException e) {
            System.err.println("✗ Error: PostgreSQL driver not found");
            System.err.println("Make sure postgresql driver is in the classpath");
            e.printStackTrace();
        } catch (SQLException e) {
            System.err.println("✗ Database connection failed!");
            System.err.println("Error Code: " + e.getErrorCode());
            System.err.println("SQL State: " + e.getSQLState());
            System.err.println("Message: " + e.getMessage());
            System.err.println();
            System.err.println("Common issues:");
            System.err.println("1. PostgreSQL service is not running");
            System.err.println("2. Database 'jobSpher_DB' does not exist");
            System.err.println("3. Username or password is incorrect");
            System.err.println("4. PostgreSQL is not listening on port 5432");
            System.err.println("5. Firewall blocking the connection");
            e.printStackTrace();
        }
    }
    
    /**
     * Check if a database exists
     */
    private static boolean checkDatabaseExists(Connection connection, String dbName) throws SQLException {
        String query = "SELECT 1 FROM pg_database WHERE datname = ?";
        try (java.sql.PreparedStatement stmt = connection.prepareStatement(query)) {
            stmt.setString(1, dbName);
            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next();
            }
        }
    }
    
    /**
     * Create a new database
     */
    private static void createDatabase(Connection connection, String dbName) throws SQLException {
        // Note: PostgreSQL doesn't support parameterized queries for CREATE DATABASE
        // We need to use string concatenation, but dbName is from a constant, so it's safe
        String createDbQuery = "CREATE DATABASE \"" + dbName + "\"";
        try (Statement stmt = connection.createStatement()) {
            stmt.executeUpdate(createDbQuery);
        }
    }
}

