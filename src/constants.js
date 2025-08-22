import dotenv from 'dotenv'
dotenv.config()
export const port = process.env.PORT
export const DB_NAME = 'LeadGate'
export const MONGO_URI = process.env.MONGO_URI
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
export const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET
export const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY
export const NODE_ENV = process.env.NODE_ENV
//BLA_API
export const BLA_API = {
  URL: process.env.BLA_URL,
  KEY: process.env.BLA_KEY
};