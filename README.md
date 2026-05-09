# Smart Automatic Gate System - Backend

Group 052 | IT1140 | FC | SLIIT

---

## Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcryptjs

---

## Project Structure

```
project-root/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── cardController.js
│   │   ├── clientController.js
│   │   └── parkingController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Card.js
│   │   ├── Client.js
│   │   ├── ParkingLog.js
│   │   ├── ParkingSlot.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── cardRoutes.js
│   │   ├── clientRoutes.js
│   │   └── parkingRoutes.js
│   └── server.js
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---
## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |

### Clients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/clients | Get all clients |
| GET | /api/clients/:id | Get single client |
| POST | /api/clients | Create client |
| PUT | /api/clients/:id | Update client |
| DELETE | /api/clients/:id | Delete client |

### Cards
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/cards | Get all cards |
| GET | /api/cards/:cardId | Get single card |
| POST | /api/cards | Create card |
| PUT | /api/cards/:cardId/topup | Top up balance |
| PUT | /api/cards/:cardId/deactivate | Deactivate card |

### Parking
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/parking/slots | Get all slots |
| GET | /api/parking/logs | Get all logs |
| POST | /api/parking/entry | Handle entry |
| POST | /api/parking/exit | Handle exit |

---

## Hardware Integration

ESP32 communicates with this backend via WiFi using HTTP requests to the parking entry and exit endpoints.
