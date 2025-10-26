# Secure Finance Tracker

A full-stack, end-to-end encrypted financial tracking application with advanced data visualization and AI-powered anomaly detection for unusual spending patterns.

## Features

### Security & Privacy
- **End-to-End Encryption**: All financial data is encrypted client-side using AES-256-GCM before being sent to the server
- **Zero-Knowledge Architecture**: Server never has access to your decryption keys or unencrypted data
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing (12 rounds)
- **Password-Based Key Derivation**: PBKDF2 with 100,000 iterations for encryption key generation
- **Rate Limiting**: Protection against brute-force attacks
- **Security Headers**: Helmet.js for enhanced HTTP security

### Financial Tracking
- **Transaction Management**: Add, edit, and delete financial transactions
- **Category Organization**: Organize expenses by customizable categories
- **Date Range Filtering**: View transactions for specific time periods
- **Search Functionality**: Quick search through transaction descriptions and merchants

### Data Visualization
- **Interactive Dashboard**: Beautiful charts and graphs powered by Recharts
- **Spending Trends**: Daily and monthly spending visualizations
- **Category Breakdown**: Pie charts showing spending distribution
- **Historical Analysis**: Track spending patterns over time
- **Summary Statistics**: Total spent, average transaction, and trend indicators

### Anomaly Detection
- **Statistical Analysis**: Z-score based anomaly detection algorithm
- **Multiple Detection Types**:
  - Unusual transaction amounts
  - Large transactions
  - Spending spikes
  - Category-specific anomalies
  - Frequency anomalies
- **Severity Levels**: Low, medium, and high severity classifications
- **Real-time Alerts**: Visual alerts for detected anomalies
- **Acknowledgement System**: Mark anomalies as reviewed

## Technology Stack

### Backend
- **Node.js** with **Express.js** - RESTful API server
- **TypeScript** - Type-safe backend code
- **SQLite** with **better-sqlite3** - Lightweight, fast database
- **bcrypt** - Secure password hashing
- **jsonwebtoken** - JWT authentication
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting middleware
- **Zod** - Runtime type validation

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe frontend code
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization library
- **Axios** - HTTP client
- **Lucide React** - Beautiful icon set
- **date-fns** - Date manipulation library

### Encryption
- **Web Crypto API** - Browser-native cryptography
- **AES-GCM** - Authenticated encryption (256-bit keys)
- **PBKDF2** - Key derivation function

## Project Structure

```
SecureFinance/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Express middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utility functions (JWT, anomaly detection)
│   │   ├── database.ts      # Database initialization
│   │   └── server.ts        # Express server setup
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions (encryption)
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Application entry point
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd SecureFinance
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and set your configuration
# IMPORTANT: Change JWT_SECRET to a strong random string in production!

# Start development server
npm run dev
```

The backend will start on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. Access the Application

Open your browser and navigate to `http://localhost:5173`

## Environment Variables

### Backend (.env)

```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
NODE_ENV=development
DATABASE_PATH=./data/finance.db
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**IMPORTANT**: Always use strong, randomly generated secrets in production!

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Transaction Endpoints

#### Create Transaction
```http
POST /api/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "encrypted_data": "base64-encrypted-data",
  "iv": "base64-initialization-vector",
  "category": "Food & Dining",
  "amount_encrypted": "base64-encrypted-amount",
  "date": "2024-01-15"
}
```

#### Get All Transactions
```http
GET /api/transactions?start_date=2024-01-01&end_date=2024-12-31
Authorization: Bearer <token>
```

#### Update Transaction
```http
PUT /api/transactions/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "encrypted_data": "base64-encrypted-data",
  "iv": "base64-initialization-vector",
  "category": "Shopping",
  "amount_encrypted": "base64-encrypted-amount",
  "date": "2024-01-15"
}
```

#### Delete Transaction
```http
DELETE /api/transactions/:id
Authorization: Bearer <token>
```

### Anomaly Endpoints

#### Get Anomalies
```http
GET /api/anomalies?limit=50
Authorization: Bearer <token>
```

#### Get Unacknowledged Anomalies
```http
GET /api/anomalies/unacknowledged
Authorization: Bearer <token>
```

#### Acknowledge Anomaly
```http
PATCH /api/anomalies/:id/acknowledge
Authorization: Bearer <token>
```

## Security Features Explained

### End-to-End Encryption Flow

1. **User Registration**:
   - User provides email and password
   - Password is hashed with bcrypt (12 rounds) and stored in database
   - A random salt is generated for encryption key derivation
   - Salt is stored locally in browser (never sent to server)

2. **Encryption Key Derivation**:
   - User's password + salt → PBKDF2 (100,000 iterations) → AES-256 key
   - This key exists only in browser memory and is never transmitted

3. **Data Encryption**:
   - When adding a transaction, data is encrypted client-side
   - Random IV (Initialization Vector) generated for each encryption
   - Encrypted data + IV sent to server
   - Server stores encrypted data without ability to decrypt

4. **Data Decryption**:
   - When fetching transactions, encrypted data is retrieved from server
   - Data is decrypted client-side using the user's derived key
   - Decrypted data displayed in UI

### Password Security
- **Never Stored**: Your actual password is never stored anywhere
- **Cannot Be Recovered**: If you forget your password, your encrypted data cannot be recovered
- **Hashed with bcrypt**: Server only stores bcrypt hashes for authentication
- **Used for Encryption**: Password derives your encryption key via PBKDF2

### Anomaly Detection Algorithm

The system uses statistical analysis to detect unusual spending:

1. **Z-Score Analysis**: Compares each transaction against historical mean and standard deviation
2. **Thresholds**: Transactions beyond 2.5σ are flagged as anomalies
3. **Category-Specific**: Analyzes patterns within each spending category
4. **Temporal Analysis**: Detects spending spikes over time periods
5. **Severity Classification**:
   - **Low**: 2.5σ - 3σ deviation
   - **Medium**: 3σ - 4σ deviation
   - **High**: >4σ deviation

## Production Deployment

### Security Checklist

- [ ] Change `JWT_SECRET` to a strong random string (at least 32 characters)
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS for all communications
- [ ] Set appropriate CORS origins
- [ ] Configure rate limiting based on your traffic
- [ ] Regular database backups
- [ ] Monitor for security updates in dependencies
- [ ] Implement proper logging and monitoring

### Build for Production

Backend:
```bash
cd backend
npm run build
npm start
```

Frontend:
```bash
cd frontend
npm run build
# Serve the 'dist' folder with a static file server
```

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Security Considerations

### What This App Protects Against
- Data breaches (encrypted data is useless without user's password)
- Server-side attacks (server cannot decrypt your data)
- Man-in-the-middle attacks (when using HTTPS)
- Password database leaks (passwords are hashed with bcrypt)

### What This App Does NOT Protect Against
- Keyloggers on your device
- Compromised client devices
- Phishing attacks
- Forgotten passwords (data cannot be recovered)

### Best Practices
- Use a strong, unique password
- Enable HTTPS in production
- Keep your password safe and never share it
- Regularly update dependencies
- Use a password manager

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with security and privacy in mind.**
