# Frontend - Online Examination System

React.js + TailwindCSS frontend for the Online Examination System.

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Environment Setup
```bash
cp .env.example .env
```

Update `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NODE_ENV=development
```

### Running the Application

**Development:**
```bash
npm start
```

Opens at http://localhost:3000

**Production Build:**
```bash
npm run build
serve -s build
```

## 📁 Project Structure

```
src/
├── pages/
│   ├── Login.jsx                 # Login page
│   ├── Register.jsx              # Registration page
│   ├── StudentDashboard.jsx       # Student home
│   ├── ExamInstructions.jsx       # Exam instructions
│   ├── ExamPage.jsx               # Exam taking interface
│   ├── ResultPage.jsx             # Result display
│   └── admin/
│       ├── AdminDashboard.jsx     # Admin home
│       ├── StudentsManagement.jsx # CRUD students
│       ├── ExamsManagement.jsx    # CRUD exams
│       ├── QuestionsManagement.jsx# Manage questions
│       └── ResultsManagement.jsx  # View results
├── components/
│   ├── PrivateRoute.jsx           # Protected routes
│   ├── AdminRoute.jsx             # Admin-only routes
│   ├── StudentRoute.jsx           # Student-only routes
│   ├── Navbar.jsx                 # Top navigation
│   ├── Sidebar.jsx                # Side navigation
│   ├── ExamTimer.jsx              # Countdown timer
│   └── StatCard.jsx               # Statistics card
├── context/
│   └── authStore.js               # Zustand auth store
├── services/
│   ├── axios.js                   # HTTP client with interceptors
│   └── api.js                     # API service functions
├── styles/
│   └── index.css                  # Global styles
├── App.jsx                        # Main app component
└── index.js                       # Entry point
```

## 🎨 UI Features

### Responsive Design
- Mobile, tablet, and desktop layouts
- TailwindCSS utility classes
- Flexible grid system

### Color Scheme
- Primary: Blue (#3b82f6)
- Success: Green (#10b981)
- Danger: Red (#ef4444)
- Warning: Yellow (#f59e0b)

### Components
- Exam timer with low-time alert
- Progress bars
- Status badges
- Statistics cards
- Form validation

## 🔐 Authentication

### Token Management
- Access tokens stored in localStorage
- Refresh token auto-refresh
- Automatic logout on token expiry

### Role-Based Access
- Admin routes for administrators
- Student routes for students
- Public routes for login/register

## 📡 API Integration

### Axios Interceptors
- Automatic token injection
- Token refresh on 401
- Error handling

### State Management
- Zustand for lightweight auth state
- No context API overhead
- Easy to extend for additional stores

## 🎯 Key Features

### Student Features
- ✅ Exam dashboard
- ✅ Real-time timer
- ✅ Auto-save answers
- ✅ Question navigation
- ✅ Immediate results
- ✅ Detailed analysis

### Admin Features
- ✅ Student CRUD
- ✅ Exam CRUD
- ✅ Question management
- ✅ Results download
- ✅ Statistics dashboard
- ✅ Bulk operations

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm start

# Create production build
npm run build

# Run tests
npm test

# Eject configuration (⚠️ irreversible)
npm eject
```

### Code Style
- ES6+ syntax
- Functional components with hooks
- Component-based architecture

## 📦 Dependencies

### Core
- **react**: UI library
- **react-dom**: DOM rendering
- **react-router-dom**: Client routing

### State & HTTP
- **zustand**: State management
- **axios**: HTTP client

### Styling
- **tailwindcss**: Utility CSS
- **react-icons**: Icon library

### Utilities
- **react-hot-toast**: Notifications
- **date-fns**: Date manipulation

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🚀 Deployment

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Drag build folder to Netlify
```

### Docker
```bash
docker build -t exam-frontend .
docker run -p 3000:3000 exam-frontend
```

## 🐛 Troubleshooting

### Blank Page
- Check browser console for errors
- Clear cache and reload
- Verify API URL in .env

### API Connection Issues
- Ensure backend is running on :5000
- Check REACT_APP_API_URL in .env
- Check CORS settings on backend

### State Not Persisting
- Check browser's localStorage support
- Verify JSON serialization of state

## 📝 Component Examples

### Creating a Protected Route
```jsx
<AdminRoute>
  <AdminDashboard />
</AdminRoute>
```

### Using Auth Store
```jsx
const { user, login, logout } = useAuthStore();
```

### API Call Example
```jsx
const { data } = await examService.getAllExams();
```

---

**Frontend built with ❤️ using React & TailwindCSS**
