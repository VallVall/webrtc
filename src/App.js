import React from "react";

import { v4 as uuid } from "uuid";

import { Grid, Box, Button, TextField, IconButton } from "@material-ui/core";
import { Videocam, VideocamOff, Mic, MicOff } from "@material-ui/icons";

import { PEER } from "./config/peer";
import { socket } from "./config/socket";
import { MESSAGE } from "./constants";

import { Lobby } from "./Lobby";

const buttonProps = {
  variant: "contained",
  color: "primary",
};

const PREFIX = "test";

const generateSenderName = () => `${PREFIX}@${uuid().slice(0, 4)}`;

const usePeer = () => {
  const peerRef = React.useRef(null);
  const localStreamRef = React.useRef(null);

  const localVideoRef = React.useRef(null);
  const remoteVideoRef = React.useRef(null);

  const [isRemoteVideoVisible, setRemoteVideoVisable] = React.useState(false);

  const [senderName, setSenderName] = React.useState(generateSenderName());
  const [recipientName, setRecipientName] = React.useState("");

  const [joinedUsers, setJoinedUsers] = React.useState([]);

  const [devicesMuteStatuses, setDeviceMuteStatus] = React.useState({
    video: true,
    audio: true,
  });

  const [disableButtons, setDisableButtonss] = React.useState({
    join: false,
    call: true,
    hungUp: true,
  });

  const handleConnectToMediaStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    if (!localVideoRef.current) return;

    localVideoRef.current.srcObject = stream;
    localStreamRef.current = stream;
  };

  const handleHungUp = () => {
    setRemoteVideoVisable(false);

    peerRef.current.ontrack = null;
    peerRef.current.onicecandidate = null;
    peerRef.current.close();

    const message = {
      type: MESSAGE.TYPE.HANG_UP,
      data: "",
      sender: senderName,
      recipient: recipientName,
    };

    socket.send(JSON.stringify(message));
    setDisableButtonss((state) => ({
      ...state,
      call: false,
      hungUp: true,
    }));
  };

  const handleCreatePeerConnection = () => {
    setRemoteVideoVisable(true);
    setDisableButtonss((state) => ({
      ...state,
      call: true,
      hungUp: false,
    }));

    peerRef.current = new RTCPeerConnection(PEER.CONFIG);

    localStreamRef.current
      .getTracks()
      .forEach((track) =>
        peerRef.current.addTrack(track, localStreamRef.current)
      );

    peerRef.current.onicecandidate = ({ candidate }) => {
      if (candidate) {
        const message = {
          type: MESSAGE.TYPE.ICE_CANDIDATE,
          data: candidate,
          sender: senderName,
          recipient: recipientName,
        };

        socket.send(JSON.stringify(message));
      }
    };

    peerRef.current.ontrack = (event) => {
      if (!remoteVideoRef.current) return;

      const [stream] = event.streams;

      if (remoteVideoRef.current.srcObject === stream) return;

      remoteVideoRef.current.srcObject = stream;
    };
  };

  const handleCall = async () => {
    handleCreatePeerConnection();

    const sdpOffer = await peerRef.current.createOffer({
      offerToReceiveVideo: true,
      offerToReceiveAudio: true,
    });

    await peerRef.current.setLocalDescription(sdpOffer);

    const message = {
      type: MESSAGE.TYPE.WEBRTC_OFFER,
      data: sdpOffer,
      sender: senderName,
      recipient: recipientName,
    };

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
    setDisableButtonss((state) => ({
      ...state,
      join: true,
      hungUp: true,
    }));
  };

  const handleSelectRecipient = (newRecipientName) => {
    setRecipientName(newRecipientName);
    setDisableButtonss((state) => ({
      ...state,
      call: false,
    }));
  };

  const handleToggleDevicesMuteStatus = (deviceType) => () =>
    setDeviceMuteStatus((currentDevicesMuteStatuses) => {
      const newDevicesMuteStatuses = {
        ...currentDevicesMuteStatuses,
        [deviceType]: !currentDevicesMuteStatuses[deviceType],
      };

      localStreamRef.current.getTracks().forEach((track) => {
        if (track.kind === deviceType) {
          track.enabled = !track.enabled;
        }
      });

      return newDevicesMuteStatuses;
    });

  const handleChangeSenderName = (event) => setSenderName(event.target.value);

  const handleConnectSocket = () => {
    socket.addEventListener("message", async (message) => {
      const { type, data, sender, recipient } = JSON.parse(message.data);

      if (type === MESSAGE.TYPE.PEER_LIST_CHANGED) {
        const filteredUsers = data.users.filter((user) =>
          user.name.includes(PREFIX)
        );

        setJoinedUsers(filteredUsers);
      }

      if (type === MESSAGE.TYPE.WEBRTC_OFFER && sender !== senderName) {
        handleCreatePeerConnection();

        setRecipientName(sender);

        await peerRef.current.setRemoteDescription(data);

        const sdpAnswer = await peerRef.current.createAnswer();

        await peerRef.current.setLocalDescription(sdpAnswer);

        const message = {
          type: MESSAGE.TYPE.WEBRTC_ANSWER,
          data: sdpAnswer,
          sender: recipient,
          recipient: sender,
        };
        socket.send(JSON.stringify(message));
      }

      if (type === MESSAGE.TYPE.WEBRTC_ANSWER && sender !== senderName) {
        await peerRef.current.setRemoteDescription(data);
      }

      if (type === MESSAGE.TYPE.ICE_CANDIDATE && sender !== senderName) {
        peerRef.current.addIceCandidate(data);
      }

      if (type === MESSAGE.TYPE.HANG_UP && sender !== senderName) {
        handleHungUp();
      }
    });
  };

  React.useEffect(() => {
    handleConnectToMediaStream();
    handleConnectSocket();
  }, []);

  return {
    senderName,
    handleChangeSenderName,

    recipientName,
    handleSelectRecipient,

    localVideoRef,
    remoteVideoRef,
    isRemoteVideoVisible,

    disableButtons,

    isVideoOn: devicesMuteStatuses.video,
    isAudioOn: devicesMuteStatuses.audio,
    handleToggleDevicesMuteStatus,

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
        {peer.isRemoteVideoVisible && (
          <Grid item xs={6}>
            <video
              autoPlay
              ref={peer.remoteVideoRef}
              style={{ width: "100%", height: "100%" }}
            />
          </Grid>
        )}
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
            disabled={peer.disableButtons.join}
          />
        </Grid>
        <Grid item xs="auto">
          <Button
            {...buttonProps}
            onClick={peer.handleCall}
            disabled={peer.disableButtons.call}
          >
            Call {peer.recipientName && `to ${peer.recipientName}`}
          </Button>
        </Grid>
        <Grid item xs="auto">
          <Button
            {...buttonProps}
            onClick={peer.handleJoinLobby}
            disabled={peer.disableButtons.join}
          >
            {peer.disableButtons.join ? "Joined" : "Join"}
          </Button>
        </Grid>
        <Grid item xs="auto">
          <Button
            {...buttonProps}
            onClick={peer.handleHungUp}
            disabled={peer.disableButtons.hungUp}
          >
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
