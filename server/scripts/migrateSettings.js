import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/invest-tracker');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('settings');

    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));

    const oldIndex = indexes.find(i => i.name === 'key_1');
    if (oldIndex) {
      await collection.dropIndex('key_1');
      console.log('Dropped old index: key_1');
    }

    await collection.deleteMany({});
    console.log('Cleared old settings data');

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
