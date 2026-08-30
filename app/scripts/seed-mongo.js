/**
 * Standalone MongoDB Atlas Seed Script
 * Usage:
 *   node scripts/seed-mongo.js "mongodb+srv://<username>:<password>@cluster0.mongodb.net/kaalyug_portfolio?retryWrites=true&w=majority"
 *   OR set MONGODB_URI in your environment / .env.local and run:
 *   node scripts/seed-mongo.js
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = process.argv[2] || process.env.MONGODB_URI;

if (!uri) {
  console.error('\x1b[31mError: Please provide your MongoDB Atlas URI as an argument or set MONGODB_URI.\x1b[0m');
  console.log('Example: node scripts/seed-mongo.js "mongodb+srv://user:pass@cluster.mongodb.net/kaalyug_portfolio"');
  process.exit(1);
}

async function seed() {
  const client = new MongoClient(uri);
  try {
    console.log('\x1b[36mConnecting to MongoDB Atlas...\x1b[0m');
    await client.connect();
    console.log('\x1b[32m✓ Connected to MongoDB Atlas!\x1b[0m');

    const dbName = (uri.split('@')[1]?.split('?')[0]?.split('/')[1]) || 'kaalyug_portfolio';
    const db = client.db(dbName);
    console.log('Using database: ' + dbName);

    // 1. Seed Blogs
    const blogs = JSON.parse(fs.readFileSync(path.join(__dirname, '../seed_data/blogs.json'), 'utf8'));
    await db.collection('blogs').deleteMany({});
    await db.collection('blogs').insertMany(blogs);
    console.log(`\x1b[32m✓ Seeded ${blogs.length} blogs into 'blogs' collection\x1b[0m`);

    // 2. Seed Projects
    const projects = JSON.parse(fs.readFileSync(path.join(__dirname, '../seed_data/projects.json'), 'utf8'));
    await db.collection('projects').deleteMany({});
    await db.collection('projects').insertMany(projects);
    console.log(`\x1b[32m✓ Seeded ${projects.length} projects into 'projects' collection\x1b[0m`);

    // 3. Seed Site Info
    const siteInfo = JSON.parse(fs.readFileSync(path.join(__dirname, '../seed_data/site_info.json'), 'utf8'));
    await db.collection('site_info').deleteMany({});
    await db.collection('site_info').insertMany(siteInfo);
    console.log(`\x1b[32m✓ Seeded site info into 'site_info' collection\x1b[0m`);

    console.log('\n\x1b[32m🎉 All portfolio data successfully synchronized to MongoDB Atlas!\x1b[0m');
  } catch (err) {
    console.error('\x1b[31mSeeding failed:\x1b[0m', err.message);
  } finally {
    await client.close();
  }
}

seed();
