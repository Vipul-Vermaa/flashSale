# Flash Sale Application.

## Overview

This Flash Sale Application is designed to manage a flash sale where items are sold in fixed quantities at a predetermined date and time. The sale lasts until all items are sold out. The application features functionalities for product management, order placement, and tracking, with a backend built using Node.js, Express.js, and MongoDB.


## Table of Contents

1. Prerequisites
2. Installation
3. Configuration
4. Running the Application
5. Cron Jobs
6. Troubleshooting


## Prerequisites

Before setting up the application, ensure you have the following installed:

1. Node.js (Version 14 or higher)
2. MongoDB (Local or Cloud instance)

## Installation

1. Clone the Repository:

```bash
git clone https://github.com/yourusername/flash-sale-app.git
cd flash-sale-app
```
2. Install Dependencies:
```bash
npm install
```
3. Set Up Environment Variables:
```bash
MONGO_URI=YOUR_MONGO_URI
PORT=4000
```

## Configuration
1. Database Setup:

Ensure MongoDB is running. You can use a local instance or a cloud-based MongoDB service.

2. Cron Job Configuration:

The application uses cron jobs to check and manage stock levels. The cron job configuration is handled in cron.js. You may need to adjust the schedule according to your requirements.

## Running the Application
1. Start the Server:
```bash
npm start
```
The server will start on port 4000 by default. You can change the port by modifying the PORT variable in your .env file,which has to be made in root directory.

2. Verify the Server:

Open your browser or API client and navigate to http://localhost:4000. You should see a response indicating that the server is running.

## Cron Jobs
The application includes a cron job to manage the sale end process. The cron job is configured to run every hour to check and update the sale status based on stock levels.

## Setting Up Cron Jobs
Cron jobs are configured using the node-cron library in the cron.js file. Ensure this file is executed as part of your application startup or deploy it as a separate service if needed.

## Troubleshooting
- Error Connecting to MongoDB:

Ensure that MongoDB is running and that the connection URI in .env is correctly set.

- API Endpoints Not Responding:

Check the server logs for any errors and ensure that all required environment variables are set.

- Cron Jobs Not Running:

Verify the cron job schedule and ensure that the cron.js script is running.