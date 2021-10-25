# Skip Or Meet

Video chat application that allows you to meet new friends.

## Libraries

- [React](https://it.reactjs.org/)
- [PeerJS ](https://peerjs.com/)
- [Express](https://expressjs.com/)
- [Socket.io](https://socket.io/)


## Preview

![skipormeet](https://user-images.githubusercontent.com/69087218/133236799-94f388da-7197-4a13-ac31-db5c5992ae66.png)

![skipormeet-mobile](https://user-images.githubusercontent.com/69087218/133236818-c0bb9c37-9148-49e0-a693-ac350116dbb5.png)

## Project setup

- #### Install the dependencies running this command in ./ and ./client

  ### `npm install`

- #### Start the Express server running this command in ./ (using nodemon)

  ### `nodemon server.js`

  > Open [http://localhost:5000](http://localhost:5000) to view it in the browser.

- #### Start the PeerJs server running this command in ./

  ### `peerjs --port 3001`

- #### Start the React app running this command in ./client

  ### `npm start`

  > Open [http://localhost:3000](http://localhost:3000) to view it in the browser.



## Explanation

- The client opens the website and connects to the Express server

  ```javascript
  const socket = io("https://localhost:5000");
  ```

- The browser asks for audio and video permissions

  ```javascript
  navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((currentStream) => {
  ```

- The client creates a PeerJS instance, a signaling server assign a peerID to it triggering .on("open") that emits a "wantToJoin" message to the Express server

    ```javascript
    myPeer = new Peer(undefined, {
          host: "localhost",
          port: 3001,
          path: "/",
        });

        myPeer.on("open", (peerID) => {
          socket.emit("wantToJoin", peerID);
        });
    ```
    
- The Express server receives the "wantToJoin" message and decides
  - If there are no available socket.io rooms it creates one, adds the client, puts the room in a queue of available rooms and waits
  - If there is an available room, so if there is a user alone in a room waiting to connect with another user, the server joins the client to that room, makes the room unavailable and then sends to the user already in the room a "new member" message with the peer id of the new member

    ```javascript
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
    ```    
    
    
- The other client receives the "new_member" message with the new user peer id and starts a P2P call

  ```javascript
         socket.on("new_member", (strangerPeerID) => {
          const call = myPeer.call(strangerPeerID, currentStream);

          call.on("stream", (userVideoStream) => {
            setUserVideoReady(() => true);
            userVideo.current.srcObject = userVideoStream;
          });

          //If the call closes

          call.on("close", () => {
            setUserVideoReady(() => false);

            setUserVideoReady(() => false);
            window.location.reload();
          });

          peers[strangerPeerID] = call;
        });
  ```

- When the first client receives the call, the video WebRTC stream starts

  ```javascript
         myPeer.on("call", (call) => {
          call.answer(currentStream);

          call.on("stream", (userVideoStream) => {
            setUserVideoReady(() => true);
            userVideo.current.srcObject = userVideoStream;
          });
        });
  ```
