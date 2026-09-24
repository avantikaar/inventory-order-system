const fs = require('fs');
const db = require('./db');

async function seed() {
    try {
        const sql = fs.readFileSync('./schema.sql', 'utf8');
        // Split by semicolon and run each statement
        const statements = sql.split(';').filter(s => s.trim().length > 0);
        
        for (let statement of statements) {
            await db.query(statement);
        }
        console.log('✅ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error.message);
        process.exit(1);
    }
}

seed();