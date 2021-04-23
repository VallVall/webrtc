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

const CustomSelect = ({ value, options, type, onChangeDevice }) => {
  const handleChangeDevice = (event) => {
    if (type === "volume") {
      onChangeDevice(event.target.value);

      return;
    }

    onChangeDevice(type, event.target.value);
  };

  return (
    <Select
      value={value}
      displayEmpty
      fullWidth
      variant="outlined"
      onChange={handleChangeDevice}
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

const setter = (options, setValue) => {
  if (options.length === 1) {
    const [{ deviceId }] = options;

    setValue(deviceId);
    return;
  }

  const [{ deviceId }] = options.filter(
    ({ deviceId }) => deviceId === "default"
  );

  setValue(deviceId);
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

  const [selectedVideoDevice, setSelectedVideoDevice] = React.useState("");
  const [
    selectedMicrophoneDevice,
    setSelectedMicrophoneDevice,
  ] = React.useState("");
  const [selectedVolumeDevice, setSelectedVolumeDevice] = React.useState("");

  const [joinedUsers, setJoinedUsers] = React.useState([]);

  const [deviceConstraints, setDeviceConstraints] = React.useState({
    video: true,
    audio: true,
  });

  const handleConnectToMediaStream = async (constraints) => {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    setLocaleStream(stream);

    if (!videoRef.current) return;

    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    // NOTE: fix me
    videoRef.current.srcObject = stream;
  };

  const handleConnectToDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();

    const microphones = devices.filter(({ kind }) => kind === "audioinput");
    const volumes = devices.filter(({ kind }) => kind === "audiooutput");
    const videos = devices.filter(({ kind }) => kind === "videoinput");

    setter(microphones, setSelectedMicrophoneDevice);
    setter(volumes, setSelectedVolumeDevice);
    setter(videos, setSelectedVideoDevice);

    setVideoDevices(videos);
    setVolumeDevices(volumes);
    setMicrophoneDevices(microphones);
  };

  const handleCall = async () => {
    const sdpOffer = await peer.createOffer({ offerToReceiveVideo: true });

    await peer.setLocalDescription(sdpOffer);

    const message = {
      type: MESSAGE.TYPE.WEBRTC_OFFER,
      data: sdpOffer,
      sender: senderName,
      recipient: recipientName,
    };

    recipientRef.current = recipientName;

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

  const handleInitListenersForDevices = () => {
    navigator.mediaDevices.addEventListener(
      "devicechange",
      handleConnectToDevices
    );
  };

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

    peer.addEventListener("track", ({ streams }) => {
      if (!remoteVideoRef.current) return;

      const [stream] = streams;

      if (remoteVideoRef.current.srcObject === stream) return;

      remoteVideoRef.current.srcObject = stream;
    });
  };

  const handleChangeSenderName = (event) => setSenderName(event.target.value);

  const handleToggleDevicesStatus = (deviceType) => () =>
    setDeviceConstraints((currentDevicesContraints) => {
      const newDevicesContraints = {
        ...currentDevicesContraints,
        [deviceType]: !currentDevicesContraints[deviceType],
      };

      localeStream.getTracks().forEach((track) => {
        if (track.kind === deviceType) {
          track.enabled = !track.enabled;
        }
      });

      return newDevicesContraints;
    });

  const handleChangeDevice = async (type, deviceId) => {
    const newDevicesContraints = {
      ...deviceConstraints,
      [type]: {
        deviceId: {
          exact: deviceId,
        },
      },
    };

    const stream = await navigator.mediaDevices.getUserMedia(
      newDevicesContraints
    );
    const track = stream.getTracks().find((track) => track.kind === type);

    if (!track) return;

    const sender = peer
      .getSenders()
      .find((sender) => sender.track.kind === track.kind);

    if (!sender) return;

    sender.replaceTrack(track);

    switch (type) {
      case "audio":
        setSelectedMicrophoneDevice(deviceId);
        break;
      case "video":
        setSelectedVideoDevice(deviceId);
        break;
      default:
        break;
    }
  };

  const handleChangeOutputDevice = (deviceId) => {
    if (!videoRef.current) return;

    setSelectedVolumeDevice(deviceId);

    // NOTE: do not work with connecting with new devices
    videoRef.current.setSinkId(deviceId);
  };

  React.useEffect(() => {
    handleInitListenersForPeer();
    handleConnectToDevices().then(() => {
      handleConnectToMediaStream(deviceConstraints);
    });
    handleInitListenersForDevices();

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

      console.log(type);
      if (type === MESSAGE.TYPE.ICE_CANDIDATE) {
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

    isVideoOn: deviceConstraints.video,
    isAudioOn: deviceConstraints.audio,
    handleToggleDevicesStatus,

    selectedVideoDevice,
    selectedMicrophoneDevice,
    selectedVolumeDevice,
    handleChangeDevice,
    handleChangeOutputDevice,

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
      <Grid container spacing={2} justify="center">
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
        <Grid item xs={12} container spacing={2} justify="center">
          <Grid item xs="auto">
            <IconButton onClick={peer.handleToggleDevicesStatus("video")}>
              {peer.isVideoOn ? (
                <Videocam color="primary" />
              ) : (
                <VideocamOff color="error" />
              )}
            </IconButton>
          </Grid>
          <Grid item xs="auto">
            <IconButton onClick={peer.handleToggleDevicesStatus("audio")}>
              {peer.isAudioOn ? (
                <Mic color="primary" />
              ) : (
                <MicOff color="error" />
              )}
            </IconButton>
          </Grid>
        </Grid>
        <Grid item xs={12} container spacing={2}>
          {Boolean(peer.microphoneDevices.length) && (
            <Grid item xs={4}>
              microphoneDevices
              <CustomSelect
                value={peer.selectedMicrophoneDevice}
                type="audio"
                options={peer.microphoneDevices}
                onChangeDevice={peer.handleChangeDevice}
              />
            </Grid>
          )}
          {Boolean(peer.videoDevices.length) && (
            <Grid item xs={4}>
              videoDevices
              <CustomSelect
                value={peer.selectedVideoDevice}
                type="video"
                options={peer.videoDevices}
                onChangeDevice={peer.handleChangeDevice}
              />
            </Grid>
          )}
          {Boolean(peer.volumeDevices.length) && (
            <Grid item xs={4}>
              volumeDevices
              <CustomSelect
                value={peer.selectedVolumeDevice}
                type="volume"
                options={peer.volumeDevices}
                onChangeDevice={peer.handleChangeOutputDevice}
              />
            </Grid>
          )}
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
      </Grid>
      <Lobby
        users={peer.joinedUsers}
        myName={peer.senderName}
        onSelectRecipient={peer.handleSelectRecipient}
      />
    </Box>
  );
};
