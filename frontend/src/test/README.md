# Frontend Testing Suite

This directory contains the automated tests for the JobSpher frontend application. The suite uses **Jest** and **React Testing Library** for Unit, Integration, and System tests (running in JSDOM).

## 📂 Directory Structure

### `unit/`
Tests for individual components and services in isolation.
- **Components**: Verifies rendering, props, and simple interactions (e.g., `Navbar`, `ErrorMessage`, `LoadingSpinner`).
- **Services**: Verifies API service logic using mocked Axios requests (e.g., `authService`).

### `integration/`
Tests for interactions between multiple units, primarily Pages and Context.
- **Pages**: Verifies page-level logic, including form submissions, loading states, and side effects (e.g., `Login`, `JobList`).
- **Context**: Verifies Global State management (e.g., `AuthContext`).

### `e2e/` (System Tests)
Simulates full user journeys using JSDOM. These are faster than full browser automation and cover the logic flow of the entire application.
- **System.test.js**: User Login -> View Jobs -> Filter -> Logout.

---

## 🚀 Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test
```bash
npm test -- <filename>
# Example:
npm test -- System.test.js
```

### Watch Mode
By default, `npm test` runs in watch mode. Use `a` to run all tests or `f` to run only failed tests.

---

## 🌐 Playwright Tests (Cross-Browser)

For true End-to-End testing across real browsers (Chrome, Firefox, Safari), we use **Playwright**.
These tests are located in the root `tests/` directory (outside `src`).

### Run Playwright Tests
```bash
npx playwright test
```

### Show Report
```bash
npx playwright show-report
```
