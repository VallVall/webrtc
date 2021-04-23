import React from "react";

import { v4 as uuid } from "uuid";

import {
  Select,
  MenuItem,
  Grid,
  Box,
  Button,
  Paper,
  Typography,
  Badge,
  TextField,
  IconButton,
} from "@material-ui/core";
import "webrtc-adapter";

import { PEER } from "./config/peer";
import { socket } from "./config/socket";
import { MESSAGE } from "./constants";

const buttonProps = {
  variant: "contained",
  color: "primary",
};

const CustomSelect = ({ options, label }) => {
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    if (options.length === 1) {
      const [{ deviceId }] = options;

      setValue(deviceId);
      return;
    }

    const [{ deviceId }] = options.filter(
      ({ deviceId }) => deviceId === "default"
    );

    setValue(deviceId);
  }, [options.length]);

  return (
    <Select
      value={value}
      displayEmpty
      fullWidth
      label={label}
      variant="outlined"
    >
      <MenuItem value="" disabled>
        Select device
      </MenuItem>
      {options.map(({ deviceId, label }) => (
        <MenuItem key={deviceId} value={deviceId}>
          {label}
        </MenuItem>
      ))}
    </Select>
  );
};

const peer = new RTCPeerConnection(PEER.CONFIG);

const usePeer = () => {
  const videoRef = React.useRef(null);
  const remoteVideoRef = React.useRef(null);

  const recipientRef = React.useRef(null);

  const [senderName, setSenderName] = React.useState(
    `${uuid().slice(0, 4)}@${uuid().slice(0, 4)}`
  );
  const [recipientName, setRecipientName] = React.useState("");
  const [localeStream, setLocaleStream] = React.useState(null);

  const [videoDevices, setVideoDevices] = React.useState([]);
  const [microphoneDevices, setMicrophoneDevices] = React.useState([]);
  const [volumeDevices, setVolumeDevices] = React.useState([]);

  const [joinedUsers, setJoinedUsers] = React.useState([]);

  const handleConnectToMediaStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    setLocaleStream(stream);

    if (!videoRef.current) return;

    stream.getTracks().forEach((track) => {
      peer.addTrack(track, stream);
    });

    videoRef.current.srcObject = stream;
  };

  // const handleConnectToDevices = async () => {
  //   const devices = await navigator.mediaDevices.enumerateDevices();

  //   const microphones = devices.filter(({ kind }) => kind === "audioinput");
  //   const volumes = devices.filter(({ kind }) => kind === "audiooutput");
  //   const videos = devices.filter(({ kind }) => kind === "videoinput");

  //   setVideoDevices(videos);
  //   setVolumeDevices(volumes);
  //   setMicrophoneDevices(microphones);

  //   handleConnectToMediaStream();
  // };

  // const handleCInitPeer = () => {
  //   const peerInit = new RTCPeerConnection(PEER.CONFIG);

  //   setPeer(peerInit);
  // };

  const handleCall = async () => {
    // console.log("Create offer...");
    const sdpOffer = await peer.createOffer({ offerToReceiveVideo: true });

    // console.log("Set local offer...", sdpOffer);
    await peer.setLocalDescription(sdpOffer);

    const message = {
      type: MESSAGE.TYPE.WEBRTC_OFFER,
      data: sdpOffer,
      sender: senderName,
      recipient: recipientName,
    };

    recipientRef.current = recipientName;

    // console.log("Send offer...");
    socket.send(JSON.stringify(message));
  };

  const handleJoinLobby = () => {
    const message = {
      type: MESSAGE.TYPE.JOIN_LOBBY,
      data: "",
      sender: senderName,
      recipient: "",
    };

    socket.send(JSON.stringify(message));
  };

  const handleSelectRecipient = (newRecipientName) =>
    setRecipientName(newRecipientName);

  // const handleInitListenersForDevices = () => {
  //   navigator.mediaDevices.addEventListener(
  //     "devicechange",
  //     handleConnectToDevices
  //   );
  // };

  const handleInitListenersForPeer = () => {
    peer.addEventListener("icecandidate", ({ candidate }) => {
      if (candidate) {
        const message = {
          type: MESSAGE.TYPE.ICE_CANDIDATE,
          data: candidate,
          sender: senderName,
          recipient: recipientRef.current,
        };

        // console.log("send ice candidate", message);
        socket.send(JSON.stringify(message));
      }
    });

    // peer.addEventListener("iceconnectionstatechange", (event) => {
    //   console.log("iceconnectionstatechange event", event);
    // });

    peer.addEventListener("track", ({ streams }) => {
      if (!remoteVideoRef.current) return;

      const [stream] = streams;

      if (remoteVideoRef.current.srcObject === stream) return;

      // console.log("got remote stream");

      remoteVideoRef.current.srcObject = stream;
    });
  };

  const handleChangeSenderName = (event) => setSenderName(event.target.value);

  React.useEffect(() => {
    // handleCInitPeer();
    handleInitListenersForPeer();
    handleConnectToMediaStream();
    // handleConnectToDevices();
    // handleInitListenersForDevices();

    socket.addEventListener("message", async (message) => {
      const { type, data, sender, recipient } = JSON.parse(message.data);

      // console.log("Got new message", data);

      if (type === MESSAGE.TYPE.PEER_LIST_CHANGED) {
        setJoinedUsers(data.users);
      }

      if (type === MESSAGE.TYPE.WEBRTC_OFFER && sender !== senderName) {
        recipientRef.current = sender;
        // console.log("Save remote offer...", data);
        await peer.setRemoteDescription(data);

        // console.log("Create answer");
        const sdpAnswer = await peer.createAnswer();

        // console.log("Set local answer...", sdpAnswer);
        await peer.setLocalDescription(sdpAnswer);

        // console.log("Send answer");
        const message = {
          type: MESSAGE.TYPE.WEBRTC_ANSWER,
          data: sdpAnswer,
          sender: recipient,
          recipient: sender,
        };
        socket.send(JSON.stringify(message));
      }

      if (type === MESSAGE.TYPE.WEBRTC_ANSWER && sender !== senderName) {
        // console.log("Save remote answer...", data);

        await peer.setRemoteDescription(data);
      }

      console.log(type);
      if (type === MESSAGE.TYPE.ICE_CANDIDATE) {
        // console.log(`ICE_CANDIDATE from ${sender}`, data);

        peer.addIceCandidate(data);
      }
    });
  }, []);

  return {
    peer,

    senderName,
    handleChangeSenderName,

    recipientName,
    handleSelectRecipient,

    videoRef,
    remoteVideoRef,

    localeStream,
    videoDevices,
    microphoneDevices,
    volumeDevices,
    joinedUsers,
    handleCall,
    handleJoinLobby,
  };
};

export const App = () => {
  const peer = usePeer();

  return (
    <Box p={2}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <video
            autoPlay
            ref={peer.videoRef}
            style={{ width: "100%", height: "100%" }}
          />
        </Grid>
        <Grid item xs={6}>
          <video
            autoPlay
            ref={peer.remoteVideoRef}
            style={{ width: "100%", height: "100%" }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            value={peer.senderName}
            onChange={peer.handleChangeSenderName}
            variant="outlined"
            fullWidth
            autoFocus
            disabled={Boolean(
              peer.joinedUsers.find(({ name }) => name === peer.senderName)
            )}
          />
        </Grid>
        <Grid item xs="auto">
          <Button
            {...buttonProps}
            onClick={peer.handleCall}
            disabled={!peer.recipientName}
          >
            Call {peer.recipientName && `to ${peer.recipientName}`}
          </Button>
        </Grid>
        <Grid item xs="auto">
          <Button
            {...buttonProps}
            onClick={peer.handleJoinLobby}
            disabled={
              !peer.senderName ||
              Boolean(
                peer.joinedUsers.find(({ name }) => name === peer.senderName)
              )
            }
          >
            {Boolean(
              peer.joinedUsers.find(({ name }) => name === peer.senderName)
            )
              ? "Joined"
              : "Join"}
          </Button>
        </Grid>
        {/* {Boolean(peer.microphoneDevices.length) && (
          <Grid item xs={4}>
            <CustomSelect
              label="Microphone devices"
              options={peer.microphoneDevices}
            />
          </Grid>
        )}
        {Boolean(peer.volumeDevices.length) && (
          <Grid item xs={4}>
            <CustomSelect label="Volume devices" options={peer.volumeDevices} />
          </Grid>
        )}
        {Boolean(peer.videoDevices.length) && (
          <Grid item xs={4}>
            <CustomSelect label="Video devices" options={peer.videoDevices} />
          </Grid>
        )} */}
      </Grid>
      <Grid container spacing={2}>
        {peer.joinedUsers.map(({ name, status }) => {
          if (peer.senderName === name) return null;

          return (
            <Grid item xs="auto" key={name}>
              <Badge
                badgeContent={status === "ONLINE" ? "online" : "offline"}
                color={status === "ONLINE" ? "primary" : "secondary"}
              >
                <IconButton
                  style={{ borderRadius: 8 }}
                  onClick={() => peer.handleSelectRecipient(name)}
                >
                  <Paper component={Box} p={2}>
                    <Typography>{name}</Typography>
                  </Paper>
                </IconButton>
              </Badge>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};
