



# SBA318 - Real-time Chat Lobby Application

A real-time chat lobby system built with Node.js, Express, and a modular database system supporting both in-memory and MongoDB storage (MongoDB part doesn't work actually).

| Requirement | Weight | Completed |
| :--- | :---: | :---: |
| Create and use at least two pieces of custom middleware. | 5% | ✅ |
| Create and use error-handling middleware. | 5% | ✅ |
| Use at least three different data categories (e.g., users, posts, or comments). | 5% | ✅ |
| Utilize reasonable data structuring practices. | 5% | ✅ |
| Create GET routes for all data that should be exposed to the client. | 5% | ✅ |
| Create POST routes for data, as appropriate. At least one data category should allow for client creation via a POST request. | 5% | ✅ |
| Create PATCH or PUT routes for data, as appropriate. At least one data category should allow for client manipulation via a PATCH or PUT request. | 5% | ✅ |
| Create DELETE routes for data, as appropriate. At least one data category should allow for client deletion via a DELETE request. | 5% | ✅ |
| Include query parameters for data filtering, where appropriate. At least one data category should allow for additional filtering through the use of query parameters. | 5% | ✅ |
| Note: DO NOT use API keys; this makes it more difficult for instructors to grade finished projects efficiently. | 5% | ✅ |
| Utilize route parameters, where appropriate. | 5% | ✅ |
| Adhere to the guiding principles of REST. | 10% | ✅ |
| Create and render at least one view using a view template and template engine. This can be a custom template engine or a third-party engine. | 8% | ✅ |
| Use simple CSS to style the rendered views. | 2% | ✅ |
| Note: This is not a test of design; it is a test of serving static files using Express. The CSS can be very simple. | 2% | ✅ |
| Include a form within a rendered view that allows for interaction with your RESTful API. | 3%  | ✅ |
| Utilize reasonable code organization practices. | 5% | ✅ |
| Ensure that the program runs without errors (comment out things that do not work, and explain your blockers - you can still receive partial credit). | 10% | ✅ |
| Commit frequently to the git repository. | 5% | ✅ |
| Include a README file that contains a description of your application. | 2% | ✅ |
| Level of effort displayed in creativity, presentation, and user experience | 5% | ✅ |


## Launching the app:

nodemon 

## STUFF THAT IS BROKEN

- If the server is not running, index.html breaks badly.


## Features

- User authentication (register/login)
- Real-time lobby
- Create and join chat rooms with player limits
- Nickname support for players
- Modular database system (in-memory or MongoDB - again, which doesn't work yet)
- Security features (sorta, it's middleware and if you run the server too long it disconects)

## Chat Room Features

- Create rooms with customizable player limits (1-4 players)
- Join/leave chat rooms
- Real-time player list updates
- Nickname display for all players
- You can password protect a room

## API Documentation

- The API is RESTFUL... the documentation can be found in api-reference.txt

## Database System

The application uses a modular database system that supports:
- In-memory storage (development)
- MongoDB (doesn't work yet!)
- Extensible for other database types

To add a new database engine:
1. Create new engine file in `database/`
2. Extend `BaseDbEngine`
3. Implement required methods
4. Add to `selectDbEngine.js`
5. Update DB_TYPE in `.env`

