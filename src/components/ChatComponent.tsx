import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  connectSocket,
  sendMessage,
  addPeerConnection,
  removePeerConnection,
  setAudioStream,
  removeAudioStream,
  socket,
  disconnectSocket,
} from '../store/chatSlice';
import { RootState, AppDispatch } from '../store';
import { ChatMessage, User } from '../types';

// --- Type Definitions ---
interface ChatComponentProps {
    roomId: string;
    userId: string;
    username: string;
}

interface OfferPayload {
  source: string;
  sdp: RTCSessionDescriptionInit;
}

interface AnswerPayload {
  source: string;
  sdp: RTCSessionDescriptionInit;
}

interface IceCandidatePayload {
  source: string;
  candidate: RTCIceCandidateInit;
}

// --- Component ---
const ChatComponent: React.FC<ChatComponentProps> = ({ roomId, userId, username }) => {
  const dispatch: AppDispatch = useDispatch();
  const { connected, messages, audioStreams, peers } = useSelector((state: RootState) => state.chat);
  const [inputMessage, setInputMessage] = useState('');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isAudioStreaming, setIsAudioStreaming] = useState(false);
  const peerConnectionsRef = useRef<{ [key: string]: RTCPeerConnection }>({});
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Establish socket connection and join room
  useEffect(() => {
    if (!connected) {
      dispatch(connectSocket({ username, roomId }));
    }

    return () => {
      dispatch(disconnectSocket());
    };
  }, [connected, dispatch, username, roomId]);

  const createPeerConnection = useCallback((peerId: string) => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', { target: peerId, candidate: event.candidate });
        }
      };

      pc.ontrack = (event) => {
        dispatch(setAudioStream({ userId: peerId, stream: event.streams[0] }));
      };

      if (localStream) {
        localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
      }

      peerConnectionsRef.current[peerId] = pc;
      dispatch(addPeerConnection(peerId));
      return pc;
    } catch (error) {
      console.error('Error creating peer connection:', error);
    }
  }, [dispatch, localStream]);

  const handleOffer = useCallback(
    async ({ from, offer }: { from: string, offer: RTCSessionDescriptionInit }) => {
      const pc = createPeerConnection(from);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { target: from, answer });
      }
    },
    [createPeerConnection]
  );

  const handleAnswer = useCallback(async ({ from, answer }: { from: string, answer: RTCSessionDescriptionInit }) => {
    const pc = peerConnectionsRef.current[from];
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }, []);

  const handleIceCandidate = useCallback(({ from, candidate }: { from: string, candidate: RTCIceCandidateInit }) => {
    const pc = peerConnectionsRef.current[from];
    if (pc) {
      pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }, []);

  // WebRTC signaling handlers
  useEffect(() => {
    if (connected) {
      socket.on('offer', handleOffer);
      socket.on('answer', handleAnswer);
      socket.on('ice-candidate', handleIceCandidate);

      return () => {
        socket.off('offer', handleOffer);
        socket.off('answer', handleAnswer);
        socket.off('ice-candidate', handleIceCandidate);
      };
    }
  }, [connected, handleOffer, handleAnswer, handleIceCandidate]);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(stream);
      setIsAudioStreaming(true);

      peers.forEach(async (peer: User) => {
          if(peer.userId === userId) return;
        const pc = createPeerConnection(peer.userId);
        if (pc) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('offer', { target: peer.userId, offer });
        }
      });
    } catch (error) {
      console.error('Error starting call:', error);
    }
  };

  const stopCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    setIsAudioStreaming(false);

    Object.keys(peerConnectionsRef.current).forEach((peerId) => {
      const pc = peerConnectionsRef.current[peerId];
      if (pc) pc.close();
      delete peerConnectionsRef.current[peerId];
      dispatch(removePeerConnection(peerId));
      dispatch(removeAudioStream(peerId));
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      dispatch(sendMessage({ roomId, userId, message: inputMessage, username }));
      setInputMessage('');
    }
  };

  return (
    <div className="w-full h-[500px] bg-[#1C1C1E] rounded-lg shadow-xl flex flex-col p-4">

      {/* Chat messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto bg-gray-800 rounded-lg shadow-inner p-4 mb-4"
      >
        {messages.map((msg: ChatMessage, index) => (
          <div
            key={index}
            className={`p-3 my-2 rounded-md shadow-md max-w-[80%] ${
              msg.userId === userId ? 'bg-blue-500 ml-auto' : 'bg-gray-700 mr-auto'
            }`}
          >
            <strong className="block text-sm text-gray-200">{msg.username}:</strong>
            <span className="block text-gray-100 break-words">{msg.content}</span>
          </div>
        ))}
         {/* Audio streams */}
        <div className="audio-streams mt-4">
            {Object.entries(audioStreams).map(([streamUserId, stream]) => (
            <div key={streamUserId}>
                <p className="text-white">Audio stream from user: {streamUserId}</p>
                <audio
                autoPlay
                ref={(el) => {
                    if (el) {
                    el.srcObject = stream;
                    }
                }}
                />
            </div>
            ))}
        </div>
      </div>

      {/* Input and send button */}
      <form onSubmit={handleSendMessage} className="flex items-center mb-4">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-3 w-full bg-transparent border-b text-white border-gray-300 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 px-4 py-3 ml-3 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
        >
          Send
        </button>
      </form>

      {/* Audio streaming control */}
      <button
        onClick={isAudioStreaming ? stopCall : startCall}
        className="w-full bg-transparent border-2 border-green-500 text-green-500 py-3 px-6 rounded-xl hover:bg-gray-300 hover:bg-opacity-10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        {isAudioStreaming ? 'Stop Audio' : 'Start Audio'}
      </button>

    </div>
  );
};

export default ChatComponent;
