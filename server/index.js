const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, "erasmus.db");
const db = new sqlite3.Database(dbPath);

// Migration function to hash existing plain text passwords
async function migratePlainTextPasswords() {
  return new Promise((resolve, reject) => {
    db.all("SELECT id, password FROM users", [], async (err, rows) => {
      if (err) {
        console.error("Error fetching users for migration:", err);
        reject(err);
        return;
      }

      const saltRounds = 12;
      const updates = [];

      for (const row of rows) {
        // Check if password is already hashed (bcrypt hashes start with $2b$)
        if (!row.password.startsWith("$2b$")) {
          try {
            const hashedPassword = await bcrypt.hash(row.password, saltRounds);
            updates.push({ id: row.id, hashedPassword });
          } catch (hashError) {
            console.error(
              `Error hashing password for user ${row.id}:`,
              hashError,
            );
          }
        }
      }

      // Update passwords in database
      if (updates.length > 0) {
        const stmt = db.prepare("UPDATE users SET password = ? WHERE id = ?");

        for (const update of updates) {
          stmt.run([update.hashedPassword, update.id], (updateErr) => {
            if (updateErr) {
              console.error(
                `Error updating password for user ${update.id}:`,
                updateErr,
              );
            }
          });
        }

        stmt.finalize();
        console.log(
          `Migrated ${updates.length} plain text passwords to hashed passwords`,
        );
      } else {
        console.log("No plain text passwords found to migrate");
      }

      resolve();
    });
  });
}

// Initialize database tables
db.serialize(() => {
  // Users table for authentication
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
  )`);

  // Basic Information table
  db.run(`CREATE TABLE IF NOT EXISTS basic_information (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    firstName TEXT,
    lastName TEXT,
    email TEXT,
    semester TEXT,
    levelOfStudy TEXT,
    universityInCyprus TEXT,
    department TEXT,
    receptionCountry TEXT,
    receptionCity TEXT,
    foreignUniversity TEXT,
    departmentAtHost TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Course Matching table
  db.run(`CREATE TABLE IF NOT EXISTS course_matching (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    basic_info_id INTEGER,
    hostCourseCount INTEGER,
    homeCourseCount INTEGER,
    courseMatchingDifficult TEXT,
    courseMatchingChallenges TEXT,
    recommendCourses TEXT,
    recommendationReason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (basic_info_id) REFERENCES basic_information(id)
  )`);

  // Courses table
  db.run(`CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_matching_id INTEGER,
    name TEXT,
    code TEXT,
    ects TEXT,
    difficulty TEXT,
    examTypes TEXT,
    type TEXT DEFAULT 'host',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_matching_id) REFERENCES course_matching(id)
  )`);

  // Accommodation table
  db.run(`CREATE TABLE IF NOT EXISTS accommodation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    basic_info_id INTEGER,
    accommodationType TEXT,
    monthlyRent TEXT,
    utilities TEXT,
    neighborhood TEXT,
    roommates TEXT,
    satisfactionLevel TEXT,
    recommendAccommodation TEXT,
    recommendationReason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (basic_info_id) REFERENCES basic_information(id)
  )`);

  // Living Expenses table
  db.run(`CREATE TABLE IF NOT EXISTS living_expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    basic_info_id INTEGER,
    monthlyIncomeAmount TEXT,
    unexpectedCosts TEXT,
    moneyManagementHabits TEXT,
    cheapGroceryPlaces TEXT,
    cheapEatingPlaces TEXT,
    transportationTips TEXT,
    budgetAdvice TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (basic_info_id) REFERENCES basic_information(id)
  )`);

  // Help Future Students table
  db.run(`CREATE TABLE IF NOT EXISTS help_future_students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    basic_info_id INTEGER,
    wantToHelp TEXT,
    contactMethod TEXT,
    email TEXT,
    instagramUsername TEXT,
    facebookLink TEXT,
    linkedinProfile TEXT,
    personalWebsite TEXT,
    phoneNumber TEXT,
    preferredContactTime TEXT,
    languagesSpoken TEXT,
    helpTopics TEXT,
    specializations TEXT,
    otherSpecialization TEXT,
    availabilityLevel TEXT,
    publicProfile TEXT,
    allowPublicContact TEXT,
    responseTime TEXT,
    nickname TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (basic_info_id) REFERENCES basic_information(id)
  )`);

  // Create default admin user if it doesn't exist
  db.get("SELECT * FROM users WHERE role = 'admin'", [], (err, row) => {
    if (err) {
      console.error("Error checking for admin user:", err);
      return;
    }

    if (!row) {
      // Create default admin user with hashed password
      const saltRounds = 12;
      const hashedPassword = bcrypt.hashSync("admin123", saltRounds);

      const stmt = db.prepare(`
        INSERT INTO users (firstName, lastName, email, password, role)
        VALUES (?, ?, ?, ?, ?)
      `);

      stmt.run(
        ["Admin", "User", "admin@erasmusjourney.com", hashedPassword, "admin"],
        function (err) {
          if (err) {
            console.error("Error creating admin user:", err);
          } else {
            console.log(
              "Default admin user created: admin@erasmusjourney.com / admin123",
            );
          }
        },
      );

      stmt.finalize();
    }
  });

  // Run password migration after database setup
  migratePlainTextPasswords().catch((err) => {
    console.error("Password migration failed:", err);
  });
});

// API Routes

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// User Authentication
app.post("/api/register", (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Validate password strength
  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters long" });
  }

  // Check if user already exists
  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (row) {
      res.status(400).json({ error: "User already exists with this email" });
      return;
    }

    try {
      // Hash the password before storing
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert new user with hashed password
      const stmt = db.prepare(`
        INSERT INTO users (firstName, lastName, email, password)
        VALUES (?, ?, ?, ?)
      `);

      stmt.run([firstName, lastName, email, hashedPassword], function (err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        // Return user data without password
        res.json({
          id: this.lastID,
          firstName,
          lastName,
          email,
          message: "User registered successfully",
        });
      });

      stmt.finalize();
    } catch (hashError) {
      res.status(500).json({ error: "Error processing password" });
    }
  });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (!row) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    try {
      // Compare the provided password with the hashed password
      const passwordMatch = await bcrypt.compare(password, row.password);

      if (!passwordMatch) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Update last login
      db.run("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", [
        row.id,
      ]);

      // Return user data without password
      res.json({
        id: row.id,
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        role: row.role,
        message: "Login successful",
      });
    } catch (compareError) {
      res.status(500).json({ error: "Error during authentication" });
    }
  });
});

// Get user profile
app.get("/api/user/:id", (req, res) => {
  const userId = req.params.id;

  db.get(
    "SELECT id, firstName, lastName, email, role, created_at, last_login FROM users WHERE id = ?",
    [userId],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (!row) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json(row);
    },
  );
});

// Save basic information
app.post("/api/basic-information", (req, res) => {
  const {
    userId,
    firstName,
    lastName,
    email,
    semester,
    levelOfStudy,
    universityInCyprus,
    department,
    receptionCountry,
    receptionCity,
    foreignUniversity,
    departmentAtHost,
  } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const stmt = db.prepare(`
    INSERT INTO basic_information
    (user_id, firstName, lastName, email, semester, levelOfStudy, universityInCyprus,
     department, receptionCountry, receptionCity, foreignUniversity, departmentAtHost)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    [
      userId,
      firstName,
      lastName,
      email,
      semester,
      levelOfStudy,
      universityInCyprus,
      department,
      receptionCountry,
      receptionCity,
      foreignUniversity,
      departmentAtHost,
    ],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        message: "Basic information saved successfully",
      });
    },
  );

  stmt.finalize();
});

// Save course matching
app.post("/api/course-matching", (req, res) => {
  const {
    basicInfoId,
    hostCourseCount,
    homeCourseCount,
    courseMatchingDifficult,
    courseMatchingChallenges,
    recommendCourses,
    recommendationReason,
    courses,
  } = req.body;

  // Insert course matching record
  const stmt = db.prepare(`
    INSERT INTO course_matching
    (basic_info_id, hostCourseCount, homeCourseCount, courseMatchingDifficult,
     courseMatchingChallenges, recommendCourses, recommendationReason)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    [
      basicInfoId,
      hostCourseCount,
      homeCourseCount,
      courseMatchingDifficult,
      courseMatchingChallenges,
      recommendCourses,
      recommendationReason,
    ],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      const courseMatchingId = this.lastID;

      // Insert courses
      if (courses && courses.length > 0) {
        const courseStmt = db.prepare(`
        INSERT INTO courses (course_matching_id, name, code, ects, difficulty, examTypes, type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

        courses.forEach((course) => {
          courseStmt.run([
            courseMatchingId,
            course.name,
            course.code,
            course.ects,
            course.difficulty,
            JSON.stringify(course.examTypes),
            course.type || "host",
          ]);
        });

        courseStmt.finalize();
      }

      res.json({
        id: courseMatchingId,
        message: "Course matching saved successfully",
      });
    },
  );

  stmt.finalize();
});

// Save accommodation
app.post("/api/accommodation", (req, res) => {
  const {
    basicInfoId,
    accommodationType,
    monthlyRent,
    utilities,
    neighborhood,
    roommates,
    satisfactionLevel,
    recommendAccommodation,
    recommendationReason,
  } = req.body;

  const stmt = db.prepare(`
    INSERT INTO accommodation
    (basic_info_id, accommodationType, monthlyRent, utilities, neighborhood,
     roommates, satisfactionLevel, recommendAccommodation, recommendationReason)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    [
      basicInfoId,
      accommodationType,
      monthlyRent,
      utilities,
      neighborhood,
      roommates,
      satisfactionLevel,
      recommendAccommodation,
      recommendationReason,
    ],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        message: "Accommodation info saved successfully",
      });
    },
  );

  stmt.finalize();
});

// Save living expenses
app.post("/api/living-expenses", (req, res) => {
  const {
    basicInfoId,
    monthlyIncomeAmount,
    unexpectedCosts,
    moneyManagementHabits,
    cheapGroceryPlaces,
    cheapEatingPlaces,
    transportationTips,
    budgetAdvice,
  } = req.body;

  const stmt = db.prepare(`
    INSERT INTO living_expenses
    (basic_info_id, monthlyIncomeAmount, unexpectedCosts, moneyManagementHabits,
     cheapGroceryPlaces, cheapEatingPlaces, transportationTips, budgetAdvice)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    [
      basicInfoId,
      monthlyIncomeAmount,
      unexpectedCosts,
      moneyManagementHabits,
      cheapGroceryPlaces,
      cheapEatingPlaces,
      transportationTips,
      budgetAdvice,
    ],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        message: "Living expenses saved successfully",
      });
    },
  );

  stmt.finalize();
});

// Save help future students
app.post("/api/help-future-students", (req, res) => {
  const {
    basicInfoId,
    wantToHelp,
    contactMethod,
    email,
    instagramUsername,
    facebookLink,
    linkedinProfile,
    personalWebsite,
    phoneNumber,
    preferredContactTime,
    languagesSpoken,
    helpTopics,
    specializations,
    otherSpecialization,
    availabilityLevel,
    publicProfile,
    allowPublicContact,
    responseTime,
    nickname,
  } = req.body;

  const stmt = db.prepare(`
    INSERT INTO help_future_students
    (basic_info_id, wantToHelp, contactMethod, email, instagramUsername,
     facebookLink, linkedinProfile, personalWebsite, phoneNumber,
     preferredContactTime, languagesSpoken, helpTopics, specializations,
     otherSpecialization, availabilityLevel, publicProfile, allowPublicContact,
     responseTime, nickname)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    [
      basicInfoId,
      wantToHelp,
      contactMethod,
      email,
      instagramUsername,
      facebookLink,
      linkedinProfile,
      personalWebsite,
      phoneNumber,
      preferredContactTime,
      JSON.stringify(languagesSpoken),
      JSON.stringify(helpTopics),
      JSON.stringify(specializations),
      otherSpecialization,
      availabilityLevel,
      publicProfile,
      allowPublicContact,
      responseTime,
      nickname,
    ],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        message: "Help future students info saved successfully",
      });
    },
  );

  stmt.finalize();
});

// Get all submissions for admin
app.get("/api/submissions", (req, res) => {
  const query = `
    SELECT
      bi.*,
      cm.hostCourseCount,
      cm.homeCourseCount,
      a.accommodationType,
      a.monthlyRent,
      le.monthlyIncomeAmount,
      hfs.wantToHelp,
      hfs.nickname
    FROM basic_information bi
    LEFT JOIN course_matching cm ON bi.id = cm.basic_info_id
    LEFT JOIN accommodation a ON bi.id = a.basic_info_id
    LEFT JOIN living_expenses le ON bi.id = le.basic_info_id
    LEFT JOIN help_future_students hfs ON bi.id = hfs.basic_info_id
    ORDER BY bi.created_at DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get detailed submission
app.get("/api/submission/:id", (req, res) => {
  const id = req.params.id;

  const queries = {
    basic: "SELECT * FROM basic_information WHERE id = ?",
    courses:
      "SELECT c.* FROM courses c JOIN course_matching cm ON c.course_matching_id = cm.id WHERE cm.basic_info_id = ?",
    accommodation: "SELECT * FROM accommodation WHERE basic_info_id = ?",
    expenses: "SELECT * FROM living_expenses WHERE basic_info_id = ?",
    help: "SELECT * FROM help_future_students WHERE basic_info_id = ?",
  };

  const results = {};

  Promise.all([
    new Promise((resolve, reject) => {
      db.get(queries.basic, [id], (err, row) => {
        if (err) reject(err);
        else resolve(["basic", row]);
      });
    }),
    new Promise((resolve, reject) => {
      db.all(queries.courses, [id], (err, rows) => {
        if (err) reject(err);
        else resolve(["courses", rows]);
      });
    }),
    new Promise((resolve, reject) => {
      db.get(queries.accommodation, [id], (err, row) => {
        if (err) reject(err);
        else resolve(["accommodation", row]);
      });
    }),
    new Promise((resolve, reject) => {
      db.get(queries.expenses, [id], (err, row) => {
        if (err) reject(err);
        else resolve(["expenses", row]);
      });
    }),
    new Promise((resolve, reject) => {
      db.get(queries.help, [id], (err, row) => {
        if (err) reject(err);
        else resolve(["help", row]);
      });
    }),
  ])
    .then((queryResults) => {
      queryResults.forEach(([key, data]) => {
        results[key] = data;
      });
      res.json(results);
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
