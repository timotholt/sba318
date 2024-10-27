# SBA318 - Multiuser Chat Application

A real-time chat lobby system built with Node.js, Express, and a modular database system supporting both in-memory and MongoDB storage.  The original client code for this I
built for my SBA316 project but I learned after a full day of working on it that I wasn't
going to make it work on time and I bit off more than I can chew.  So my SBA316 didn't
end up what I wanted it to be.

Note: My internet was down at where I sleep so I made zip files as I worked, which is why there are million of check-ins with huge code changes over the span of an hour.

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

- The API is RESTFUL... the documentation can be found in api-reference.txt

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