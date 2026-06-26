import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Member from './models/Member';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/the_end';

const membersPath = path.join(__dirname, 'members.json');
const members = JSON.parse(fs.readFileSync(membersPath, 'utf-8'));

async function seed() {
  try {
    if (MONGODB_URI.startsWith('mongodb+srv://')) {
      const host = MONGODB_URI.split('@')[1]?.split('/')[0]?.split('?')[0];
      if (host) {
        try {
          await dns.promises.resolveSrv(`_mongodb._tcp.${host}`);
        } catch (err) {
          console.warn('⚠️ SRV DNS resolution failed, falling back to public DNS (1.1.1.1, 8.8.8.8)...');
          try {
            dns.setServers(['1.1.1.1', '8.8.8.8']);
          } catch (dnsErr) {
            console.error('Failed to set DNS servers:', dnsErr);
          }
        }
      }
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Member.deleteMany({});
    console.log('🗑️  Cleared existing members');

    // Insert new data
    const inserted = await Member.insertMany(members);
    console.log(`✨ Inserted ${inserted.length} members`);

    // Print member IDs for reference
    inserted.forEach((m) => {
      console.log(`   - ${m.name} (${m.role}): ${m._id}`);
    });

    await mongoose.disconnect();
    console.log('👋 Done! Database seeded successfully.');
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
