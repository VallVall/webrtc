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

const filterDevices = (devices, kind) =>
  devices.filter(
    (device) => device.kind === kind && device.deviceId !== "default"
  );

const CustomSelect = ({
  value,
  options,
  type,
  onChangeDevice,
  onChangeOutputDevice,
}) => {
  const handleChangeDevice = (event) => {
    const deviceId = event.target.value;

    if (onChangeDevice) {
      onChangeDevice(type, deviceId);
    }

    if (onChangeOutputDevice) {
      onChangeOutputDevice(deviceId);
    }
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

const getDefaultDevice = (devices) => {
  if (devices.length) {
    const [{ deviceId }] = devices;

    return deviceId;
  }

  return undefined;
};

const generateSenderName = () => `${uuid().slice(0, 4)}@${uuid().slice(0, 4)}`;

const peer = new RTCPeerConnection(PEER.CONFIG);

const usePeer = () => {
  const videoRef = React.useRef(null);
  const remoteVideoRef = React.useRef(null);

  const recipientRef = React.useRef(null);

  const [senderName, setSenderName] = React.useState(generateSenderName());
  const [recipientName, setRecipientName] = React.useState("");
  const [localeStream, setLocaleStream] = React.useState(null);

  const [devices, setDevices] = React.useState({
    microphones: [],
    volumes: [],
    videos: [],
  });

  const [selectedDevices, setSelectedDevices] = React.useState({
    microphoneId: "",
    volumeId: "",
    videoId: "",
  });

  const [joinedUsers, setJoinedUsers] = React.useState([]);

  const [deviceConstraints, setDeviceConstraints] = React.useState({
    video: true,
    audio: true,
  });

  // const handleConnectToMediaStream = async (constraints) => {
  //   const stream = await navigator.mediaDevices.getUserMedia(constraints);

  //   setLocaleStream(stream);

  //   if (!videoRef.current) return;

  //   stream.getTracks().forEach((track) => peer.addTrack(track, stream));

  //   // NOTE: fix me
  //   videoRef.current.srcObject = stream;
  // };

  const handleConnectToDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();

    const microphones = filterDevices(devices, "audioinput");
    const volumes = filterDevices(devices, "audiooutput");
    const videos = filterDevices(devices, "videoinput");

    setDevices({
      microphones,
      volumes,
      videos,
    });

    const microphoneId = getDefaultDevice(microphones);
    const volumeId = getDefaultDevice(volumes);
    const videoId = getDefaultDevice(videos);

    setSelectedDevices({
      microphoneId,
      volumeId,
      videoId,
    });

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: {
          exact: videoId,
        },
      },
      audio: {
        deviceId: {
          exact: microphoneId,
        },
      },
    });

    setLocaleStream(stream);

    if (!videoRef.current) return;

    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    // NOTE: fix me
    videoRef.current.srcObject = stream;
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

  // const handleChangeDevice = async (type, deviceId) => {
  //   const newDevicesContraints = {
  //     ...deviceConstraints,
  //     [type]: {
  //       deviceId: {
  //         exact: deviceId,
  //       },
  //     },
  //   };

  //   const stream = await navigator.mediaDevices.getUserMedia(
  //     newDevicesContraints
  //   );
  //   const track = stream.getTracks().find((track) => track.kind === type);

  //   if (!track) return;

  //   const sender = peer
  //     .getSenders()
  //     .find((sender) => sender.track.kind === track.kind);

  //   if (!sender) return;

  //   sender.replaceTrack(track);

  //   setSelectedDevices((state) => ({
  //     ...state,
  //     [type]: deviceId,
  //   }));
  // };

  const handleChangeDevice = async (type, deviceId) => {
    const newSelectedDevices = {
      ...selectedDevices,
      [type]: deviceId,
    };

    const newDevicesContraints = {
      video: {
        deviceId: {
          exact: newSelectedDevices.videoId,
        },
      },
      audio: {
        deviceId: {
          exact: newSelectedDevices.microphoneId,
        },
      },
    };

    const stream = await navigator.mediaDevices.getUserMedia(
      newDevicesContraints
    );

    if (localeStream) {
      localeStream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    setLocaleStream(stream);

    if (!videoRef.current) return;

    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    // NOTE: fix me
    videoRef.current.srcObject = stream;

    console.log("newSelectedDevices", newSelectedDevices);

    setSelectedDevices(newSelectedDevices);
  };

  const handleChangeOutputDevice = (deviceId) => {
    if (!videoRef.current) return;

    setSelectedDevices((currentSelectedDevices) => ({
      ...currentSelectedDevices,
      volumeId: deviceId,
    }));

    // NOTE: do not work with connecting with new devices
    videoRef.current.setSinkId(deviceId);
  };

  React.useEffect(() => {
    handleInitListenersForPeer();
    handleConnectToDevices();
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

    devices,
    selectedDevices,
    handleChangeDevice,
    handleChangeOutputDevice,

    localeStream,
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
          <Grid item xs={4}>
            microphoneDevices
            <CustomSelect
              value={peer.selectedDevices.microphoneId}
              type="microphoneId"
              options={peer.devices.microphones}
              onChangeDevice={peer.handleChangeDevice}
            />
          </Grid>
          <Grid item xs={4}>
            videoDevices
            <CustomSelect
              value={peer.selectedDevices.videoId}
              type="videoId"
              options={peer.devices.videos}
              onChangeDevice={peer.handleChangeDevice}
            />
          </Grid>
          <Grid item xs={4}>
            volumeDevices
            <CustomSelect
              value={peer.selectedDevices.volumeId}
              options={peer.devices.volumes}
              onChangeOutputDevice={peer.handleChangeOutputDevice}
            />
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
      </Grid>
      <Lobby
        users={peer.joinedUsers}
        myName={peer.senderName}
        onSelectRecipient={peer.handleSelectRecipient}
      />
    </Box>
  );
};
