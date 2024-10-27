I got the idea for this modular database engine when I was
in class wanting to build this game server, but not knowing
enough about MongoDb to make the server work.

So I started with storing everything in arrays, but
obviously using arrays was not going to be an easy
migration path to MongoDb when I finally learned it. In
fact a few hours into building the server (and hard coding
arrays into the server code), it was apparent it was a
a future nightmare.

Thus the idea of a modular database engine was born.

This server uses a modular system for storing data, by having
seperate database "engines" (really adapters) that are selected
by the .env file at server start.

InMemoryDbEngine.js is an in-memory database implementation that
only lasts as long as the server is running. As soon as the
server is stopped, the database is gone. (Best for development)

MongoDbEngine.js is a real mongoDB implementation that writes to
the mongoDb database stored in .env. Best for live server use.

To add a new database engine (such as firebase, localstorage,
etc):

1. Make a new file (i.e. localStorage.js)
2. Import and inherit from the BaseDbEngine class
3. Implemenent the methods for your I/O method.
4. Add the appropriate 3 lines of code in selectDbEngine.js and
   change the .env file so database.js find it.

Tim Otholt
10/24/2024
