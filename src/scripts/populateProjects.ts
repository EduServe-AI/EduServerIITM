import Milestone from "../models/milestone.model";
import Project from "../models/project.model";

export const populateProjectsIfEmpty = async () => {
  try {
    const count = await Project.count();
    if (count > 0) {
      console.log("Projects table already populated.");
      return;
    }

    console.log("Seeding Projects and Milestones...");

    // 1. Trekk Management (V1, MAD-1)
    const trekkProject = await Project.create({
      name: "Trekk Management (V1)",
      title: "Trekk Management System (MAD-1 Project)",
      code: "MAD-1-TREKK",
      course: "MAD-I Project",
      description:
        "Comprehensive multi-role Trek Management application built using Flask, SQLite, and Jinja2 templates. Features role-based access control for Admins, Trek Staff, and Trekkers, slot reservations, and booking tracking.",
      version: "V1",
      level: "diploma",
      credits: 2,
      estimatedDuration: "5–7 Weeks",
      isFeatured: true,
    });

    const trekkMilestones = [
      {
        projectId: trekkProject.id,
        milestoneNumber: 1,
        title: "Database Models and Schema Setup",
        description:
          "Setup relational database schemas, models, and foreign key relationships for the Trekk application ecosystem.",
        expectedTime: "5–7 days",
        completionProgress: 18,
        tasks: [
          {
            id: "m1-t1",
            title: "User Table",
            details: ["Roles: Admin / Trek Staff / Trekker", "Email unique constraint", "Hashed password & contact attributes"],
          },
          {
            id: "m1-t2",
            title: "Trek Table",
            details: [
              "Trek Name, Difficulty level, Duration, Available Slots",
              "Assigned Staff foreign key reference",
              "Status (Active, Completed, Cancelled)",
            ],
          },
          {
            id: "m1-t3",
            title: "Booking Table",
            details: [
              "User ID, Trek ID, Booking Status (Pending, Confirmed, Cancelled)",
              "Booking Date & Payment Status (Paid, Unpaid)",
            ],
          },
          {
            id: "m1-t4",
            title: "Staff Profile Table",
            details: ["Staff ID, User ID, Emergency Contact, Certifications, Experience years"],
          },
          {
            id: "m1-t5",
            title: "Define Relationships",
            details: [
              "Trek Staff -> Trek (One-to-Many / Many-to-Many)",
              "Trek -> Booking (One-to-Many)",
              "User -> Booking (One-to-Many)",
            ],
          },
        ],
        deliverables: [
          "SQLAlchemy / Database Schema Migration files",
          "Initial seed script with demo Treks, Users, and Staff profiles",
          "ER Diagram documentation",
        ],
        resources: [
          { title: "Flask-SQLAlchemy Documentation", url: "https://flask-sqlalchemy.palletsprojects.com/" },
          { title: "Database Normalization Guide", url: "https://en.wikipedia.org/wiki/Database_normalization" },
        ],
      },
      {
        projectId: trekkProject.id,
        milestoneNumber: 2,
        title: "User Authentication & Role-Based Access Control (RBAC)",
        description:
          "Implement secure authentication, session management, and role-based authorization rules for Admins, Staff, and Trekkers.",
        expectedTime: "4–6 days",
        completionProgress: 0,
        tasks: [
          {
            id: "m2-t1",
            title: "Authentication Logic",
            details: ["Session-based or JWT login and registration flow", "Bcrypt password hashing"],
          },
          {
            id: "m2-t2",
            title: "Role Middleware & Decorators",
            details: ["@admin_required, @staff_required, and @trekker_required decorators", "Unauthorized error handling (401/403)"],
          },
          {
            id: "m2-t3",
            title: "User Profile Management",
            details: ["Profile update route for password and contact changes", "Booking history view for trekkers"],
          },
        ],
        deliverables: [
          "Auth Blueprints & Controller routes",
          "Unit tests verifying role protection on sensitive endpoints",
        ],
        resources: [{ title: "Flask-Login Documentation", url: "https://flask-login.readthedocs.io/" }],
      },
      {
        projectId: trekkProject.id,
        milestoneNumber: 3,
        title: "Core Trek & Inventory Management APIs",
        description:
          "Develop CRUD operations for treks, schedule management, slot allocations, and staff assignment engines.",
        expectedTime: "6–8 days",
        completionProgress: 0,
        tasks: [
          {
            id: "m3-t1",
            title: "Trek CRUD Operations",
            details: ["Create, view, edit, and archive trek packages", "Filter treks by difficulty, price, and duration"],
          },
          {
            id: "m3-t2",
            title: "Staff Assignment Engine",
            details: ["Assign certified staff to scheduled trek batches", "Check staff schedule conflicts"],
          },
          {
            id: "m3-t3",
            title: "Slot Availability Engine",
            details: ["Dynamic slot availability calculations", "Prevent overbooking beyond capacity"],
          },
        ],
        deliverables: [
          "Trek Management API Endpoints & HTML Templates",
          "Search & Filter feature integration",
        ],
        resources: [{ title: "Jinja2 Template Guide", url: "https://jinja.palletsprojects.com/" }],
      },
      {
        projectId: trekkProject.id,
        milestoneNumber: 4,
        title: "Booking & Reservation Flow",
        description:
          "Build the end-to-end trek reservation process including capacity checks, payment status, and cancellations.",
        expectedTime: "5–7 days",
        completionProgress: 0,
        tasks: [
          {
            id: "m4-t1",
            title: "Reservation Engine",
            details: ["Atomic slot reservation process", "Validation of user eligibility and slot availability"],
          },
          {
            id: "m4-t2",
            title: "Payment Status Simulation",
            details: ["Integration of mock payment status updates (Paid / Pending)", "Invoice generation"],
          },
          {
            id: "m4-t3",
            title: "Cancellation Flow",
            details: ["Allow users to cancel bookings within grace period", "Automated slot recovery"],
          },
        ],
        deliverables: [
          "Booking controller & UI flow",
          "Automated tests for concurrent booking scenarios",
        ],
        resources: [{ title: "Atomic Transactions in SQL", url: "https://docs.python.org/3/library/sqlite3.html" }],
      },
      {
        projectId: trekkProject.id,
        milestoneNumber: 5,
        title: "Admin & Staff Dashboard Functionality",
        description:
          "Create rich management dashboards providing operational metrics, roster lists, and staff schedule overviews.",
        expectedTime: "5–7 days",
        completionProgress: 0,
        tasks: [
          {
            id: "m5-t1",
            title: "Staff Work Dashboard",
            details: ["View assigned trek schedules & trekker manifests", "Mark trek completion status"],
          },
          {
            id: "m5-t2",
            title: "Admin Analytics",
            details: ["Revenue reports, active booking metrics, and capacity utilization graphs"],
          },
          {
            id: "m5-t3",
            title: "Passenger Roster Export",
            details: ["Generate PDF / CSV manifests for guide staff"],
          },
        ],
        deliverables: [
          "Staff & Admin dashboard pages",
          "CSV Roster Export module",
        ],
        resources: [{ title: "Chart.js Documentation", url: "https://www.chartjs.org/" }],
      },
      {
        projectId: trekkProject.id,
        milestoneNumber: 6,
        title: "Testing, Error Handling & API Documentation",
        description:
          "Finalize production readiness with comprehensive input sanitization, error handling, and project documentation.",
        expectedTime: "4–5 days",
        completionProgress: 0,
        tasks: [
          {
            id: "m6-t1",
            title: "Input Validation & Security",
            details: ["Sanitize all user inputs", "Protection against XSS and CSRF"],
          },
          {
            id: "m6-t2",
            title: "Unit & Integration Testing",
            details: ["Write pytest suite for all critical API routes", "Ensure 80%+ test coverage"],
          },
          {
            id: "m6-t3",
            title: "Final Milestone Submission",
            details: ["Compile README, ERD diagram, and API documentation", "Prepare demo video walkthrough"],
          },
        ],
        deliverables: [
          "Complete PyTest suite passing all checks",
          "Final Project Report and Repository link",
        ],
        resources: [{ title: "PyTest Framework", url: "https://docs.pytest.org/" }],
      },
    ];

    for (const milestone of trekkMilestones) {
      await Milestone.create(milestone);
    }

    // 2. Library Management (V2, MAD-2)
    const libProject = await Project.create({
      name: "Library Management (V2)",
      title: "Smart Library Management System (MAD-2 Project)",
      code: "MAD-2-LIB",
      course: "MAD-II Project",
      description:
        "Modern Full-Stack Library Platform built with Vue.js 3, Flask RESTful API, SQLite/PostgreSQL, Celery background workers, and Redis for asynchronous exports and automated due date reminders.",
      version: "V2",
      level: "diploma",
      credits: 2,
      estimatedDuration: "4–6 Weeks",
      isFeatured: true,
    });

    const libMilestones = [
      {
        projectId: libProject.id,
        milestoneNumber: 1,
        title: "Full-Stack System Architecture & Vue 3 Setup",
        description:
          "Setup Flask RESTful backend architecture, SQLAlchemy models, and Vue 3 Single Page Application frontend.",
        expectedTime: "4–5 days",
        completionProgress: 0,
        tasks: [
          {
            id: "lm1-t1",
            title: "Flask REST API Scaffolding",
            details: ["Setup Flask Blueprints & CORS support", "Configure SQLite / Postgres ORM models"],
          },
          {
            id: "lm1-t2",
            title: "Vue 3 Vite SPA Setup",
            details: ["Initialize Vue 3 project with Pinia state management", "Setup Vue Router with layout components"],
          },
          {
            id: "lm1-t3",
            title: "Database Models",
            details: ["Book, Author, Section, User, and BorrowRecord models"],
          },
        ],
        deliverables: [
          "Frontend & Backend starter templates connected via HTTP API",
          "Database migration scripts",
        ],
        resources: [
          { title: "Vue.js 3 Official Guide", url: "https://vuejs.org/" },
          { title: "Pinia State Management", url: "https://pinia.vuejs.org/" },
        ],
      },
      {
        projectId: libProject.id,
        milestoneNumber: 2,
        title: "Authentication & Multi-Role User Portals",
        description:
          "Implement JWT token authentication with refresh tokens and route guards for Librarian vs Student portals.",
        expectedTime: "5–6 days",
        completionProgress: 0,
        tasks: [
          {
            id: "lm2-t1",
            title: "JWT Authentication Engine",
            details: ["Flask-JWT-Extended implementation", "Access token (short-lived) & Refresh token flow"],
          },
          {
            id: "lm2-t2",
            title: "Vue Navigation Guards",
            details: ["Protect admin/librarian routes in Vue Router", "Automatic token refresh interceptor"],
          },
          {
            id: "lm2-t3",
            title: "Role-Based UI Views",
            details: ["Librarian administrative dashboard", "Student catalog & issued books portal"],
          },
        ],
        deliverables: [
          "Secure Auth system with JWT storage in HTTP-only cookies / localStorage",
          "Role-protected navigation UI",
        ],
        resources: [{ title: "Flask-JWT-Extended", url: "https://flask-jwt-extended.readthedocs.io/" }],
      },
      {
        projectId: libProject.id,
        milestoneNumber: 3,
        title: "Book Catalog & Resource Management",
        description:
          "Develop complete catalog management, live search with debouncing, section indexing, and media file uploads.",
        expectedTime: "6–7 days",
        completionProgress: 0,
        tasks: [
          {
            id: "lm3-t1",
            title: "Book Catalog CRUD",
            details: ["Create, edit, delete books, authors, and sections", "Stock inventory tracking"],
          },
          {
            id: "lm3-t2",
            title: "Asynchronous Debounced Search",
            details: ["Live search input in Vue using lodash debounce", "Filter by section, author, availability"],
          },
          {
            id: "lm3-t3",
            title: "File Upload Manager",
            details: ["Cover image uploads and e-book sample PDF storage"],
          },
        ],
        deliverables: [
          "Interactive catalog manager in Vue 3",
          "File upload REST endpoints",
        ],
        resources: [{ title: "Vite Asset Handling", url: "https://vitejs.dev/" }],
      },
      {
        projectId: libProject.id,
        milestoneNumber: 4,
        title: "Book Issue, Return & Automated Fine Calculation System",
        description:
          "Implement borrowing lifecycle rules, maximum borrow caps, return verification, and fine calculation algorithms.",
        expectedTime: "6–8 days",
        completionProgress: 0,
        tasks: [
          {
            id: "lm4-t1",
            title: "Issue Request Workflow",
            details: ["Student requests book issue -> Librarian approves/rejects", "Enforce maximum 5 active borrows per student"],
          },
          {
            id: "lm4-t2",
            title: "Fine Calculation Engine",
            details: ["Calculate overdue days dynamically", "Apply fine rate (e.g. ₹5 per day)"],
          },
          {
            id: "lm4-t3",
            title: "Return & Revoke Management",
            details: ["Librarian receives book return and marks record completed", "Slot stock restoration"],
          },
        ],
        deliverables: [
          "Borrowing and Fine calculation module",
          "API tests for borrow limit enforcement",
        ],
        resources: [{ title: "Python Datetime Calculations", url: "https://docs.python.org/3/library/datetime.html" }],
      },
      {
        projectId: libProject.id,
        milestoneNumber: 5,
        title: "Asynchronous Background Tasks & Analytics Dashboard",
        description:
          "Integrate Celery + Redis for automated email notifications, background CSV report generation, and Chart.js metrics.",
        expectedTime: "5–6 days",
        completionProgress: 0,
        tasks: [
          {
            id: "lm5-t1",
            title: "Celery & Redis Worker",
            details: ["Setup Celery task queue with Redis broker", "Daily scheduled job to send overdue notification emails"],
          },
          {
            id: "lm5-t2",
            title: "Async CSV Export",
            details: ["Trigger background CSV report generation for user borrowing history", "Download link generation"],
          },
          {
            id: "lm5-t3",
            title: "Librarian Analytics",
            details: ["Chart.js dashboard displaying top borrowed books, monthly issues, and active students"],
          },
        ],
        deliverables: [
          "Working Celery task queue integration",
          "CSV Export feature and Analytics Dashboard",
        ],
        resources: [{ title: "Celery Task Queue Guide", url: "https://docs.celeryq.dev/" }],
      },
    ];

    for (const milestone of libMilestones) {
      await Milestone.create(milestone);
    }

    console.log("Projects and Milestones seeded successfully!");
  } catch (error) {
    console.error("Error populating projects and milestones:", error);
  }
};
