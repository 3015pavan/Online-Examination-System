# Backend - Online Examination System

Node.js + Express.js + MongoDB backend for the Online Examination System.

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Environment Setup
```bash
cp .env.example .env
```

Update `.env` with your configuration:
```
MONGO_URI=mongodb://localhost:27017/examination-system
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Running the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

### Seed Database
```bash
node scripts/seedData.js
```

## 📁 Project Structure

```
backend/
├── controllers/      # Request handlers
├── models/          # Mongoose schemas
├── routes/          # API endpoints
├── middlewares/     # Authentication, validation, error handling
├── config/          # Database and JWT config
├── utils/           # Helper functions
├── scripts/         # Database seed script
├── server.js        # Express app entry point
└── package.json
```

## 🔐 Authentication

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <accessToken>
```

## 🗄️ Models

### User Model
- Role-based (admin/student)
- Password hashing with bcrypt
- Email validation
- Account activation tracking

### Exam Model
- Exam configuration (duration, marks, questions)
- Student assignment
- Exam scheduling
- Passing marks tracking

### Question Model
- MCQ format with 4 options
- Correct answer and explanation
- Marks and negative marking per question
- Question numbering

### StudentExamResponse Model
- Response tracking for each student-exam pair
- Answer storage with correctness evaluation
- Score calculation with negative marking
- Detailed statistics (correct, incorrect, unattempted)

## 📊 Database

### Connection
```javascript
// Uses MongoDB Atlas or local MongoDB
MONGO_URI=mongodb://username:password@host:port/dbname
```

### Indexes
Compound index on StudentExamResponse (examId, studentId) ensures one response per student per exam.

## 🔌 API Health Check

```bash
curl http://localhost:5000/health
```

## 🧪 Testing

```bash
npm test
```

## 🚨 Error Handling

All errors are handled by centralized error middleware:
- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Server errors (500)

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT token generation
- **bcryptjs**: Password hashing
- **express-validator**: Input validation
- **dotenv**: Environment variables
- **cors**: Cross-origin requests
- **csv-writer**: CSV export functionality

## 🐛 Common Issues

### MongoDB Connection Error
Ensure MongoDB is running and MONGO_URI is correct.

### Port 5000 in Use
```bash
lsof -ti:5000 | xargs kill -9
```

### JWT Token Expired
Token automatically refreshed by frontend. For manual testing, use refresh-token endpoint.

## 📝 API Documentation

See main README.md for complete API documentation and examples.

---

**Backend built with ❤️ using Node.js & Express**
