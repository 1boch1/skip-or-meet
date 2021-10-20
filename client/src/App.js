import React, { useContext } from "react";
import classes from "./App.module.css";

import { SocketContext } from "./Context.js";
import loading from "./loading.gif";

function App() {
  const { myVideo, userVideo, userVideoReady } = useContext(SocketContext);

  return (
    <>
      <div className={classes.title}>
        <span>skip</span>
        <span style={{ color: "#C02121" }}>or</span>
        <span>meet</span>
      </div>

      <section className={classes.gridvid}>
        <article className={classes.article} style={{ justifySelf: "center" }}>
          <p className={classes.names}>YOU</p>
          <video
            autoPlay
            className={classes.card}
            playsInline
            muted
            preload="auto"
            ref={myVideo}
          />
        </article>

        <article className={classes.article} style={{ justifySelf: "center" }}>
          <p className={classes.names}>STRANGER</p>

          {userVideoReady ? (
            <>
              <video
                autoPlay
                className={classes.card}
                playsInline
                preload="auto"
                ref={userVideo}
              />
              {/*<span className={classes.content}>
                If you see a white screen,{" "}
                <a
                  href=""
                  style={{
                    color: "red",
                    display: "inline",
                  }}
                >
                  click here
                </a>
                </span>*/}
            </>
          ) : (
            <img className={classes.card} src={loading} />
          )}

          <div align="center" style={{ justifySelf: "center" }}>
            <button
              className={classes.button}
              onClick={() => window.location.reload()}
            >
              SKIP
            </button>
          </div>
        </article>
      </section>
    </>
  );
}

export default App;
