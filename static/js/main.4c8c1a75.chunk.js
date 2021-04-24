(this["webpackJsonpsocket-meet"]=this["webpackJsonpsocket-meet"]||[]).push([[0],{81:function(e,t,n){"use strict";n.r(t);var a=n(0),c=n.n(a),r=n(9),i=n.n(r),s=n(13),o=n(15),d=n(20),u=n.n(d),l=n(36),j=n(19),v=n(129),O=n(126),b=n(132),f=n(128),h=n(111),p=n(115),m=n(130),x=n(124),E=n(120),g=n(121),C=n(122),N=n(123),T=(n(80),new WebSocket("wss://p2p-be-dev.janus-demo.live")),_={JOIN_LOBBY:"JOIN_LOBBY",JOIN_LOBBY_ACK:"JOIN_LOBBY_ACK",GET_PEER_LIST:"GET_PEER_LIST",GET_PEER_LIST_ACK:"GET_PEER_LIST_ACK",PEER_LIST_CHANGED:"PEER_LIST_CHANGED",GET_STUN_TURN_INFO:"GET_STUN_TURN_INFO",GET_STUN_TURN_INFO_ACK:"GET_STUN_TURN_INFO_ACK",WEBRTC_OFFER:"WEBRTC_OFFER",WEBRTC_ANSWER:"WEBRTC_ANSWER",ICE_CANDIDATE:"ICE_CANDIDATE",CALL_STARTED:"CALL_STARTED",HANG_UP:"HANG_UP"},I=n(114),R=n(116),S=n(117),D=n(5),y=function(e){var t=e.users,n=e.myName,a=e.onSelectRecipient;return Object(D.jsx)(h.a,{container:!0,spacing:2,children:t.map((function(e){var t=e.name,c=e.status;return n===t?null:Object(D.jsx)(h.a,{item:!0,xs:"auto",children:Object(D.jsx)(I.a,{badgeContent:"ONLINE"===c?"online":"offline",color:"ONLINE"===c?"primary":"secondary",children:Object(D.jsx)(p.a,{style:{borderRadius:8},onClick:function(){return a(t)},children:Object(D.jsx)(R.a,{component:f.a,p:2,children:Object(D.jsx)(S.a,{children:t})})})})},t)}))})},A={variant:"contained",color:"primary"},k=function(e,t){return e.filter((function(e){return e.kind===t&&"default"!==e.deviceId}))},L=function(e){var t=e.value,n=e.options,a=e.type,c=e.onChangeDevice,r=e.onChangeOutputDevice;return Object(D.jsxs)(O.a,{value:t,displayEmpty:!0,fullWidth:!0,variant:"outlined",onChange:function(e){var t=e.target.value;c&&c(a,t),r&&r(t)},children:[Object(D.jsx)(b.a,{value:"",disabled:!0,children:"Select device"}),n.map((function(e){var t=e.deviceId,n=e.label;return Object(D.jsx)(b.a,{value:t,children:n},t)}))]})},B=function(e){if(e.length)return Object(j.a)(e,1)[0].deviceId},F=new RTCPeerConnection({iceServers:[{urls:["stun:stun.l.google.com:19302"]}]}),w=function(){var e=c.a.useRef(null),t=c.a.useRef(null),n=c.a.useRef(null),a=c.a.useState("".concat(Object(v.a)().slice(0,4),"@").concat(Object(v.a)().slice(0,4))),r=Object(j.a)(a,2),i=r[0],d=r[1],O=c.a.useState(""),b=Object(j.a)(O,2),f=b[0],h=b[1],p=c.a.useState(null),m=Object(j.a)(p,2),x=m[0],E=m[1],g=c.a.useState({microphones:[],volumes:[],videos:[]}),C=Object(j.a)(g,2),N=C[0],I=C[1],R=c.a.useState({microphoneId:"",volumeId:"",videoId:""}),S=Object(j.a)(R,2),D=S[0],y=S[1],A=c.a.useState([]),L=Object(j.a)(A,2),w=L[0],U=L[1],J=c.a.useState({video:!0,audio:!0}),W=Object(j.a)(J,2),P=W[0],G=W[1],K=function(){var t=Object(l.a)(u.a.mark((function t(){var n,a,c,r,i,s,o,d;return u.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,navigator.mediaDevices.enumerateDevices();case 2:return n=t.sent,a=k(n,"audioinput"),c=k(n,"audiooutput"),r=k(n,"videoinput"),I({microphones:a,volumes:c,videos:r}),i=B(a),s=B(c),o=B(r),y({microphoneId:i,volumeId:s,videoId:o}),t.next=13,navigator.mediaDevices.getUserMedia({video:{deviceId:{exact:o}},audio:{deviceId:{exact:i}}});case 13:if(d=t.sent,E(d),e.current){t.next=17;break}return t.abrupt("return");case 17:d.getTracks().forEach((function(e){return F.addTrack(e,d)})),e.current.srcObject=d;case 19:case"end":return t.stop()}}),t)})));return function(){return t.apply(this,arguments)}}(),H=function(){var e=Object(l.a)(u.a.mark((function e(){var t,a;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,F.createOffer({offerToReceiveVideo:!0,offerToReceiveAudio:!0});case 2:return t=e.sent,e.next=5,F.setLocalDescription(t);case 5:a={type:_.WEBRTC_OFFER,data:t,sender:i,recipient:f},n.current=f,T.send(JSON.stringify(a));case 8:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),V=function(){var t=Object(l.a)(u.a.mark((function t(n,a){var c,r,i;return u.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return c=Object(o.a)(Object(o.a)({},D),{},Object(s.a)({},n,a)),r={video:{deviceId:{exact:c.videoId}},audio:{deviceId:{exact:c.microphoneId}}},t.next=4,navigator.mediaDevices.getUserMedia(r);case 4:if(i=t.sent,x.getTracks().forEach((function(e){e.stop()})),E(i),e.current){t.next=9;break}return t.abrupt("return");case 9:i.getTracks().forEach((function(e){return F.addTrack(e,i)})),e.current.srcObject=i,console.log("newSelectedDevices",c),y(c);case 13:case"end":return t.stop()}}),t)})));return function(e,n){return t.apply(this,arguments)}}();return c.a.useEffect((function(){F.addEventListener("icecandidate",(function(e){var t=e.candidate;if(t){var a={type:_.ICE_CANDIDATE,data:t,sender:i,recipient:n.current};T.send(JSON.stringify(a))}})),F.addEventListener("track",(function(e){var n=e.streams;if(t.current){var a=Object(j.a)(n,1)[0];t.current.srcObject!==a&&(t.current.srcObject=a)}})),K(),navigator.mediaDevices.addEventListener("devicechange",K),T.addEventListener("message",function(){var e=Object(l.a)(u.a.mark((function e(t){var a,c,r,s,o,d,l;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(a=JSON.parse(t.data),c=a.type,r=a.data,s=a.sender,o=a.recipient,c===_.PEER_LIST_CHANGED&&U(r.users),c!==_.WEBRTC_OFFER||s===i){e.next=13;break}return n.current=s,e.next=6,F.setRemoteDescription(r);case 6:return e.next=8,F.createAnswer();case 8:return d=e.sent,e.next=11,F.setLocalDescription(d);case 11:l={type:_.WEBRTC_ANSWER,data:d,sender:o,recipient:s},T.send(JSON.stringify(l));case 13:if(c!==_.WEBRTC_ANSWER||s===i){e.next=16;break}return e.next=16,F.setRemoteDescription(r);case 16:console.log(c),c===_.ICE_CANDIDATE&&F.addIceCandidate(r);case 18:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}())}),[]),{peer:F,senderName:i,handleChangeSenderName:function(e){return d(e.target.value)},recipientName:f,handleSelectRecipient:function(e){return h(e)},videoRef:e,remoteVideoRef:t,isVideoOn:P.video,isAudioOn:P.audio,handleToggleDevicesStatus:function(e){return function(){return G((function(t){var n=Object(o.a)(Object(o.a)({},t),{},Object(s.a)({},e,!t[e]));return x.getTracks().forEach((function(t){t.kind===e&&(t.enabled=!t.enabled)})),n}))}},devices:N,selectedDevices:D,handleChangeDevice:V,handleChangeOutputDevice:function(t){e.current&&(y((function(e){return Object(o.a)(Object(o.a)({},e),{},{volumeId:t})})),e.current.setSinkId(t))},localeStream:x,joinedUsers:w,handleCall:H,handleJoinLobby:function(){var e={type:_.JOIN_LOBBY,data:"",sender:i,recipient:""};T.send(JSON.stringify(e))}}},U=function(){var e=w();return Object(D.jsxs)(f.a,{p:2,children:[Object(D.jsxs)(h.a,{container:!0,spacing:2,justify:"center",children:[Object(D.jsx)(h.a,{item:!0,xs:6,children:Object(D.jsx)("video",{autoPlay:!0,ref:e.videoRef,style:{width:"100%",height:"100%"}})}),Object(D.jsx)(h.a,{item:!0,xs:6,children:Object(D.jsx)("video",{autoPlay:!0,ref:e.remoteVideoRef,style:{width:"100%",height:"100%"}})}),Object(D.jsxs)(h.a,{item:!0,xs:12,container:!0,spacing:2,justify:"center",children:[Object(D.jsx)(h.a,{item:!0,xs:"auto",children:Object(D.jsx)(p.a,{onClick:e.handleToggleDevicesStatus("video"),children:e.isVideoOn?Object(D.jsx)(E.a,{color:"primary"}):Object(D.jsx)(g.a,{color:"error"})})}),Object(D.jsx)(h.a,{item:!0,xs:"auto",children:Object(D.jsx)(p.a,{onClick:e.handleToggleDevicesStatus("audio"),children:e.isAudioOn?Object(D.jsx)(C.a,{color:"primary"}):Object(D.jsx)(N.a,{color:"error"})})})]}),Object(D.jsxs)(h.a,{item:!0,xs:12,container:!0,spacing:2,children:[Object(D.jsxs)(h.a,{item:!0,xs:4,children:["microphoneDevices",Object(D.jsx)(L,{value:e.selectedDevices.microphoneId,type:"microphoneId",options:e.devices.microphones,onChangeDevice:e.handleChangeDevice})]}),Object(D.jsxs)(h.a,{item:!0,xs:4,children:["videoDevices",Object(D.jsx)(L,{value:e.selectedDevices.videoId,type:"videoId",options:e.devices.videos,onChangeDevice:e.handleChangeDevice})]}),Object(D.jsxs)(h.a,{item:!0,xs:4,children:["volumeDevices",Object(D.jsx)(L,{value:e.selectedDevices.volumeId,options:e.devices.volumes,onChangeOutputDevice:e.handleChangeOutputDevice})]})]}),Object(D.jsx)(h.a,{item:!0,xs:12,children:Object(D.jsx)(m.a,{value:e.senderName,onChange:e.handleChangeSenderName,variant:"outlined",fullWidth:!0,autoFocus:!0,disabled:Boolean(e.joinedUsers.find((function(t){return t.name===e.senderName})))})}),Object(D.jsx)(h.a,{item:!0,xs:"auto",children:Object(D.jsxs)(x.a,Object(o.a)(Object(o.a)({},A),{},{onClick:e.handleCall,disabled:!e.recipientName,children:["Call ",e.recipientName&&"to ".concat(e.recipientName)]}))}),Object(D.jsx)(h.a,{item:!0,xs:"auto",children:Object(D.jsx)(x.a,Object(o.a)(Object(o.a)({},A),{},{onClick:e.handleJoinLobby,disabled:!e.senderName||Boolean(e.joinedUsers.find((function(t){return t.name===e.senderName}))),children:Boolean(e.joinedUsers.find((function(t){return t.name===e.senderName})))?"Joined":"Join"}))})]}),Object(D.jsx)(y,{users:e.joinedUsers,myName:e.senderName,onSelectRecipient:e.handleSelectRecipient})]})},J=n(125),W=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,134)).then((function(t){var n=t.getCLS,a=t.getFID,c=t.getFCP,r=t.getLCP,i=t.getTTFB;n(e),a(e),c(e),r(e),i(e)}))};i.a.render(Object(D.jsxs)(D.Fragment,{children:[Object(D.jsx)(J.a,{}),Object(D.jsx)(U,{})]}),document.getElementById("root")),W()}},[[81,1,2]]]);
//# sourceMappingURL=main.4c8c1a75.chunk.js.map