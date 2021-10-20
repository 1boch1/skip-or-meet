import React, { createContext, useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import Peer from "peerjs";

const SocketContext = createContext();

//Connects to the server

const socket = io("https://localhost:5000");

//logic

const ContextProvider = ({ children }) => {
  //Variables

  const myVideo = useRef();
  const userVideo = useRef();

  const [userVideoReady, setUserVideoReady] = useState(false);

  var myPeer = null;

  var peers = {};

  useEffect(() => {
    //I get the video and audio stream from the webcam

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        myVideo.current.srcObject = currentStream;

        //When the signaling server creates a peer ID,
        //send to the express server the peer asking to
        //be added in a room (as host or new member)

        myPeer = new Peer(undefined, {
          host: "localhost",
          port: 3001,
          path: "/",
        });

        /*myPeer = new Peer(undefined, {
          host: "",
          secure: true,
          port: 443,
        });*/

        myPeer.on("open", (peerID) => {
          socket.emit("wantToJoin", peerID);
        });

        //For the "host" member of the room

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

        //For the member that enters an existing room

        myPeer.on("call", (call) => {
          call.answer(currentStream);

          call.on("stream", (userVideoStream) => {
            setUserVideoReady(() => true);
            userVideo.current.srcObject = userVideoStream;
          });
        });

        //If a user disconnect

        socket.on("user-disconnected", (peerID) => {
          if (peers[peerID]) peers[peerID].close();

          setUserVideoReady(() => false);
          window.location.reload();
        });
      });
  }, []);

  return (
    <>
      <SocketContext.Provider value={{ myVideo, userVideo, userVideoReady }}>
        {children}
      </SocketContext.Provider>
    </>
  );
};

export { ContextProvider, SocketContext };
