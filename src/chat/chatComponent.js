import React, { useEffect, useState, useRef, useCallback} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  connectSocket,
  joinRoom,
  leaveRoom,
  sendMessage,
  requestPeers,
  addPeerConnection,
  removePeerConnection,
  setAudioStream,
  removeAudioStream,
  socket
} from './chatSlice';

const ChatComponent = ({ roomId, userId, username }) => {
  const dispatch = useDispatch();
  const { connected, messages, audioStreams, peers, peerConnections } = useSelector((state) => state.chat);
  const [inputMessage, setInputMessage] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [isAudioStreaming, setIsAudioStreaming] = useState(false);
  const peerConnectionsRef = useRef({});

  useEffect(() => {
    if (!connected) {
      dispatch(connectSocket());
    }
  }, [connected, dispatch]);

  useEffect(() => {
    if (connected && roomId && userId) {
      dispatch(joinRoom({ roomId, userId, username }));
      console.log('Chat connected');
    }
    return () => {
      if (roomId && userId) {
        dispatch(leaveRoom({ roomId, userId, username }));
      }
    };
  }, [connected, roomId, userId, dispatch, username]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      dispatch(sendMessage({ roomId, userId, message: inputMessage, username }));
      setInputMessage('');
    }
  };

  useEffect(() => {
    if (connected && roomId) {
      dispatch(requestPeers({ roomId }));
    }
  }, [connected, roomId, dispatch]);

  useEffect(() => {
    if (connected) {
      socket.on('offer', handleOffer);
      socket.on('answer', handleAnswer);
      socket.on('iceCandidate', handleIceCandidate);

      return () => {
        socket.off('offer', handleOffer);
        socket.off('answer', handleAnswer);
        socket.off('iceCandidate', handleIceCandidate);
      };
    }
  }, [connected]);

  console.log("Current audio streams:", audioStreams);

  const createPeerConnection = (peerId) => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Sending ICE candidate to:", peerId);
          socket.emit('iceCandidate', { target: peerId, candidate: event.candidate });
        }
      };

      pc.ontrack = (event) => {
        console.log(`Received track from ${peerId}:`, event.streams[0]);
        console.log(`Track kind: ${event.track.kind}`);
        dispatch(setAudioStream({ userId: peerId, stream: event.streams[0] }));
      };

      if (localStream) {
        console.log("Adding local stream to peer connection");
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
      }

      peerConnectionsRef.current[peerId] = pc;
      dispatch(addPeerConnection(peerId));
      return pc;
    } catch (error) {
      console.error('Error creating peer connection:', error);
    }
  };

  const startCall = async () => {
    try {
      console.log("Starting call...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Got local stream:", stream);
      setLocalStream(stream);
      setIsAudioStreaming(true);

      peers.forEach(async (peerId) => {
        console.log("Creating peer connection for:", peerId);
        const pc = createPeerConnection(peerId);
        if (pc) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          console.log("Sending offer to:", peerId);
          socket.emit('offer', { target: peerId, sdp: offer });
        }
      });
    } catch (error) {
      console.error('Error starting call:', error);
    }
  };

  const stopCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setIsAudioStreaming(false);
    Object.keys(peerConnectionsRef.current).forEach(peerId => {
      peerConnectionsRef.current[peerId].close();
      delete peerConnectionsRef.current[peerId];
      dispatch(removePeerConnection(peerId));
      dispatch(removeAudioStream(peerId));
    });
  };

  const handleOffer = useCallback(async ({ source, sdp }) => {
    try {
      console.log(`Received offer from ${source}`);
      const pc = createPeerConnection(source);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        console.log(`Set remote description for ${source}`);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log(`Created and set local description (answer) for ${source}`);
        socket.emit('answer', { target: source, sdp: answer });
        console.log(`Sent answer to ${source}`);
      }
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }, [createPeerConnection]);
  
  const handleAnswer = useCallback(async ({ source, sdp }) => {
    try {
      console.log(`Received answer from ${source}`);
      const pc = peerConnectionsRef.current[source];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        console.log(`Set remote description for ${source}`);
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }, []);
  
  const handleIceCandidate = useCallback(({ source, candidate }) => {
    try {
      console.log(`Received ICE candidate from ${source}`);
      const pc = peerConnectionsRef.current[source];
      if (pc) {
        pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log(`Added ICE candidate for ${source}`);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }, []);

  return (
    <div className="w-full h-[calc(100vh-8rem)] bg-[#1C1C1E] rounded-lg shadow-xl overflow-hidden flex flex-col">
      <form onSubmit={handleSendMessage} className="flex mt-4 px-4">
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

      <button
        onClick={isAudioStreaming ? stopCall : startCall}
        className="mt-4 mx-4 bg-transparent border-2 border-green-500 text-green-500 py-3 px-6 rounded-xl hover:bg-gray-300 hover:bg-opacity-10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        {isAudioStreaming ? 'Stop Audio' : 'Start Audio'}
      </button>

      <div className="audio-streams mt-4">
        {Object.entries(audioStreams).map(([streamUserId, stream]) => (
          <div key={streamUserId}>
            <p>Audio stream from user: {streamUserId}</p>
            <audio
              autoPlay
              ref={el => {
                if (el) {
                  el.srcObject = stream;
                  console.log(`Set srcObject for user ${streamUserId}`);
                }
              }}
            />
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-800 rounded-lg shadow-lg">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 my-2 rounded-md shadow-md ${msg.userId === userId ? 'bg-blue-500 ml-auto' : 'bg-gray-700 mr-auto'}`}
          >
            <strong className="block text-sm text-gray-200">{msg.username}:</strong>
            <span className="block text-gray-100">{msg.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatComponent;