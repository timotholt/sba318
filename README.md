# Game Lobby Application

A real-time game lobby system built with Node.js, Express, and MongoDB.

## Features

- User authentication (register/login)
- Real-time game lobby
- Create and join games
- MongoDB integration
- Security features

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Modern web browser

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment:
   - Copy `.env.example` to `.env`
   - Update MongoDB connection string
   ```
   MONGODB_URI=your_mongodb_connection_string
   MONGO_ADMIN_URL=your_mongodb_admin_url
   ```

## Running the Application

```bash
npm start
```

Server will start on port 3000 (or PORT from environment variables)

## Project Structure

```
├── config/
│   └── database.js     # MongoDB configuration
├── middleware/
│   └── validation.js   # Request validation
├── models/
│   ├── User.js         # User model
│   └── gameState.js    # Game state management
├── public/
│   ├── js/
│   │   ├── api.js      # API client
│   │   ├── app.js      # Main application logic
│   │   └── ui.js       # UI management
│   ├── index.html      # Main HTML
│   └── styles.css      # Styles
├── routes/
│   ├── lobby.js        # Game lobby routes
│   └── players.js      # User routes
└── server.js           # Express server setup
```

## Security Features

- Password hashing (bcrypt)
- Rate limiting
- MongoDB query sanitization
- Request size limiting
- Input validation
- Secure password storage

## API Documentation

### Authentication

#### Register User
```
POST /player/register
{
  "username": "string",
  "password": "string"
}
```

#### Login
```
POST /player/login
{
  "username": "string",
  "password": "string"
}
```

### Game Lobby

#### Get Games
```
GET /lobby
```

#### Create Game
```
POST /lobby
{
  "name": "string",
  "creator": "string"
}
```

#### Join Game
```
POST /lobby/:id/join
{
  "username": "string"
}
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License