import dotenv from 'dotenv'
dotenv.config()
export const port = process.env.PORT
export const DB_NAME = 'LeadGate'
export const MONGO_URI = process.env.MONGO_URI