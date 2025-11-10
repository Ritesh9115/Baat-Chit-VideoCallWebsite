import React, { useEffect, useRef, useState } from "react";
import "../videoMeet.css";
import { io } from "socket.io-client";

import {
    Button,
    IconButton,
    TextField,
    Tooltip,
    InputAdornment,
    Box,
} from "@mui/material";

import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import CallEndIcon from "@mui/icons-material/CallEnd";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import {server} from "../environment.js";

const server_url = server;

const peerConfigConnections = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

let connections = {};

function DraggableVideo({ children }) {
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const dragOffsetRef = useRef({ x: 0, y: 0 });
    const nodeRef = useRef(null);

    const getCoords = (e) => (e.touches ? e.touches[0] : e);

    const start = (e) => {
        if (e.button === 0 || (e.touches && e.touches.length === 1)) {
            const c = getCoords(e);
            const rect = nodeRef.current.getBoundingClientRect();
            dragOffsetRef.current = { x: c.clientX - rect.left, y: c.clientY - rect.top };
            setIsDragging(true);
            e.preventDefault();
        }
    };

    const move = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const c = getCoords(e);
        const rect = nodeRef.current.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        const minVisible = 0.25;
        const minW = rect.width * minVisible;
        const minH = rect.height * minVisible;

        let x = c.clientX - dragOffsetRef.current.x;
        let y = c.clientY - dragOffsetRef.current.y;

        const minX = -(rect.width - minW);
        const maxX = vw - minW;
        const minY = -(rect.height - minH);
        const maxY = vh - minH;

        x = Math.max(minX, Math.min(x, maxX));
        y = Math.max(minY, Math.min(y, maxY));

        setPosition({ x, y });
    };

    const end = () => setIsDragging(false);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", move);
            window.addEventListener("mouseup", end);
            window.addEventListener("touchmove", move, { passive: false });
            window.addEventListener("touchend", end);
        }
        return () => {
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseup", end);
            window.removeEventListener("touchmove", move);
            window.removeEventListener("touchend", end);
        };
    }, [isDragging]);

    return (
        <div
            ref={nodeRef}
            className={`draggable-video-wrapper ${isDragging ? "dragging" : ""}`}
            style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
            onMouseDown={start}
            onTouchStart={start}
        >
            {children}
        </div>
    );
}

function ChatWindow({ onClose, messages, onSend }) {
    const [text, setText] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            onSend(text);
            setText("");
        }
    };

    return (
        <div className="chat-window">
            <div className="chat-header">
                <h3>In-call messages</h3>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </div>
            <div className="chat-messages-list">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`chat-message-item ${msg.type === 'local' ? 'local' : 'remote'}`}
                    >
                        <div className="message-sender">
                            {msg.type === 'local' ? 'You' : msg.sender}
                        </div>
                        <div className="message-text">{msg.text}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form className="chat-input-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Send a message"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <IconButton type="submit" disabled={!text.trim()}>
                    <SendIcon />
                </IconButton>
            </form>
        </div>
    );
}

function MeetingInfoCopy() {
    const [copySuccess, setCopySuccess] = useState('');
    const meetingCode = window.location.pathname.replace("/", "");
    const meetingLink = window.location.href;

    const handleCopyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess(field);
            setTimeout(() => {
                setCopySuccess('');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    };

    const copyableTextFieldSx = {
        cursor: 'pointer',
        '& .MuiInputBase-input': {
            color: '#f1f1f1',
            cursor: 'pointer',
        },
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: '#5f6368',
            },
            '&:hover fieldset': {
                borderColor: '#9aa0a6',
            },
        },
        '& .MuiInputLabel-root': {
            color: '#9aa0a6',
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 360 }}>
            <Tooltip title={copySuccess === 'code' ? "Copied!" : "Click to copy code"} placement="top">
                <TextField
                    id="meeting-code"
                    label="Meeting Code"
                    value={meetingCode}
                    fullWidth
                    variant="outlined"
                    onClick={() => handleCopyToClipboard(meetingCode, 'code')}
                    sx={copyableTextFieldSx}
                    InputProps={{
                        readOnly: true,
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="copy meeting code"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyToClipboard(meetingCode, 'code');
                                    }}
                                    edge="end"
                                >
                                    {copySuccess === 'code' ?
                                        <CheckIcon color="success" /> :
                                        <ContentCopyIcon sx={{ color: '#9aa0a6' }} />
                                    }
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </Tooltip>
            <Tooltip title={copySuccess === 'link' ? "Copied!" : "Click to copy link"} placement="bottom">
                <TextField
                    id="meeting-link"
                    label="Meeting Link"
                    value={meetingLink}
                    fullWidth
                    variant="outlined"
                    onClick={() => handleCopyToClipboard(meetingLink, 'link')}
                    sx={copyableTextFieldSx}
                    InputProps={{
                        readOnly: true,
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="copy meeting link"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyToClipboard(meetingLink, 'link');
                                    }}
                                    edge="end"
                                >
                                    {copySuccess === 'link' ?
                                        <CheckIcon color="success" /> :
                                        <ContentCopyIcon sx={{ color: '#9aa0a6' }} />
                                    }
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </Tooltip>
        </Box>
    );
}

export default function VideomeetComponent() {
    const socketRef = useRef(null);
    const socketIdRef = useRef(null);

    const localVideoRef = useRef(null);
    const videosRef = useRef([]);

    const [videoAvailable, setVideoAvailable] = useState(true);
    const [audioAvailable, setAudioAvailable] = useState(true);

    const [video, setVideo] = useState(true);
    const [audio, setAudio] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    const [askForUsername, setAskForUsername] = useState(true);
    const [username, setUsername] = useState("");

    const [videos, setVideos] = useState([]);
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState([]);

    const silence = () => {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        const ctx = new Ctx();
        const osc = ctx.createOscillator();
        const dst = osc.connect(ctx.createMediaStreamDestination());
        osc.start();
        ctx.resume();
        const track = dst.stream.getAudioTracks()[0];
        track.enabled = false;
        return track;
    };

    const black = ({ width = 640, height = 480 } = {}) => {
        const canvas = Object.assign(document.createElement("canvas"), { width, height });
        const g = canvas.getContext("2d");
        g.fillStyle = "black";
        g.fillRect(0, 0, width, height);
        const stream = canvas.captureStream();
        const track = stream.getVideoTracks()[0];
        track.enabled = false;
        return track;
    };

    const blackSilenceStream = (...args) => new MediaStream([black(...args), silence()]);

    const attachLocalVideo = () => {
        const el = localVideoRef.current;
        if (!el) return;
        if (window.localStream && el.srcObject !== window.localStream) {
            el.srcObject = window.localStream;
        }
        el.muted = true;
        el.playsInline = true;
        const p = el.play();
        if (p && typeof p.catch === "function") p.catch(() => { });
    };

    const getPermission = async () => {
        try {
            let canVideo = false;
            let canAudio = false;

            try {
                const v = await navigator.mediaDevices.getUserMedia({ video: true });
                v.getTracks().forEach((t) => t.stop());
                canVideo = true;
            } catch {
                canVideo = false;
            }
            setVideoAvailable(canVideo);

            try {
                const a = await navigator.mediaDevices.getUserMedia({ audio: true });
                a.getTracks().forEach((t) => t.stop());
                canAudio = true;
            } catch {
                canAudio = false;
            }
            setAudioAvailable(canAudio);

            if (canVideo || canAudio) {
                window.localStream = await navigator.mediaDevices.getUserMedia({
                    video: canVideo,
                    audio: canAudio,
                });
            } else {
                window.localStream = blackSilenceStream();
            }

            const vTrack = window.localStream.getVideoTracks()[0];
            if (vTrack) vTrack.enabled = video;
            const aTrack = window.localStream.getAudioTracks()[0];
            if (aTrack) aTrack.enabled = audio;

            attachLocalVideo();
        } catch (e) {
            console.log(e);
        }
    };

    const replaceOutgoingTracks = (stream) => {
        Object.values(connections).forEach((pc) => {
            const senders = pc.getSenders();
            const newV = stream.getVideoTracks()[0] || null;
            const newA = stream.getAudioTracks()[0] || null;

            const vSender = senders.find((s) => s.track && s.track.kind === "video");
            if (vSender) {
                vSender.replaceTrack(newV);
            } else if (newV) {
                pc.addTrack(newV, stream);
            }

            const aSender = senders.find((s) => s.track && s.track.kind === "audio");
            if (aSender) {
                aSender.replaceTrack(newA);
            } else if (newA) {
                pc.addTrack(newA, stream);
            }
        });
    };

    const toggleVideo = () => {
        setVideo((prev) => {
            const next = !prev;
            const track = window.localStream?.getVideoTracks?.()[0];
            if (track) track.enabled = next;
            return next;
        });
    };

    const toggleAudio = () => {
        setAudio((prev) => {
            const next = !prev;
            const track = window.localStream?.getAudioTracks?.()[0];
            if (track) track.enabled = next;
            return next;
        });
    };

    const toggleChat = () => {
        setShowChat(prev => !prev);
    };

    const startScreenShare = async () => {
        try {
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: { frameRate: 30 },
                audio: false,
            });

            const [displayTrack] = displayStream.getVideoTracks();
            displayTrack.onended = () => stopScreenShare();

            const micTrack = window.localStream?.getAudioTracks?.()[0];
            const combined = new MediaStream([displayTrack, ...(micTrack ? [micTrack] : [])]);
            window.localStream = combined;

            attachLocalVideo();
            replaceOutgoingTracks(combined);
            setIsScreenSharing(true);
        } catch (e) {
            console.log(e);
        }
    };

    const stopScreenShare = async () => {
        try {
            const cam = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: audio,
            });

            const vTrack = cam.getVideoTracks()[0];
            if (vTrack) vTrack.enabled = video;
            const aTrack = cam.getAudioTracks()[0];
            if (aTrack) aTrack.enabled = audio;

            try {
                const old = localVideoRef.current?.srcObject;
                old?.getTracks?.().forEach((t) => {
                    if (t.kind === "video" && t.label.toLowerCase().includes("screen")) t.stop();
                });
            } catch { }

            window.localStream = cam;
            attachLocalVideo();
            replaceOutgoingTracks(cam);
            setIsScreenSharing(false);
        } catch (e) {
            console.log(e);
        }
    };

    const toggleScreenShare = () =>
        isScreenSharing ? stopScreenShare() : startScreenShare();

    const hangUp = () => {
        try {
            Object.values(connections).forEach((pc) => pc.close());
            connections = {};
        } catch { }

        try {
            window.localStream?.getTracks()?.forEach((t) => t.stop());
        } catch { }

        try {
            socketRef.current?.disconnect();
        } catch { }

        setVideos([]);
        setIsScreenSharing(false);
        setAskForUsername(true);
        setMessages([]);
        setShowChat(false);

        window.location.href = "/home";
    };

    const sendChatMessage = (text) => {
        if (text.trim() === "") return;
        const messageData = {
            text: text,
            sender: username || 'Anonymous',
            socketId: socketIdRef.current
        };

        socketRef.current.emit('chat-message', messageData);
        setMessages((prev) => [...prev, { ...messageData, type: 'local', id: Date.now() }]);
    };

    const gotMessageFromServer = async (fromId, msg) => {
        try {
            const signal = JSON.parse(msg);
            if (fromId === socketIdRef.current) return;

            const pc = connections[fromId];
            if (!pc) return;

            if (signal.sdp) {
                await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
                if (signal.sdp.type === "offer") {
                    const description = await pc.createAnswer();
                    await pc.setLocalDescription(description);
                    socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({ sdp: pc.localDescription })
                    );
                }
            }

            if (signal.ice) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(signal.ice));
                } catch (e) {
                    console.log(e);
                }
            }
        } catch (e) {
            console.log(e);
        }
    };

    const connectToSocketServer = () => {
        socketRef.current = io(server_url, { secure: false });
        socketRef.current.on("signal", gotMessageFromServer);

        socketRef.current.on("connect", () => {
            socketRef.current.emit("join-call", window.location.href, username);
            socketIdRef.current = socketRef.current.id;

            socketRef.current.on("chat-message", (messageData) => {
                if (messageData.socketId === socketIdRef.current) {
                    return;
                }
                setMessages((prev) => [...prev, { ...messageData, type: 'remote', id: Date.now() }]);
            });

            socketRef.current.on("user-left", (id) => {
                setVideos((old) => {
                    const next = old.filter((v) => v.socketId !== id);
                    videosRef.current = next;
                    return next;
                });
                if (connections[id]) {
                    try {
                        connections[id].close();
                    } catch { }
                    delete connections[id];
                }
            });

            socketRef.current.on("user-joined", async (id, clients, userMap) => {
                clients.forEach((socketListId) => {
                    if (connections[socketListId]) return;

                    const pc = new RTCPeerConnection(peerConfigConnections);
                    connections[socketListId] = pc;

                    const stream = window.localStream || blackSilenceStream();
                    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

                    pc.onicecandidate = (event) => {
                        if (event.candidate) {
                            socketRef.current.emit(
                                "signal",
                                socketListId,
                                JSON.stringify({ ice: event.candidate })
                            );
                        }
                    };

                    pc.ontrack = (event) => {
                        const remoteStream = event.streams[0];
                        setVideos((prev) => {
                            const exists = prev.find((v) => v.socketId === socketListId);
                            const remoteUsername = userMap ? userMap[socketListId] : null;

                            if (exists) {
                                const updated = prev.map((v) =>
                                    v.socketId === socketListId ? { ...v, stream: remoteStream, username: remoteUsername } : v
                                );
                                videosRef.current = updated;
                                return updated;
                            } else {
                                const next = [
                                    ...prev,
                                    {
                                        socketId: socketListId,
                                        stream: remoteStream,
                                        username: remoteUsername,
                                        autoplay: true,
                                        playsinline: true,
                                    },
                                ];
                                videosRef.current = next;
                                return next;
                            }
                        });
                    };
                });

                if (id !== socketIdRef.current) {
                    for (const id2 of Object.keys(connections)) {
                        if (id2 === socketIdRef.current) continue;
                        const pc = connections[id2];
                        try {
                            const offer = await pc.createOffer();
                            await pc.setLocalDescription(offer);
                            socketRef.current.emit(
                                "signal",
                                id2,
                                JSON.stringify({ sdp: pc.localDescription })
                            );
                        } catch (e) {
                            console.log(e);
                        }
                    }
                }
            });
        });
    };

    const getMediaAndConnect = async () => {
        if (!window.localStream) {
            await getPermission();
        } else {
            attachLocalVideo();
        }
        connectToSocketServer();
    };

    const connect = () => {
        setAskForUsername(false);
        getMediaAndConnect();
    };

    useEffect(() => {
        getPermission();
        return () => {
            try {
                Object.values(connections).forEach((pc) => pc.close());
                connections = {};
            } catch { }
            try {
                window.localStream?.getTracks()?.forEach((t) => t.stop());
            } catch { }
            try {
                socketRef.current?.disconnect();
            } catch { }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        attachLocalVideo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [askForUsername]);

    return (
        <>
            <div>
                {askForUsername ? (
                    <div className="lobby-container">
                        <TextField
                            id="username"
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            variant="outlined"
                            sx={{ width: 360 }}
                        />

                        <Button variant="contained" onClick={connect} id="connect">
                            Connect
                        </Button>

                        <div className="lobby-video-wrapper">
                            <video
                                className="lobby-video-preview"
                                ref={localVideoRef}
                                autoPlay
                                muted
                                playsInline
                            />
                        </div>

                        <MeetingInfoCopy />

                    </div>
                ) : (
                    <div className={`meetVideoContainer ${showChat ? 'chat-visible' : ''}`}>
                        <div className="buttonContainer">
                            <Tooltip title={video ? "Turn camera off" : "Turn camera on"}>
                                <IconButton onClick={toggleVideo}>
                                    {video ? <VideocamIcon /> : <VideocamOffIcon />}
                                </IconButton>
                            </Tooltip>

                            <Tooltip title={audio ? "Mute microphone" : "Unmute microphone"}>
                                <IconButton onClick={toggleAudio}>
                                    {audio ? <MicIcon /> : <MicOffIcon />}
                                </IconButton>
                            </Tooltip>

                            <Tooltip title={isScreenSharing ? "Stop sharing" : "Share screen"}>
                                <IconButton onClick={toggleScreenShare}>
                                    {isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                                </IconButton>
                            </Tooltip>

                            <Tooltip title={showChat ? "Hide chat" : "Show chat"}>
                                <IconButton onClick={toggleChat}>
                                    <ChatIcon />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Hang up">
                                <IconButton onClick={hangUp} color="error">
                                    <CallEndIcon />
                                </IconButton>
                            </Tooltip>
                        </div>

                        <DraggableVideo>
                            <video
                                className="meetUserContainer"
                                ref={localVideoRef}
                                autoPlay
                                muted
                                playsInline
                            />
                        </DraggableVideo>

                        <div className={`remote-videos-grid ${videos.length === 1 ? 'spotlight-layout' : ''}`}>
                            {videos.map((v) => (
                                <div key={v.socketId} className="remote-video-item">
                                    <h2>{v.username || v.socketId}</h2>
                                    <video
                                        className="remote-video"
                                        data-socket={v.socketId}
                                        ref={(ref) => {
                                            if (ref && v.stream && ref.srcObject !== v.stream) {
                                                ref.srcObject = v.stream;
                                                const p = ref.play();
                                                if (p && typeof p.catch === "function") p.catch(() => { });
                                            }
                                        }}
                                        autoPlay
                                        playsInline
                                    />
                                </div>
                            ))}
                        </div>

                        {showChat && (
                            <ChatWindow
                                messages={messages}
                                onClose={() => setShowChat(false)}
                                onSend={sendChatMessage}
                            />
                        )}
                    </div>
                )}
            </div>
        </>
    );
}