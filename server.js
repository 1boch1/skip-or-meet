const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

app.use(cors());

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

/*
const fs = require("fs");
const { peerServer } = require("peer").ExpressPeerServer;

var options = {
  debug: true,
  allow_discovery: true,
};

let peerServer = ExpressPeerServer(server, options);

app.use("/peerjs", peerServer);
*/

//logic

var available_rooms = [];

app.get("/", (req, res) => {
  res.send("Server Running");
});

//When a user connects

io.on("connection", (socket) => {
  //Leaves the default room

  socket.leave(socket.id, () => {});

  //Listen for a user (with a peerID) that
  //wants to join a room

  let room = null;

  socket.on("wantToJoin", (peerID) => {
    //If there is a room with a place left

    if (available_rooms.length > 0) {
      //Get a room from the queue, removing it
      //from the list

      let available_room = available_rooms.shift();

      //Join the room and send to the host a "new_member"

      socket.to(available_room).emit("new_member", peerID);
      socket.join(available_room, () => {});

      room = available_room;
    }

    //If the server must create a new room
    else {
      //Creates a new room and set the user
      //as host

      let new_room = uuidv4();

      available_rooms.push(new_room);

      socket.join(new_room, () => {});

      room = new_room;
    }

    //On socket disconnection

    socket.on("disconnect", () => {
      socket.to(room).emit("user-disconnected", peerID);

      available_rooms = available_rooms.filter((roomID) => roomID != room);
    });
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
