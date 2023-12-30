const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./src/routes/userRoutes');
const messageRoutes = require('./src/routes/messagesRoute');
const { Redis } = require('ioredis');
const { SocketService } = require('./src/services/socket');

const app = express();
require("dotenv").config();

app.use(cors({ credentials: true, origin: process.env.ORIGIN }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("DB connection successfull");
}).catch(err => {
  console.log("Error: ", err.message);
})
app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("Success");
})


const server = app.listen(process.env.PORT, () => {
  console.log(`Server started on Port: ${process.env.PORT}`)
});

const pub = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD
});
const sub = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD
});

const _io = SocketService();
_io.attach(server);
_io.on('connect', (socket) => {
  console.log(`New Socket Connected: ${socket.id}`);

  socket.on('event:message', async ({ message }) => {
    console.log(`New Message Rec: ${message}`);
    await pub.publish(process.env.REDIS_CHANNEL, JSON.stringify({ message }))
  })
});

sub.subscribe(process.env.REDIS_CHANNEL);

sub.on('message', async (channel, message) => {
  if (channel === process.env.REDIS_CHANNEL) {
    _io.emit('message', message);
  }
})
