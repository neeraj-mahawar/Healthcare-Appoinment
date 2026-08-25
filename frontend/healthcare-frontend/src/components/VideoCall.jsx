import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AgoraRTC from "agora-rtc-sdk-ng";
import { Maximize2, Minimize2 } from "lucide-react";

import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  User,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

export default function VideoCall() {
  const { id } = useParams();
  const navigate = useNavigate();

  const localVideoRef = useRef(null);
  const localVideoPipRef = useRef(null);
  const [remoteUsers, setRemoteUsers] = useState(new Map());
  const [timeLeft, setTimeLeft] = useState(null);
  const [canJoin, setCanJoin] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);
  const [doctorName, setDoctorName] = useState("");
  const [patientName, setPatientName] = useState("");
  const [isMainLocal, setIsMainLocal] = useState(true);
  const [pipPosition, setPipPosition] = useState({ x: 20, y: 20 });
  const pipRef = useRef(null);
  const clientRef = useRef(null);
  const localTracksRef = useRef([]);
  const localUidRef = useRef(null);
  const appId = process.env.REACT_APP_AGORA_APP_ID;
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isUIVisible, setIsUIVisible] = useState(true);
  const uiTimeoutRef = useRef(null);
  const videoContainerRef = useRef(null);

  const switchVideos = () => {
    setIsMainLocal((prev) => !prev);
  };

  // Re-attach video tracks when switching views or fullscreen
  useEffect(() => {
    const reattachLocalVideo = () => {
      const camTrack = localTracksRef.current[1];
      if (!camTrack || !cameraOn) return;

      try {
        // Stop playing in all containers first
        camTrack.stop();

        // Determine which ref to use based on current state
        let targetRef = null;
        if (isFullscreen) {
          targetRef = isMainLocal ? localVideoRef : localVideoPipRef;
        } else {
          targetRef = localVideoRef;
        }

        // Play in the correct container
        if (targetRef?.current) {
          camTrack.play(targetRef.current);
        }
      } catch (err) {
        console.error("Error reattaching local video:", err);
      }
    };

    const reattachRemoteVideos = () => {
      remoteUsers.forEach((user) => {
        if (user.videoTrack) {
          // Find any container with this user's uid in the ID
          const containers = document.querySelectorAll(`[id*="remote"][id*="${user.uid}"]`);
          
          containers.forEach((container) => {
            try {
              if (user.videoTrack.isPlaying) {
                user.videoTrack.stop();
              }
              user.videoTrack.play(container);
            } catch (err) {
              console.error("Error reattaching remote video to container:", container.id, err);
            }
          });
        }
      });
    };

    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      reattachLocalVideo();
      reattachRemoteVideos();
    }, 100);

    return () => clearTimeout(timer);
  }, [isMainLocal, isFullscreen, remoteUsers, cameraOn]);

useEffect(() => {
  const pip = pipRef.current;
  if (!pip) return;

  let offsetX, offsetY, isDragging = false;

  const onMouseDown = (e) => {
    isDragging = true;
    offsetX = e.clientX - pip.offsetLeft;
    offsetY = e.clientY - pip.offsetTop;
    pip.style.cursor = "grabbing";
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    setPipPosition({
      x: Math.max(0, Math.min(window.innerWidth - pip.offsetWidth, e.clientX - offsetX)),
      y: Math.max(0, Math.min(window.innerHeight - pip.offsetHeight, e.clientY - offsetY)),
    });
  };

  const onMouseUp = () => {
    isDragging = false;
    pip.style.cursor = "grab";
  };

  pip.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);

  return () => {
    pip.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };
}, []);

const toggleFullscreen = async () => {
  const container = videoContainerRef.current;
  if (!container) return;

  try {
    if (!document.fullscreenElement) {
      // Smooth zoom-in transition
      container.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.05)" }],
        { duration: 200, easing: "ease-in-out" }
      );

      await container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      // Smooth zoom-out transition
      await document.exitFullscreen();

      container.animate(
        [{ transform: "scale(1.05)" }, { transform: "scale(1)" }],
        { duration: 200, easing: "ease-in-out" }
      );

      setIsFullscreen(false);
    }
  } catch (err) {
    console.error("Fullscreen toggle failed:", err);
  }
};


useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key.toLowerCase() === "f") {
      toggleFullscreen();
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);


// 👇 Auto-hide UI in fullscreen
useEffect(() => {
  if (!isFullscreen) return;

  const handleMouseMove = () => {
    setIsUIVisible(true);
    clearTimeout(uiTimeoutRef.current);
    uiTimeoutRef.current = setTimeout(() => setIsUIVisible(false), 3000);
  };

  window.addEventListener("mousemove", handleMouseMove);
  uiTimeoutRef.current = setTimeout(() => setIsUIVisible(false), 3000);

  return () => {
    window.removeEventListener("mousemove", handleMouseMove);
    clearTimeout(uiTimeoutRef.current);
  };
}, [isFullscreen]);


  // Validate appointment id
  useEffect(() => {
    if (!id || id === "undefined") {
      alert("Invalid appointment ID. Please book again.");
      navigate("/doctor/appointments");
    }
  }, [id, navigate]);

  // Fetch Agora token from backend
  useEffect(() => {
    if (!id || id === "undefined") return;
    const fetchVideoAccess = async () => {
      try {
         console.log("🧠 Role:", localStorage.getItem("role"));
  console.log("👨‍⚕️ Doctor:", doctorName);
  console.log("🧍 Patient:", patientName);
        const res = await fetch(`${backendUrl}/api/video/${id}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          if (res.status === 403 && data.startTime) {
            const startTime = new Date(data.startTime);
            const now = new Date();
            const secondsLeft = Math.max(
              0,
              Math.floor((startTime.getTime() - now.getTime()) / 1000)
            );
            setTimeLeft(secondsLeft);
            setCanJoin(false);
            setIsConnecting(false);
            return;
          }
          alert(data.message || "Cannot join video call now.");
          navigate("/doctor/appointments");
          return;
        }

        setCanJoin(true);
        await initAgora(data.channel, data.token, data.uid);
        setDoctorName(data.doctorName);
setPatientName(data.patientName);

      } catch (err) {
        console.error("❌ Error fetching video token:", err);
        alert("Error fetching video details. Please try again later.");
        navigate("/doctor/appointments");
      }
    };
    fetchVideoAccess();
  }, [id, backendUrl, navigate]);

  // Countdown until call starts
  useEffect(() => {
    if (timeLeft === null || canJoin) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanJoin(true);
          window.location.reload();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, canJoin]);

  // Initialize Agora
  const initAgora = async (channel, token, uid) => {
    try {
      console.log("🟢 Joining Agora channel:", channel);
      clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

      // Remote user joined (for debug)
      clientRef.current.on("user-joined", (user) => {
        console.log("👤 Remote user joined:", user.uid);
      });

      // Safe subscribe handler
      clientRef.current.on("user-published", async (user, mediaType) => {
        try {
          if (!user || !user.uid || user.uid === localUidRef.current) return;

          // Wait briefly to ensure the remote user has fully joined
          await new Promise((res) => setTimeout(res, 500));

          await clientRef.current.subscribe(user, mediaType);
          console.log("✅ Subscribed to remote user:", user.uid, mediaType);

          setRemoteUsers((prev) => {
            const updated = new Map(prev);
            updated.set(user.uid, user);
            return updated;
          });

          if (mediaType === "video" && user.videoTrack) {
            // Find any container with this user's uid in the ID
            const containers = document.querySelectorAll(`[id*="remote"][id*="${user.uid}"]`);
            if (containers.length > 0) {
              containers.forEach((container) => {
                try {
                  user.videoTrack.play(container);
                } catch (err) {
                  console.error("Error playing video in container:", container.id, err);
                }
              });
            }
          }

          if (mediaType === "audio" && user.audioTrack) {
            user.audioTrack.play();
          }
        } catch (err) {
          console.warn(
            "⚠️ Failed to subscribe to user:",
            user?.uid,
            err.message
          );
        }
      });

      clientRef.current.on("user-unpublished", (user) => {
        console.log("❌ Remote user unpublished:", user.uid);
        setRemoteUsers((prev) => {
          const map = new Map(prev);
          map.delete(user.uid);
          return map;
        });
      });

      await clientRef.current.join(appId, channel, token, uid);
      localUidRef.current = uid;

      const [micTrack, camTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      localTracksRef.current = [micTrack, camTrack];

      if (localVideoRef.current && camTrack && !camTrack.isPlaying) {
        camTrack.play(localVideoRef.current);
      }

      await clientRef.current.publish(localTracksRef.current);
      console.log("📡 Local tracks published.");
      setIsConnecting(false);
    } catch (err) {
      console.error("🚨 Agora init error:", err);
      alert("Failed to join video call. Check mic/camera permissions.");
      setIsConnecting(false);
    }
  };

  // Controls
  const toggleMic = () => {
    const micTrack = localTracksRef.current[0];
    if (micTrack) {
      micTrack.setEnabled(!micOn);
      setMicOn(!micOn);
    }
  };

  const toggleCamera = () => {
    const camTrack = localTracksRef.current[1];
    if (camTrack) {
      camTrack.setEnabled(!cameraOn);
      setCameraOn(!cameraOn);
    }
  };

 const endCall = async () => {
  try {
    localTracksRef.current.forEach((track) => {
      track.stop();
      track.close();
    });

    if (clientRef.current) {
      await clientRef.current.unpublish(localTracksRef.current);
      clientRef.current.removeAllListeners();
      await clientRef.current.leave();
    }

    const role = localStorage.getItem("role"); // ✅ fixed key name
    console.log("🎯 Role detected:", role);

    if (role === "doctor") {
      navigate("/doctor/profile"); // ✅ redirect doctor
    } else {
      navigate("/call-ended");
    }
  } catch (err) {
    console.error("❌ Error ending call:", err);
    navigate("/call-ended");
  }
};

  // Cleanup
  useEffect(() => {
    return () => {
      if (clientRef.current) clientRef.current.leave();
      localTracksRef.current.forEach((t) => {
        t.stop();
        t.close();
      });
    };
  }, []);

  // Render remote video when new users appear
  useEffect(() => {
    remoteUsers.forEach((user) => {
      if (user.videoTrack) {
        // Find all containers with this user's uid
        const containers = document.querySelectorAll(`[id*="remote"][id*="${user.uid}"]`);
        containers.forEach((container) => {
          if (!user.videoTrack.isPlaying || !container.querySelector('video')) {
            try {
              user.videoTrack.play(container);
            } catch (err) {
              console.error("Error rendering remote video:", err);
            }
          }
        });
      }
    });
  }, [remoteUsers]);

  const remoteUsersArray = Array.from(remoteUsers.values());
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // 🟢 UI
  return (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-purple-50 to-green-100 relative overflow-hidden">
    {/* Animated background */}
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/symphony.png')] opacity-10 pointer-events-none" />
    <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-blue-500/10 to-purple-500/20 animate-pulse" style={{ animationDuration: '8s' }} />
    <div className="absolute top-20 left-20 w-96 h-96 bg-green-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
    <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s', animationDelay: '1s' }} />

    {/* HEADER */}
   <header className="relative flex justify-between items-center w-full max-w-6xl px-8 py-5 mt-4 mb-8 bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-2xl z-10 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300">
    <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-2xl" />
<div className="relative z-10">
  <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-4 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-md">
    <div className="relative flex items-center justify-center">
      <div className="absolute w-8 h-8 bg-green-400 rounded-full blur-lg opacity-40 animate-pulse" />
      <Stethoscope className="relative text-green-600 w-8 h-8 drop-shadow-lg" />
    </div>
    TeleConsultation
  </h1>
  <div className="mt-4 flex items-center gap-3">
    <div className="relative group flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-green-100/80 to-blue-100/80 backdrop-blur-xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative flex items-center justify-center w-3 h-3">
        <div className="absolute w-4 h-4 bg-green-400 rounded-full animate-ping opacity-75" />
        <div className="relative w-2.5 h-2.5 bg-green-600 rounded-full shadow-lg" />
      </div>
      <span className="relative text-sm font-bold text-gray-800 tracking-wide">
        <span className="text-green-700 font-extrabold">Active Session</span> · 
        <span className="ml-1 font-mono text-gray-700 bg-white/70 px-3 py-1 rounded-lg shadow-sm">
          {id?.slice(0, 8).toUpperCase()}
        </span>
      </span>
    </div>
  </div>
</div>



     {canJoin && (
  <div className="relative group flex items-center gap-3 px-6 py-2.5 rounded-full bg-gradient-to-r from-green-100 via-green-50 to-green-100 border-2 border-green-300 shadow-[0_4px_20px_rgba(34,197,94,0.3)] hover:shadow-[0_6px_30px_rgba(34,197,94,0.4)] transition-all duration-300">
    <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative">
      <div className="absolute inset-0 rounded-full bg-green-400 opacity-75 animate-ping" />
      <div className="relative w-3.5 h-3.5 bg-green-600 rounded-full shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
    </div>
    <span className="relative text-green-800 font-bold tracking-wide flex items-center gap-2 text-base">
      <span className="uppercase text-xs font-extrabold">●</span> Live Now
    </span>
  </div>
)}

    </header>

  {/* COUNTDOWN */}
{timeLeft !== null && !canJoin && (
  <div className="relative group flex items-center gap-4 bg-gradient-to-r from-yellow-100 via-amber-100 to-yellow-100 border-2 border-yellow-400/60 text-yellow-900 px-10 py-5 rounded-2xl mb-10 shadow-[0_8px_30px_rgba(234,179,8,0.2)] hover:shadow-[0_10px_40px_rgba(234,179,8,0.3)] transition-all duration-300 z-10">
    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-amber-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative">
      <div className="absolute inset-0 rounded-full bg-yellow-400 opacity-60 animate-ping" />
      <div className="relative w-5 h-5 bg-yellow-600 rounded-full shadow-[0_0_12px_rgba(234,179,8,0.8)]" />
    </div>
    <span className="relative text-lg font-bold flex items-center gap-2">
      ⏳ Consultation starts in{" "}
      <span className="font-mono bg-yellow-200/90 text-yellow-900 px-4 py-2 rounded-xl shadow-lg animate-pulse font-extrabold text-xl">
        {formatTime(timeLeft)}
      </span>
    </span>
  </div>
)}

    {/* VIDEO GRID */}
<main
 ref={videoContainerRef}
  className={`relative grid transition-all duration-700 ease-in-out w-full ${
    isFullscreen
      ? "grid-cols-1 h-screen fixed top-0 left-0 w-screen bg-black z-50"
      : "grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mb-8"
  }`}
>
  {isFullscreen ? (
    // FULLSCREEN MODE - Main + Draggable PiP
    <>
      {/* MAIN VIDEO (Large) */}
      <div className="relative w-full h-full bg-black">
        {isMainLocal ? (
          // Show local video as main
          <>
            <div ref={localVideoRef} className="w-full h-full bg-black" key="local-main" />
    {isConnecting && (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-black/60 to-gray-900/60 text-white backdrop-blur-xl">
        <div className="relative">
          <div className="absolute inset-0 w-16 h-16 border-4 border-green-400/30 rounded-full animate-ping" />
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="mt-4 text-lg font-semibold tracking-wide">Connecting your camera...</p>
      </div>
    )}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-5 py-3 rounded-xl text-white text-sm flex items-center gap-3">
              <User size={18} className="text-green-400" />
              <span className="font-semibold">
                {localStorage.getItem("role") === "doctor" ? doctorName || "Dr. You" : patientName || "You"}
              </span>
              <span className="text-xs text-gray-300 bg-white/20 px-2 py-1 rounded-full">(You)</span>
            </div>
          </>
        ) : (
          // Show remote video as main
          <>
            {remoteUsersArray.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <User size={64} className="mb-3 opacity-60" />
                Waiting for participant to join...
              </div>
            ) : (
              remoteUsersArray.map((user) => (
                <div key={`remote-main-${user.uid}`} id={`remote-${user.uid}`} className="w-full h-full bg-black" />
              ))
            )}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-5 py-3 rounded-xl text-white text-sm flex items-center gap-3">
              <User size={18} className="text-blue-400" />
              <span className="font-semibold">
                {localStorage.getItem("role") === "doctor" ? patientName || "Patient" : doctorName || "Doctor"}
              </span>
            </div>
          </>
        )}
      </div>

      {/* DRAGGABLE PiP (Small) */}
      <div
        ref={pipRef}
        onClick={switchVideos}
        style={{
          position: 'fixed',
          left: `${pipPosition.x}px`,
          top: `${pipPosition.y}px`,
          zIndex: 100
        }}
        className="w-72 h-48 rounded-xl overflow-hidden shadow-2xl border-4 border-white/30 bg-black/80 backdrop-blur-sm transition-all duration-300 cursor-grab hover:border-green-400 hover:scale-105"
        title="Click to switch • Drag to move"
      >
        {isMainLocal ? (
          // Show remote in PiP
          <>
            {remoteUsersArray.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                <User size={32} className="mb-1 opacity-60" />
                Waiting...
              </div>
            ) : (
              remoteUsersArray.map((user) => (
                <div key={`remote-pip-${user.uid}`} id={`remote-pip-${user.uid}`} className="w-full h-full" />
              ))
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-3 py-2 text-xs text-white flex justify-between items-center">
              <span>{localStorage.getItem("role") === "doctor" ? patientName : doctorName}</span>
              {remoteUsersArray.length > 0 && <span className="text-green-400">🟢</span>}
            </div>
          </>
        ) : (
          // Show local in PiP
          <>
            <div ref={localVideoPipRef} className="w-full h-full bg-black" key="local-pip" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-3 py-2 text-xs text-white flex justify-between items-center">
              <span>{localStorage.getItem("role") === "doctor" ? doctorName || "Dr. You" : patientName || "You"} (You)</span>
              <span className="text-xs text-green-400">{micOn ? "🎤" : "🔇"}</span>
            </div>
          </>
        )}
        
        {/* Switch indicator */}
        <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 hover:opacity-100 transition-opacity">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </div>
      </div>
    </>
  ) : (
    // NORMAL MODE - Side by Side with Switch Button
    <>
      {/* MAIN/PRIMARY VIDEO */}
      <div 
        className="relative overflow-hidden border-2 border-green-300/60 shadow-2xl bg-gradient-to-br from-green-100 via-white to-blue-100 rounded-3xl cursor-pointer hover:border-green-400 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
        onClick={switchVideos}
        title="Click to switch videos"
      >
        {isMainLocal ? (
          // Local video as primary
          <>
            <div ref={localVideoRef} className="w-full h-[420px] bg-black" key="local-normal" />
            {isConnecting && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-black/60 to-gray-900/60 text-white backdrop-blur-xl">
                <div className="relative">
                  <div className="absolute inset-0 w-16 h-16 border-4 border-green-400/30 rounded-full animate-ping" />
                  <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="mt-4 text-lg font-semibold tracking-wide">Connecting your camera...</p>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-5 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full">
                <User size={18} className="text-green-400" />
                <span className="font-semibold text-base">
                  {localStorage.getItem("role") === "doctor" ? doctorName || "Dr. You" : patientName || "You"}
                </span>
                <span className="text-xs text-gray-300 bg-white/20 px-2 py-1 rounded-full">(You)</span>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold ${micOn ? 'bg-green-500/90' : 'bg-red-500/90'} backdrop-blur-md`}>
                {micOn ? "🎤 Mic On" : "🔇 Muted"}
              </div>
            </div>
            {/* PRIMARY Badge */}
            <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-green-600 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-extrabold shadow-xl">
              PRIMARY VIEW
            </div>
          </>
        ) : (
          // Remote video as primary
          <>
            {remoteUsersArray.length === 0 ? (
              <div className="w-full h-[420px] bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center text-gray-400">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-2xl animate-pulse" />
                  <User size={64} className="relative opacity-80" />
                </div>
                <p className="text-lg font-semibold">Waiting for participant to join...</p>
              </div>
            ) : (
              remoteUsersArray.map((user) => (
                <div key={`remote-normal-main-${user.uid}`} id={`remote-${user.uid}`} className="w-full h-[420px] bg-black" />
              ))
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-5 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full">
                <User size={18} className="text-blue-400" />
                <span className="font-semibold text-base">
                  {localStorage.getItem("role") === "doctor" ? patientName || "Patient" : doctorName || "Doctor"}
                </span>
              </div>
              {remoteUsersArray.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/90 backdrop-blur-md font-bold">
                  🟢 Connected
                </div>
              )}
            </div>
            <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-500 to-blue-600 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-extrabold shadow-xl">
              PRIMARY VIEW
            </div>
          </>
        )}
        
        {/* Switch icon overlay */}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2 opacity-0 hover:opacity-100 transition-opacity">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </div>
      </div>

      {/* SECONDARY VIDEO */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-blue-300/60 shadow-2xl bg-gradient-to-br from-blue-100 via-white to-purple-100 hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-300">
        {!isMainLocal ? (
          // Local video as secondary
          <>
            <div ref={localVideoRef} className="w-full h-[420px] bg-black" key="local-normal-secondary" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-5 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full">
                <User size={18} className="text-green-400" />
                <span className="font-semibold text-base">
                  {localStorage.getItem("role") === "doctor" ? doctorName || "Dr. You" : patientName || "You"}
                </span>
                <span className="text-xs text-gray-300 bg-white/20 px-2 py-1 rounded-full">(You)</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-sm ${micOn ? 'bg-green-500/90' : 'bg-red-500/90'}`}>
                {micOn ? "🎤" : "🔇"}
              </div>
            </div>
          </>
        ) : (
          // Remote video as secondary
          <>
            {remoteUsersArray.length === 0 ? (
              <div className="w-full h-[420px] bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center text-gray-400">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-2xl animate-pulse" />
                  <User size={64} className="relative opacity-80" />
                </div>
                <p className="text-lg font-semibold">Waiting for participant to join...</p>
              </div>
            ) : (
              remoteUsersArray.map((user) => (
                <div key={`remote-normal-secondary-${user.uid}`} id={`remote-${user.uid}`} className="w-full h-[420px] bg-black" />
              ))
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-5 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full">
                <User size={18} className="text-blue-400" />
                <span className="font-semibold text-base">
                  {localStorage.getItem("role") === "doctor" ? patientName || "Patient" : doctorName || "Doctor"}
                </span>
              </div>
              {remoteUsersArray.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/90 backdrop-blur-md font-bold">
                  🟢 Connected
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )}
</main>


{/* CONTROLS */}
<div
  className={`${
    isFullscreen
      ? `fixed bottom-10 left-1/2 -translate-x-1/2 transition-opacity duration-500 ${
          isUIVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`
      : "relative mt-12"
  } flex items-center gap-6 bg-white/90 backdrop-blur-3xl px-12 py-6 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.15)] border-2 border-white/60 hover:shadow-[0_16px_50px_rgba(0,0,0,0.2)] transition-all duration-300 z-20`}
>
  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-purple-500/5 rounded-full" />
  {/* Mic Button */}
  <button
    onClick={toggleMic}
    disabled={!canJoin}
    className={`relative group w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 ${
      micOn
        ? "bg-gradient-to-br from-green-500 via-green-600 to-green-700 hover:shadow-[0_8px_30px_rgba(34,197,94,0.5)]"
        : "bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:shadow-[0_8px_30px_rgba(239,68,68,0.5)]"
    }`}
    title={micOn ? "Mute Mic" : "Unmute Mic"}
  >
    <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    {micOn ? <Mic size={24} /> : <MicOff size={24} />}
    <span className="absolute -bottom-6 text-xs text-gray-700 font-bold opacity-0 group-hover:opacity-100 transition-all bg-white/80 px-3 py-1 rounded-full">
      {micOn ? "Mic On" : "Mic Off"}
    </span>
  </button>

  {/* Camera Button */}
  <button
    onClick={() => {
      toggleCamera();
      if (localVideoRef.current) {
        if (cameraOn) {
          // Turning OFF camera
          localVideoRef.current.innerHTML = `
            <div style="
              display: flex; 
              align-items: center; 
              justify-content: center; 
              width: 100%; 
              height: 100%; 
              background: linear-gradient(135deg, #ecfdf5, #f0fdfa);
              color: #065f46;
              font-weight: 600;
              font-size: 1.1rem;
              border: 2px dashed #34d399;
              border-radius: 12px;
              letter-spacing: 0.5px;
            ">📷 Camera Off</div>`;
        } else {
          // Turning ON camera
          localVideoRef.current.innerHTML = "";
        }
      }
    }}
    disabled={!canJoin}
    className={`relative group w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 ${
      cameraOn
        ? "bg-gradient-to-br from-green-500 via-green-600 to-green-700 hover:shadow-[0_8px_30px_rgba(34,197,94,0.5)]"
        : "bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:shadow-[0_8px_30px_rgba(239,68,68,0.5)]"
    }`}
    title={cameraOn ? "Turn Off Camera" : "Turn On Camera"}
  >
    <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    {cameraOn ? <Video size={24} /> : <VideoOff size={24} />}
    <span className="absolute -bottom-6 text-xs text-gray-700 font-bold opacity-0 group-hover:opacity-100 transition-all bg-white/80 px-3 py-1 rounded-full">
      {cameraOn ? "Camera On" : "Camera Off"}
    </span>
  </button>

  {/* Fullscreen Toggle */}
  <button
    onClick={toggleFullscreen}
    className="relative group w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold shadow-lg hover:scale-110 active:scale-95 transition-all bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:shadow-[0_8px_30px_rgba(59,130,246,0.5)]"
    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
  >
    <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
    <span className="absolute -bottom-6 text-xs text-gray-700 font-bold opacity-0 group-hover:opacity-100 transition-all bg-white/80 px-3 py-1 rounded-full whitespace-nowrap">
      {isFullscreen ? "Exit" : "Fullscreen"}
    </span>
  </button>

  {/* End Call */}
  <button
    onClick={endCall}
    className="group relative w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white font-semibold shadow-[0_8px_35px_rgba(220,38,38,0.5)] hover:shadow-[0_12px_45px_rgba(220,38,38,0.7)] transition-all duration-300 scale-110 hover:scale-[1.15] active:scale-105"
    title="End Call"
  >
    <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="absolute inset-0 rounded-full animate-ping bg-red-400/50" style={{ animationDuration: '2s' }} />
    <PhoneOff size={28} className="relative z-10" />
    <span className="absolute -bottom-6 text-xs text-gray-700 font-bold opacity-0 group-hover:opacity-100 transition-all bg-white/80 px-3 py-1 rounded-full">
      End Call
    </span>
  </button>
</div>

{/* FOOTER */}
<footer
  className={`${
    isFullscreen
      ? `fixed bottom-4 left-1/2 -translate-x-1/2 transition-opacity duration-500 ${
          isUIVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`
      : "relative mt-12"
  } w-full flex items-center justify-center z-10`}
>
  <div className="relative group flex items-center gap-4 bg-white/80 backdrop-blur-2xl border-2 border-white/60 shadow-[0_8px_35px_rgba(0,0,0,0.1)] px-8 py-4 rounded-full text-base font-medium text-gray-800 hover:shadow-[0_10px_45px_rgba(0,0,0,0.15)] transition-all duration-300">
    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative w-3 h-3 bg-green-600 rounded-full animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
    <ShieldCheck size={20} className="relative text-green-600" />
    <span className="relative tracking-tight">
      <span className="font-bold text-gray-900">End-to-End Encrypted</span>
      <span className="mx-2 text-gray-400">•</span>
      <span className="text-green-700 font-semibold">Secured by HealthCare Portal</span>
    </span>
  </div>

  {/* Enhanced gradient glow */}
  <div className="absolute -z-10 bottom-0 h-24 w-[70%] bg-gradient-to-r from-green-200/40 via-blue-200/40 to-green-200/40 blur-3xl opacity-70" />
</footer>


  </div>
);

}
