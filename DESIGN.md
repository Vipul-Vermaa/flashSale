# Flash Sale Application

This document outlines the assumptions, system design, implementation details, and other key decisions made during the development of the Flash Sale Application.

## 1. Assumptions

- **Sale Timing:** The sale begins at a fixed date and time, such as 12:00 AM on Sunday.
- **Inventory:** The products have fixed quantities. Once the sale starts, the items are sold until the stock is depleted.
- **Concurrency:** Multiple users can attempt to purchase items simultaneously, so the system needs to handle high traffic and ensure fairness.
- **User Authentication:** Only authenticated users can participate in the sale.
- **No Reservations:** There is no reservation system; items are sold on a first-come, first-served basis.

## 2. System Design

### Architecture
- **Backend:** 
  - Built with Node.js and Express.js for creating RESTful APIs.
  - MongoDB is used as the database for storing user data and product inventory.

- **Caching:** 
  - A caching mechanism is used to store frequently accessed data, reducing the load on the database.

### Database Design
- **User Model:** 
  - Includes fields such as `name`, `email`, and `password`, as well as tracking each user's purchase history.
- **Product Model:** 
  - Includes fields like `name`, `price`, `availableUnits`, and `soldUnits`.
- **Order Model:** 
  - Tracks each sale transaction, including the user who made the purchase, the product purchased, quantity, and timestamp.

### API Design
- **/register:** Endpoint for user registration.
- **/login:** Endpoint for user authentication.
- **/getallproducts:** Endpoint to retrieve all available products for the sale.
- **/placeorder:** Endpoint to handle purchase transactions, update product inventory, and user purchase history.

### Concurrency Handling
- **Atomic Transactions:** 
  - Ensures each purchase request is processed as a single transaction, preventing overselling.


## 3. Implementation

### API Implementation
- All endpoints are implemented using Express.js.
- MongoDB, in conjunction with Mongoose, is used for database operations.
- Sale end time is  managed via cron jobs or a similar scheduler.
- Result of api is present in assets folder.

### Performance Optimization
- **Caching:** Memcached is implemented to reduce database load.
- **Pagination:** Used for product listings to optimize data retrieval and reduce response times.
- **Load Testing:** Artillery is used to load test the system, identify bottlenecks, and optimize performance.

### Error Handling
- Proper error handling and logging mechanisms are implemented to track and resolve issues.
- Rate limiting is used to prevent abuse of the system and ensure stability during high traffic.

## 4. Other Choices


### Security
- Sensitive data, such as passwords, are encrypted.
- Security measures, including protection against SQL injection and XSS attacks, are in place.

### Testing
- The system is tested using Jest for unit testing and Artillery for stress testing to ensure reliability under load.

## Conclusion

This Flash Sale Application is designed to handle high traffic and ensure fairness in sales, with careful consideration given to concurrency, performance, and security. The architecture is scalable, allowing it to handle the demands of a real-world flash sale scenario.