import { MongoClient } from 'mongodb';
import { config } from '../config/env.config';
import { logger } from '../utils/logger.util';

const client = new MongoClient(config.MONGO_URI);
let db: any;

export async function connectDB() {
    if (!db) {
        await client.connect();
        db = client.db('crypto-bot');
        logger.info('Connected to MongoDB');
    }
    return db;
}

export async function logAction(status: 'pending' | 'approved' | 'rejected', text: string, tickers: string[]) {
    const database = await connectDB();
    const collection = database.collection('actions_log');
    
    const result = await collection.insertOne({
        account_id: config.ACCOUNT_ID,
        status,
        content_text: text,
        tickers,
        timestamp: new Date().toISOString()
    });
    
    return result.insertedId.toString();
}

export async function updateActionStatus(id: string, newStatus: 'approved' | 'rejected') {
    const database = await connectDB();
    const collection = database.collection('actions_log');
    const { ObjectId } = require('mongodb');
    
    await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: newStatus, updated_at: new Date().toISOString() } }
    );
}
