import app from './app.js';
import { connectDB } from './config/Database.js';
import './utils/cron.js';

connectDB()

const PORT = process.env.PORT || 4000;

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})