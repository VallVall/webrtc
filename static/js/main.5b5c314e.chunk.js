(this["webpackJsonpsocket-meet"]=this["webpackJsonpsocket-meet"]||[]).push([[0],{72:function(e,t,n){"use strict";n.r(t);var r=n(0),a=n.n(r),c=n(9),i=n.n(c),s=n(13),o=n(11),u=n(21),d=n.n(u),l=n(37),j=n(19),O=n(116),b=n(115),f=n(100),p=n(104),h=n(113),E=n(111),x=n(107),_=n(108),N=n(109),T=n(110),m={iceServers:[{urls:["stun:stun.l.google.com:19302"]}]},R=new WebSocket("wss://p2p-be-dev.janus-demo.live"),C={JOIN_LOBBY:"JOIN_LOBBY",JOIN_LOBBY_ACK:"JOIN_LOBBY_ACK",GET_PEER_LIST:"GET_PEER_LIST",GET_PEER_LIST_ACK:"GET_PEER_LIST_ACK",PEER_LIST_CHANGED:"PEER_LIST_CHANGED",GET_STUN_TURN_INFO:"GET_STUN_TURN_INFO",GET_STUN_TURN_INFO_ACK:"GET_STUN_TURN_INFO_ACK",WEBRTC_OFFER:"WEBRTC_OFFER",WEBRTC_ANSWER:"WEBRTC_ANSWER",ICE_CANDIDATE:"ICE_CANDIDATE",CALL_STARTED:"CALL_STARTED",HANG_UP:"HANG_UP"},g=n(103),v=n(105),S=n(106),A=n(6),y=function(e){var t=e.users,n=e.myName,r=e.onSelectRecipient;return Object(A.jsx)(f.a,{container:!0,spacing:2,children:t.map((function(e){var t=e.name,a=e.status;return n===t?null:Object(A.jsx)(f.a,{item:!0,xs:"auto",children:Object(A.jsx)(g.a,{badgeContent:"ONLINE"===a?"online":"offline",color:"ONLINE"===a?"primary":"secondary",children:Object(A.jsx)(p.a,{style:{borderRadius:8},onClick:function(){return r(t)},children:Object(A.jsx)(v.a,{component:b.a,p:2,children:Object(A.jsx)(S.a,{children:t})})})})},t)}))})},I={variant:"contained",color:"primary"},B="test",L=function(){var e=a.a.useRef(null),t=a.a.useRef(null),n=a.a.useRef(null),r=a.a.useRef(null),c=a.a.useState(!1),i=Object(j.a)(c,2),u=i[0],b=i[1],f=a.a.useState("".concat(B,"@").concat(Object(O.a)().slice(0,4))),p=Object(j.a)(f,2),h=p[0],E=p[1],x=a.a.useState(""),_=Object(j.a)(x,2),N=_[0],T=_[1],g=a.a.useState([]),v=Object(j.a)(g,2),S=v[0],A=v[1],y=a.a.useState({video:!0,audio:!0}),I=Object(j.a)(y,2),L=I[0],k=I[1],D=a.a.useState({join:!1,call:!0,hungUp:!0}),U=Object(j.a)(D,2),F=U[0],J=U[1],P=function(){var e=Object(l.a)(d.a.mark((function e(){var r;return d.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,navigator.mediaDevices.getUserMedia({video:!0,audio:!0});case 2:if(r=e.sent,n.current){e.next=5;break}return e.abrupt("return");case 5:n.current.srcObject=r,t.current=r;case 7:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),G=function(){b(!1),e.current.ontrack=null,e.current.onicecandidate=null,e.current.close();var t={type:C.HANG_UP,data:"",sender:h,recipient:N};R.send(JSON.stringify(t)),J((function(e){return Object(o.a)(Object(o.a)({},e),{},{call:!1,hungUp:!0})}))},w=function(){b(!0),J((function(e){return Object(o.a)(Object(o.a)({},e),{},{call:!0,hungUp:!1})})),e.current=new RTCPeerConnection(m),t.current.getTracks().forEach((function(n){return e.current.addTrack(n,t.current)})),e.current.onicecandidate=function(e){var t=e.candidate;if(t){var n={type:C.ICE_CANDIDATE,data:t,sender:h,recipient:N};R.send(JSON.stringify(n))}},e.current.ontrack=function(e){if(r.current){var t=Object(j.a)(e.streams,1)[0];r.current.srcObject!==t&&(r.current.srcObject=t)}}},W=function(){var t=Object(l.a)(d.a.mark((function t(){var n,r;return d.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return w(),t.next=3,e.current.createOffer({offerToReceiveVideo:!0,offerToReceiveAudio:!0});case 3:return n=t.sent,t.next=6,e.current.setLocalDescription(n);case 6:r={type:C.WEBRTC_OFFER,data:n,sender:h,recipient:N},R.send(JSON.stringify(r));case 8:case"end":return t.stop()}}),t)})));return function(){return t.apply(this,arguments)}}();return a.a.useEffect((function(){P(),R.addEventListener("message",function(){var t=Object(l.a)(d.a.mark((function t(n){var r,a,c,i,s,o,u,l;return d.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(r=JSON.parse(n.data),a=r.type,c=r.data,i=r.sender,s=r.recipient,a===C.PEER_LIST_CHANGED&&(o=c.users.filter((function(e){return e.name.includes(B)})),A(o)),a!==C.WEBRTC_OFFER||i===h){t.next=14;break}return w(),T(i),t.next=7,e.current.setRemoteDescription(c);case 7:return t.next=9,e.current.createAnswer();case 9:return u=t.sent,t.next=12,e.current.setLocalDescription(u);case 12:l={type:C.WEBRTC_ANSWER,data:u,sender:s,recipient:i},R.send(JSON.stringify(l));case 14:if(a!==C.WEBRTC_ANSWER||i===h){t.next=17;break}return t.next=17,e.current.setRemoteDescription(c);case 17:a===C.ICE_CANDIDATE&&i!==h&&e.current.addIceCandidate(c),a===C.HANG_UP&&i!==h&&G();case 19:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}())}),[]),{senderName:h,handleChangeSenderName:function(e){return E(e.target.value)},recipientName:N,handleSelectRecipient:function(e){T(e),J((function(e){return Object(o.a)(Object(o.a)({},e),{},{call:!1})}))},localVideoRef:n,remoteVideoRef:r,isRemoteVideoVisible:u,disableButtons:F,isVideoOn:L.video,isAudioOn:L.audio,handleToggleDevicesMuteStatus:function(e){return function(){return k((function(n){var r=Object(o.a)(Object(o.a)({},n),{},Object(s.a)({},e,!n[e]));return t.current.getTracks().forEach((function(t){t.kind===e&&(t.enabled=!t.enabled)})),r}))}},joinedUsers:S,handleCall:W,handleHungUp:G,handleJoinLobby:function(){var e={type:C.JOIN_LOBBY,data:"",sender:h,recipient:""};R.send(JSON.stringify(e)),J((function(e){return Object(o.a)(Object(o.a)({},e),{},{join:!0,hungUp:!0})}))}}},k=function(){var e=L();return Object(A.jsxs)(b.a,{p:2,children:[Object(A.jsxs)(f.a,{container:!0,spacing:2,justify:"center",children:[Object(A.jsx)(f.a,{item:!0,xs:6,children:Object(A.jsx)("video",{autoPlay:!0,ref:e.localVideoRef,style:{width:"100%",height:"100%"}})}),e.isRemoteVideoVisible&&Object(A.jsx)(f.a,{item:!0,xs:6,children:Object(A.jsx)("video",{autoPlay:!0,ref:e.remoteVideoRef,style:{width:"100%",height:"100%"}})}),Object(A.jsxs)(f.a,{item:!0,xs:12,container:!0,spacing:2,justify:"center",children:[Object(A.jsx)(f.a,{item:!0,xs:"auto",children:Object(A.jsx)(p.a,{onClick:e.handleToggleDevicesMuteStatus("video"),children:e.isVideoOn?Object(A.jsx)(x.a,{color:"primary"}):Object(A.jsx)(_.a,{color:"error"})})}),Object(A.jsx)(f.a,{item:!0,xs:"auto",children:Object(A.jsx)(p.a,{onClick:e.handleToggleDevicesMuteStatus("audio"),children:e.isAudioOn?Object(A.jsx)(N.a,{color:"primary"}):Object(A.jsx)(T.a,{color:"error"})})})]}),Object(A.jsx)(f.a,{item:!0,xs:12,children:Object(A.jsx)(h.a,{value:e.senderName,onChange:e.handleChangeSenderName,variant:"outlined",fullWidth:!0,autoFocus:!0,disabled:e.disableButtons.join})}),Object(A.jsx)(f.a,{item:!0,xs:"auto",children:Object(A.jsxs)(E.a,Object(o.a)(Object(o.a)({},I),{},{onClick:e.handleCall,disabled:e.disableButtons.call,children:["Call ",e.recipientName&&"to ".concat(e.recipientName)]}))}),Object(A.jsx)(f.a,{item:!0,xs:"auto",children:Object(A.jsx)(E.a,Object(o.a)(Object(o.a)({},I),{},{onClick:e.handleJoinLobby,disabled:e.disableButtons.join,children:e.disableButtons.join?"Joined":"Join"}))}),Object(A.jsx)(f.a,{item:!0,xs:"auto",children:Object(A.jsx)(E.a,Object(o.a)(Object(o.a)({},I),{},{onClick:e.handleHungUp,disabled:e.disableButtons.hungUp,children:"Hung up"}))})]}),Object(A.jsx)(y,{users:e.joinedUsers,myName:e.senderName,onSelectRecipient:e.handleSelectRecipient})]})},D=n(112),U=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,119)).then((function(t){var n=t.getCLS,r=t.getFID,a=t.getFCP,c=t.getLCP,i=t.getTTFB;n(e),r(e),a(e),c(e),i(e)}))};n(71);i.a.render(Object(A.jsxs)(A.Fragment,{children:[Object(A.jsx)(D.a,{}),Object(A.jsx)(k,{})]}),document.getElementById("root")),U()}},[[72,1,2]]]);
//# sourceMappingURL=main.5b5c314e.chunk.js.map