import express from 'express';
import { config } from 'dotenv';
import ErrorMiddleware from './middlewares/Error.js'
import cookieParser from 'cookie-parser';
import cors from 'cors';

config({ path: './config.env' })

const app = express()

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors())

import user from './routes/userRoutes.js'
import product from './routes/productRoutes.js'
app.use('/api/v1', user)
app.use('/api/v1', product)

export default app

app.get("/", (req, res) =>
  res.send(
    `<h1> click <a href=${process.env.FRONTEND_URL}>here</a> to visit frontend.</h1>`
  )
);

app.use(ErrorMiddleware)