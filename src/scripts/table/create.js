const sqlite3 = require('sqlite3').verbose();

// Open a database connection
const db = new sqlite3.Database('./messenger.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// SQL statement to create the table
const createTableSQL = `
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_id TEXT NOT NULL,
    to_id TEXT NOT NULL,
    message TEXT NOT NULL CHECK(LENGTH(message) <= 255),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

// Execute the SQL statement
db.run(createTableSQL, (err) => {
  if (err) {
    console.error('Error creating table:', err.message);
  } else {
    console.log('Table "messages" created successfully.');
  }
});

// Close the database connection
db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Database connection closed.');
  }
});