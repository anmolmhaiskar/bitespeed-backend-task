# Contact Reconciliation Assignment

## EndPoint

    [Contact Reconciliation](https://bitespeed-backend-task-83rk.onrender.com)

This project is an Express TypeScript application using Prisma to handle contact reconciliation. It processes contact data based on email and phone numbers, ensuring data integrity and consistency.

## Description

The Contact Reconciliation Assignment handles identifying and creating contacts based on email and phone number inputs. It manages primary and secondary contacts, ensuring that data is consistent and appropriately linked. The service supports merging contacts and updating linked contacts when duplicates are identified.

## Getting Started

### Dependencies

- Node.js v14+
- PostgreSQL
- npm

### Installing

1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/contact-reconciliation.git
   cd contact-reconciliation
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Set up the environment variables:
   Create a .env file in the root directory and add your database connection url.
   eg:
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
   ```
4. Initialize Prisma:
   ```
   npx prisma migrate dev --name init
   ```

### Executing program

Start the application:
`   npm run dev
  `

### How to Send Requests to API Endpoint

#### Using Postman

= Open Postman and create a new POST request.

- Set the URL to http://localhost:3000/identify.
- In the Body tab, select raw and set the format to JSON.
- Add the following JSON data:

```
{
  "email": "example@example.com",
  "phoneNumber": "1234567890"
}
```

- Click Send.

#### Using cURL

```
curl -X POST http://localhost:3000/identify \
-H "Content-Type: application/json" \
-d '{
  "email": "example@example.com",
  "phoneNumber": "1234567890"
}'
```

#### Response:

```
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["example@example.com", "another@example.com"],
    "phoneNumbers": ["1234567890", "0987654321"],
    "secondaryContactIds": [2, 3]
  }
}
```

For more information about the input and output, you can refer to the [detailed assignment information.](https://drive.google.com/file/d/1m57CORq21t0T4EObYu2NqSWBVIP4uwxO/view)
