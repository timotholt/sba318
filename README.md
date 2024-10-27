# Game Lobby Application

A real-time game lobby system built with Node.js, Express, and a modular database system supporting both in-memory and MongoDB storage.

## Features

- User authentication (register/login)
- Real-time game lobby
- Create and join games with player limits
- Nickname support for all players
- Modular database system (in-memory or MongoDB)
- Security features

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (optional - only if using MongoDB)
- Modern web browser

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment:
   - Copy `.env.example` to `.env`
   - Choose database type (memory or mongodb)
   - If using MongoDB, update connection string
   ```
   DB_TYPE=memory        # Use 'mongodb' for MongoDB
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
├── database/
│   ├── BaseDbEngine.js     # Base database engine interface
│   ├── InMemoryDbEngine.js # In-memory database implementation
│   ├── MongoDbEngine.js    # MongoDB database implementation
│   ├── database.js         # Database connection manager
│   └── selectDbEngine.js   # Database engine factory
├── middleware/
│   └── validation.js       # Request validation
├── models/
│   ├── User.js            # User model
│   └── GameState.js       # Game state model
├── public/
│   ├── js/
│   │   ├── api.js         # API client
│   │   ├── app.js         # Main application logic
│   │   └── ui.js          # UI management
│   ├── index.html         # Main HTML
│   └── styles.css         # Styles
├── routes/
│   ├── lobby.js           # Game lobby routes
│   └── users.js          # User routes
└── server.js              # Express server setup
```

## Game Features

- Create games with customizable player limits (1-4 players)
- Join/leave games
- Real-time player list updates
- Nickname display for all players
- Game creator controls

## API Documentation

### Authentication

#### Register User
```
POST /user/register
{
  "username": "string",
  "password": "string",
  "nickname": "string" (optional)
}
```

#### Login
```
POST /user/login
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
  "creator": "string",
  "maxPlayers": number (1-4)
}
```

#### Join Game
```
POST /lobby/:id/join
{
  "username": "string"
}
```

#### Leave Game
```
POST /lobby/:id/leave
{
  "username": "string"
}
```

#### Delete Game
```
DELETE /lobby/:id?username=string
```

## Database System

The application uses a modular database system that supports:
- In-memory storage (development)
- MongoDB (production)
- Extensible for other database types

To add a new database engine:
1. Create new engine file in `database/`
2. Extend `BaseDbEngine`
3. Implement required methods
4. Add to `selectDbEngine.js`
5. Update DB_TYPE in `.env`

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License