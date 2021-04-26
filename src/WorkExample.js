import React from "react";

import { v4 as uuid } from "uuid";

import {
  Select,
  MenuItem,
  Grid,
  Box,
  Button,
  TextField,
  IconButton,
} from "@material-ui/core";
import { Videocam, VideocamOff, Mic, MicOff } from "@material-ui/icons";

import "webrtc-adapter";

import { PEER } from "./config/peer";
import { socket } from "./config/socket";
import { MESSAGE } from "./constants";

import { Lobby } from "./Lobby";

const buttonProps = {
  variant: "contained",
  color: "primary",
};

const generateSenderName = () => `${uuid().slice(0, 4)}@${uuid().slice(0, 4)}`;

const peer = new RTCPeerConnection(PEER.CONFIG);

const usePeer = () => {
  const localVideoRef = React.useRef(null);
  const remoteVideoRef = React.useRef(null);

  const recipientRef = React.useRef(null);

  const [senderName, setSenderName] = React.useState(generateSenderName());
  const [recipientName, setRecipientName] = React.useState("");
  const [localeStream, setLocaleStream] = React.useState(null);

  const [joinedUsers, setJoinedUsers] = React.useState([]);

  const [devicesMuteStatuses, setDeviceMuteStatus] = React.useState({
    video: true,
    audio: true,
  });

  const handleConnectToMediaStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    setLocaleStream(stream);

    if (!localVideoRef.current) return;

    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    localVideoRef.current.srcObject = stream;
  };

  const handleCall = async () => {
    const sdpOffer = await peer.createOffer({
      offerToReceiveVideo: true,
      offerToReceiveAudio: true,
    });

    await peer.setLocalDescription(sdpOffer);

    const message = {
      type: MESSAGE.TYPE.WEBRTC_OFFER,
      data: sdpOffer,
      sender: senderName,
      recipient: recipientName,
    };

    // NOTE: fix me
    recipientRef.current = recipientName;

    socket.send(JSON.stringify(message));
  };

  const handleHungUp = () => {
    remoteVideoRef.current.srcObject
      .getTracks()
      .forEach((track) => track.stop());

    localVideoRef.current.srcObject
      .getTracks()
      .forEach((track) => track.stop());

    peer.close();
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

  const handleToggleDevicesMuteStatus = (deviceType) => () =>
    setDeviceMuteStatus((currentDevicesMuteStatuses) => {
      const newDevicesMuteStatuses = {
        ...currentDevicesMuteStatuses,
        [deviceType]: !currentDevicesMuteStatuses[deviceType],
      };

      localeStream.getTracks().forEach((track) => {
        if (track.kind === deviceType) {
          track.enabled = !track.enabled;
        }
      });

      return newDevicesMuteStatuses;
    });

  const handleInitListenersForPeer = () => {
    peer.addEventListener("icecandidate", ({ candidate }) => {
      if (candidate) {
        const message = {
          type: MESSAGE.TYPE.ICE_CANDIDATE,
          data: candidate,
          sender: senderName,
          recipient: recipientRef.current,
        };

        socket.send(JSON.stringify(message));
      }
    });

    peer.addEventListener("track", (event) => {
      if (!remoteVideoRef.current) return;

      const [stream] = event.streams;

      if (remoteVideoRef.current.srcObject === stream) return;

      remoteVideoRef.current.srcObject = stream;
    });

    peer.addEventListener("iceconnectionstatechange", () => {
      // disconnected, connected, checking
      if (peer.iceConnectionState === "disconnected") {
        handleHungUp();
        peer.ontrack = null;
        peer.onicecandidate = null;
      }
    });
  };

  const handleChangeSenderName = (event) => setSenderName(event.target.value);

  React.useEffect(() => {
    handleConnectToMediaStream().then(handleInitListenersForPeer);

    socket.addEventListener("message", async (message) => {
      const { type, data, sender, recipient } = JSON.parse(message.data);

      if (type === MESSAGE.TYPE.PEER_LIST_CHANGED) {
        setJoinedUsers(data.users);
      }

      if (type === MESSAGE.TYPE.WEBRTC_OFFER && sender !== senderName) {
        // NOTE: fix me
        recipientRef.current = sender;

        await peer.setRemoteDescription(data);

        const sdpAnswer = await peer.createAnswer();

        await peer.setLocalDescription(sdpAnswer);

        const message = {
          type: MESSAGE.TYPE.WEBRTC_ANSWER,
          data: sdpAnswer,
          sender: recipient,
          recipient: sender,
        };
        socket.send(JSON.stringify(message));
      }

      if (type === MESSAGE.TYPE.WEBRTC_ANSWER && sender !== senderName) {
        await peer.setRemoteDescription(data);
      }

      if (type === MESSAGE.TYPE.ICE_CANDIDATE && sender !== senderName) {
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

    localVideoRef,
    remoteVideoRef,

    isVideoOn: devicesMuteStatuses.video,
    isAudioOn: devicesMuteStatuses.audio,
    handleToggleDevicesMuteStatus,

    localeStream,
    joinedUsers,
    handleCall,
    handleHungUp,
    handleJoinLobby,
  };
};

export const App = () => {
  const peer = usePeer();

  return (
    <Box p={2}>
      <Grid container spacing={2} justify="center">
        <Grid item xs={6}>
          <video
            autoPlay
            ref={peer.localVideoRef}
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
        <Grid item xs={12} container spacing={2} justify="center">
          <Grid item xs="auto">
            <IconButton onClick={peer.handleToggleDevicesMuteStatus("video")}>
              {peer.isVideoOn ? (
                <Videocam color="primary" />
              ) : (
                <VideocamOff color="error" />
              )}
            </IconButton>
          </Grid>
          <Grid item xs="auto">
            <IconButton onClick={peer.handleToggleDevicesMuteStatus("audio")}>
              {peer.isAudioOn ? (
                <Mic color="primary" />
              ) : (
                <MicOff color="error" />
              )}
            </IconButton>
          </Grid>
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
        <Grid item xs="auto">
          <Button {...buttonProps} onClick={peer.handleHungUp}>
            Hung up
          </Button>
        </Grid>
      </Grid>
      <Lobby
        users={peer.joinedUsers}
        myName={peer.senderName}
        onSelectRecipient={peer.handleSelectRecipient}
      />
    </Box>
  );
};
