export const PEER = {
  CONFIG: {
    iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
    // iceTransportPolicy: "relay",
    // iceCandidatePoolSize: 0,
  },
};

// export const PEER = {
//   CONFIG: {
//     iceServers: [
//       { urls: "stun:global.stun.twilio.com:3478?transport=udp" },
//       {
//         username:
//           "65476c4de382f7206ca064abf0b3e8e0c4e6c9d54c81f598416d705ee48db989",
//         urls: "turn:global.turn.twilio.com:3478?transport=udp",
//         credential: "xq/awny4f8Ply8kbpJ3Y/GOt4gatVRpfMxFLaf0Yd9s=",
//       },
//       {
//         username:
//           "65476c4de382f7206ca064abf0b3e8e0c4e6c9d54c81f598416d705ee48db989",
//         urls: "turn:global.turn.twilio.com:3478?transport=tcp",
//         credential: "xq/awny4f8Ply8kbpJ3Y/GOt4gatVRpfMxFLaf0Yd9s=",
//       },
//       {
//         username:
//           "65476c4de382f7206ca064abf0b3e8e0c4e6c9d54c81f598416d705ee48db989",
//         urls: "turn:global.turn.twilio.com:443?transport=tcp",
//         credential: "xq/awny4f8Ply8kbpJ3Y/GOt4gatVRpfMxFLaf0Yd9s=",
//       },
//     ],
//     iceTransportPolicy: "relay",
//     iceCandidatePoolSize: 0,
//   },
// };
