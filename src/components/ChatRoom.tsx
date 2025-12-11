
import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../utils/constants';
import { 
  BsMicFill, 
  BsMicMuteFill,
  BsPeopleFill,
  BsX 
} from 'react-icons/bs';
import { FaPaperPlane } from 'react-icons/fa';

interface ChatRoomProps {
  userId: string;
  username: string;
  roomId: string;
}

interface Message {
  userId: string;
  username: string;
  content: string;
}

interface User {
  userId: string;
  username: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ userId, username, roomId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [audioStatus, setAudioStatus] = useState('');
  const [peerStatus, setPeerStatus] = useState<any>({});
  
  const socketRef = useRef<Socket>();
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const mediaStreamRef = useRef<MediaStream>();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [peerConnections] = useState<Map<string, RTCPeerConnection>>(new Map());

  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    socketRef.current = io(API_BASE_URL);

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
      // Join room immediately with provided credentials (use quick-reference event)
      socketRef.current?.emit('room:join', { roomId, userId, username });
    });

    socketRef.current.on('room-users', (roomUsers: User[]) => {
      setUsers(roomUsers);
      roomUsers.forEach(user => {
        if (user.userId !== userId && !peerConnections.has(user.userId)) {
          createPeerConnection(user.userId);
        }
      });
    });

    socketRef.current.on('user-joined', ({ userId: newUserId, username: newUsername }: { userId: string, username: string }) => {
      setUsers(prev => [...prev, { userId: newUserId, username: newUsername }]);
      createPeerConnection(newUserId);
    });

    socketRef.current.on('user-left', ({ userId: leftUserId }: { userId: string }) => {
      setUsers(prev => prev.filter(user => user.userId !== leftUserId));
      closePeerConnection(leftUserId);
    });

    socketRef.current.on('chat:message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    });

    socketRef.current.on('webrtc:offer-received', async ({ from, offer }: { from: string, offer: RTCSessionDescriptionInit }) => {
      const pc = peerConnections.get(from) || await createPeerConnection(from);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketRef.current?.emit('webrtc:answer', { targetSocketId: from, answer });
    });

    socketRef.current.on('webrtc:answer-received', async ({ from, answer }: { from: string, answer: RTCSessionDescriptionInit }) => {
      const pc = peerConnections.get(from);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socketRef.current.on('webrtc:ice-candidate-received', async ({ from, candidate }: { from: string, candidate: RTCIceCandidateInit }) => {
      const pc = peerConnections.get(from);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socketRef.current?.disconnect();
      peerConnections.forEach(pc => pc.close());
      peerConnections.clear();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [userId, username, roomId]);

  const createPeerConnection = async (peerId: string) => {
    console.log(`Creating peer connection for user: ${peerId}`);
    
    try {
      const pc = new RTCPeerConnection(configuration);
      peerConnections.set(peerId, pc);

      pc.onconnectionstatechange = () => {
        console.log(`Connection state for ${peerId}: ${pc.connectionState}`);
        setPeerStatus((prev: any) => ({
          ...prev,
          [peerId]: {
            ...prev[peerId],
            connectionState: pc.connectionState
          }
        }));
      };

      pc.oniceconnectionstatechange = () => {
        console.log(`ICE connection state for ${peerId}: ${pc.iceConnectionState}`);
        setPeerStatus((prev: any) => ({
          ...prev,
          [peerId]: {
            ...prev[peerId],
            iceConnectionState: pc.iceConnectionState
          }
        }));
      };

      pc.onsignalingstatechange = () => {
        console.log(`Signaling state for ${peerId}: ${pc.signalingState}`);
        setPeerStatus((prev: any) => ({
          ...prev,
          [peerId]: {
            ...prev[peerId],
            signalingState: pc.signalingState
          }
        }));
      };

      pc.onicecandidate = ({ candidate }) => {
        console.log(`ICE candidate for ${peerId}:`, candidate);
        if (candidate) {
          socketRef.current?.emit('webrtc:ice-candidate', { targetSocketId: peerId, candidate });
        }
      };

      pc.ontrack = (event) => {
        console.log(`Received track from ${peerId}:`, event.streams[0].getTracks());
        const audio = new Audio();
        audio.srcObject = event.streams[0];
        audio.autoplay = true;
        audio.play().catch(error => {
          console.error('Error playing audio:', error);
          setAudioStatus(`Error playing audio: ${error.message}`);
        });
      };

      pc.onnegotiationneeded = async () => {
        console.log(`Negotiation needed for ${peerId}`);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socketRef.current?.emit('webrtc:offer', { targetSocketId: peerId, offer });
        } catch (error) {
          console.error('Error during negotiation:', error);
          setAudioStatus(`Negotiation error: ${(error as Error).message}`);
        }
      };

      if (mediaStreamRef.current) {
        console.log('Adding existing tracks to new peer connection');
        mediaStreamRef.current.getTracks().forEach(track => {
          console.log('Adding track:', track);
          pc.addTrack(track, mediaStreamRef.current!);
        });
      }

      return pc;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      setAudioStatus(`Peer connection error: ${(error as Error).message}`);
      throw error;
    }
  };

  const closePeerConnection = (peerId: string) => {
    const pc = peerConnections.get(peerId);
    if (pc) {
      pc.close();
      peerConnections.delete(peerId);
    }
  };

  const handleSendMessage = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    
    if (message.trim()) {
      socketRef.current?.emit('chat:message', { 
        content: message.trim(), 
        roomId,
        userId,
        username,
        timestamp: Date.now()
      });
      setMessage('');
    }
  };

  const toggleAudio = async () => {
    try {
      if (!isAudioEnabled) {
        setAudioStatus('Requesting microphone access...');
        
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 2,
            sampleRate: 48000,
            sampleSize: 16,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        
        console.log('Audio stream obtained:', stream.getTracks());
        setAudioStatus('Microphone access granted');
        
        mediaStreamRef.current = stream;
        if (localAudioRef.current) {
          localAudioRef.current.srcObject = stream;
        }
        
        stream.getAudioTracks().forEach(track => {
          console.log('Audio track settings:', track.getSettings());
          console.log('Audio track constraints:', track.getConstraints());
          
          track.onended = () => {
            console.log('Audio track ended');
            setAudioStatus('Audio track ended');
          };
          
          track.onmute = () => {
            console.log('Audio track muted');
            setAudioStatus('Audio track muted');
          };
          
          track.onunmute = () => {
            console.log('Audio track unmuted');
            setAudioStatus('Audio track active');
          };
        });

        peerConnections.forEach((pc, peerId) => {
          console.log(`Adding tracks to existing peer connection ${peerId}`);
          stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
          });
        });

        setIsAudioEnabled(true);
        setAudioStatus('Audio enabled and streaming');
      } else {
        if (mediaStreamRef.current) {
          console.log('Stopping all audio tracks');
          mediaStreamRef.current.getTracks().forEach(track => {
            track.stop();
            console.log('Track stopped:', track.id);
          });
          mediaStreamRef.current = undefined;
          if (localAudioRef.current) {
            localAudioRef.current.srcObject = null;
          }
          setAudioStatus('Audio stopped');
        }
        setIsAudioEnabled(false);
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setAudioStatus(`Microphone error: ${(error as Error).message}`);
      setIsAudioEnabled(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-xl dark:text-white">Connecting...</div>
      </div>
    );
  }

  return (
    <div className="flex lg:h-[600px] h-[350px] bg-gray-100 dark:bg-gray-900 p-1">
      <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-500 dark:bg-blue-600 text-white p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Chat Room</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleAudio}
                className={`p-2 rounded-full ${
                  isAudioEnabled ? 'bg-red-500 dark:bg-red-600' : 'bg-green-500 dark:bg-green-600'
                } hover:opacity-80 transition-opacity relative group`}
              >
                {isAudioEnabled ? <BsMicFill size={20} /> : <BsMicMuteFill size={20} />}
                <span className="absolute hidden group-hover:block bg-black text-white text-xs p-2 rounded whitespace-nowrap right-0 top-full mt-2">
                  {audioStatus}
                </span>
              </button>
              <button
                onClick={() => setShowUsers(!showUsers)}
                className="p-2 rounded-full hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <BsPeopleFill size={20} />
                <span>{users.length}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100%-4rem)]">
          {/* Main Chat Area */}
          <div className={showUsers ? 'hidden' : 'flex-1 flex flex-col'}>
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-800"
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.userId === userId ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.userId === userId
                        ? 'bg-blue-500 dark:bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <div className="text-sm font-semibold mb-1">{msg.username}</div>
                    <div>{msg.content}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t dark:border-gray-700">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                >
                  <FaPaperPlane size={20} />
                </button>
              </form>
            </div>
          </div>

          {/* Users Sidebar */}
          {showUsers && (
            <div className="w-full border-l dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="p-4 border-b dark:border-gray-700 bg-gray-100 dark:bg-gray-700 flex justify-between items-center">
                <h3 className="font-semibold dark:text-white">Online Users</h3>
                <button
                  onClick={() => setShowUsers(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <BsX size={24} />
                </button>
              </div>
              <div className="p-4">
                {users.map((user) => (
                  <div
                    key={user.userId}
                    className="flex items-center gap-2 py-2 text-gray-900 dark:text-gray-200"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>{user.username}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <audio ref={localAudioRef} muted />
      </div>
    </div>
  );
};

export default ChatRoom;
