const sqlite3 = require('sqlite3').verbose();

// Open a database connection
const db = new sqlite3.Database('./messenger.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Function to save a message
function save(from_id, to_id, message) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO messages (from_id, to_id, message) VALUES (?, ?, ?)`;
    db.run(sql, [from_id, to_id, message], function (err) {
      if (err) {
        reject('Error saving message: ' + err.message);
      } else {
        resolve({ id: this.lastID, from_id, to_id, message });
      }
    });
  });
}

// Function to get messages between two users
function get(from_id, to_id) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT * FROM messages
      WHERE (from_id = ? AND to_id = ?)
         OR (from_id = ? AND to_id = ?)
      ORDER BY timestamp ASC
    `;
    db.all(sql, [from_id, to_id, to_id, from_id], (err, rows) => {
      if (err) {
        reject('Error retrieving messages: ' + err.message);
      } else {
        resolve(rows);
      }
    });
  });
}

module.exports = { save, get };

// Close the database connection when the application exits
process.on('exit', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
  });
});