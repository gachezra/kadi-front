import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connectSocket, sendMessage, disconnectSocket, addMessage } from "../store/chatSlice";
import { getRawSocket, sendAudio, onAudio } from "../utils/api";
import { RootState, AppDispatch } from "../store";
import { ChatMessage } from "../types";
import toast from "react-hot-toast";
import AudioVideoService from "../services/audioVideoService";

// Simple visual revamp + audio recording support (send short clips)

interface ChatComponentProps {
  roomId: string;
  userId: string;
  username: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  roomId,
  userId,
  username,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { connected, messages } = useSelector((state: RootState) => state.chat);
  const peers = useSelector((state: RootState) => state.chat.users ?? []);
  const [inputMessage, setInputMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const [audioService, setAudioService] = useState<AudioVideoService | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (connected) {
      // Socket already connected, listeners should be active
      return;
    }
    
    // Only connect if not already connected
    dispatch(connectSocket({ username, roomId }));

    // Wire audio event listener (binary audio blobs sent via socket)
    const handleIncomingAudio = (payload: any) => {
      try {
        // Server should broadcast audio as { userId, username, blob }
        const { userId: uId, username: uName } = payload || {};
        // If payload contains binary data (ArrayBuffer/Blob), create URL
        let url = '';
        if (payload && payload.audio) {
          const blob = payload.audio instanceof Blob ? payload.audio : new Blob([payload.audio]);
          url = URL.createObjectURL(blob);
        }

        const audioMessage: ChatMessage = {
          userId: uId || 'Unknown',
          username: uName || 'Unknown',
          content: `AUDIO::${url}`,
          timestamp: Date.now(),
        };
        dispatch(addMessage(audioMessage));
      } catch (err) {
        console.error('Failed to handle incoming audio message', err);
      }
    };

    // Attach audio listener via socket service wrapper
    const offAudio = onAudio(handleIncomingAudio);

    // Setup WebRTC audio/video service when socket available
    let svc: AudioVideoService | null = null;
    const setupAV = () => {
      try {
        const rawSocket = getRawSocket();
        if (rawSocket) {
          svc = new AudioVideoService(rawSocket as any);
          svc.onRemoteStream = (peerId, stream) => {
            setRemoteStreams(prev => new Map(prev).set(peerId, stream));
            // also push a system message so users see someone joined the call
            dispatch(addMessage({ userId: 'System', username: 'System', content: `${peerId} joined call`, timestamp: Date.now() }));
          };

          svc.onPeerDisconnected = (peerId) => {
            setRemoteStreams(prev => {
              const next = new Map(prev);
              next.delete(peerId);
              return next;
            });
          };

          setAudioService(svc);
        }
      } catch (err) {
        console.warn('Failed to initialize AudioVideoService', err);
      }
    };

    setupAV();

    // NOTE: do not auto-disconnect on unmount. Leaving socket lifecycle
    // management to explicit actions prevents rapid connect/disconnect
    // loops when this component mounts/unmounts frequently.
    return () => {
      try { offAudio && offAudio(); } catch (e) {}
      try { svc && svc.cleanup(); } catch (e) {}
    };
  }, [connected, dispatch, username, roomId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      // Await the dispatch so we can show an error and avoid clearing the input
      // if the send fails (e.g. socket not initialized).
      dispatch(sendMessage({ roomId, userId, message: inputMessage, username }))
        .unwrap()
        .then(() => setInputMessage(""))
        .catch((err) => {
          console.error('Failed to send chat message', err);
          toast.error('Failed to send message (not connected)');
        });
    }
  };

  const startRecording = async () => {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      recordedChunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
          try {
            // Use the socketService wrapper to send audio (it will auto-connect if needed)
            sendAudio(roomId, username, userId, blob);
            toast.success('Audio clip sent');
          } catch (err) {
            console.error('Failed to send audio blob', err);
            toast.error('Failed to send audio');
          }
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied or unavailable', err);
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;
    try {
      mediaRecorderRef.current?.stop();
      // Stop tracks
      mediaRecorderRef.current?.stream?.getTracks().forEach(t => t.stop());
    } catch (err) {
      console.warn('Error stopping recorder', err);
    } finally {
      setIsRecording(false);
    }
  };

  const callPeer = async (peerIdentifier: string) => {
    if (!audioService) {
      toast.error('Audio service not ready');
      return;
    }
    try {
      await audioService.createAndSendOffer(peerIdentifier, 'audio');
      toast.success('Calling...');
    } catch (err) {
      console.error('Failed to call peer', err);
      toast.error('Call failed');
    }
  };

  const handleAudioClick = () => {
    toast("Audio chat coming soon!");
  };

  return (
    <div className="w-full h-[500px] bg-[#1C1C1E] rounded-lg shadow-xl flex flex-col p-4">
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto bg-gray-800 rounded-lg shadow-inner p-4 mb-4 space-y-3"
      >
        {messages.map((msg: ChatMessage, index) => {
          const isMine = msg.userId === userId;
          const isAudio = typeof msg.content === 'string' && msg.content.startsWith('AUDIO::');
          return (
            <div key={index} className={`max-w-[80%] ${isMine ? 'ml-auto text-right' : 'mr-auto text-left'}`}>
              <div className={`inline-block p-3 rounded-md shadow-md ${isMine ? 'bg-blue-500' : 'bg-gray-700'}`}>
                <div className="text-xs text-gray-200 font-semibold mb-1">{msg.username}</div>
                {isAudio ? (
                  <audio controls src={msg.content.replace('AUDIO::', '')} className="w-64" />
                ) : (
                  <div className="text-gray-100 break-words">{msg.content}</div>
                )}
                <div className="text-[10px] text-gray-400 mt-1">{new Date((msg as any).createdAt ?? (msg as any).timestamp ?? Date.now()).toLocaleTimeString()}</div>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSendMessage} className="flex items-center mb-4 gap-3">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-3 w-full bg-transparent border-b text-white border-gray-300 focus:outline-none focus:border-blue-500"
        />
        <button
          type="button"
          onClick={() => (isRecording ? stopRecording() : startRecording())}
          title={isRecording ? 'Stop recording' : 'Record audio message'}
          className={`px-3 py-2 rounded-md ${isRecording ? 'bg-red-500 text-white' : 'bg-white/10 text-white'}`}
        >
          {isRecording ? 'Stop' : 'Record'}
        </button>
        <button
          type="submit"
          className="bg-blue-500 px-4 py-3 ml-0 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
        >
          Send
        </button>
      </form>

      <div className="mt-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-300">Audio Chat</div>
          <div className="flex items-center gap-2">
            <button onClick={handleAudioClick} className="px-3 py-2 rounded-md bg-white/10 text-white">Info</button>
          </div>
        </div>

        <div className="space-y-2">
          {Array.from(remoteStreams.entries()).map(([peerId, stream]) => (
            <div key={peerId} className="flex items-center justify-between p-2 bg-white/5 rounded">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">A</div>
                <div className="text-sm text-white">{peerId}</div>
              </div>
              <audio controls src={URL.createObjectURL(stream)} />
            </div>
          ))}

          <div className="pt-2">
            <div className="text-xs text-gray-400 mb-2">Peers in room</div>
            {/** Use peers from redux if available to render call buttons **/}
            {peers.map((p: any) => (
              <div key={p.userId || p.id || p.socketId} className="flex items-center justify-between p-2 bg-white/5 rounded mb-2">
                <div className="text-sm text-white">{p.username || p.userId || p.id}</div>
                <div>
                  <button onClick={() => callPeer(p.userId || p.id || p.socketId)} className="px-3 py-1 rounded bg-green-600 text-white">Call</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
