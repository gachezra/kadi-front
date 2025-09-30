import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  connectSocket,
  sendMessage,
  socket,
  disconnectSocket,
} from "../store/chatSlice";
import { RootState, AppDispatch } from "../store";
import { ChatMessage } from "../types";
import toast from "react-hot-toast";

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
  const [inputMessage, setInputMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!connected) {
      dispatch(connectSocket({ username, roomId }));
    }

    return () => {
      dispatch(disconnectSocket());
    };
  }, [connected, dispatch, username, roomId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      dispatch(
        sendMessage({ roomId, userId, message: inputMessage, username })
      );
      setInputMessage("");
    }
  };

  const handleAudioClick = () => {
    toast("Audio chat coming soon!");
  };

  return (
    <div className="w-full h-[500px] bg-[#1C1C1E] rounded-lg shadow-xl flex flex-col p-4">
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto bg-gray-800 rounded-lg shadow-inner p-4 mb-4"
      >
        {messages.map((msg: ChatMessage, index) => (
          <div
            key={index}
            className={`p-3 my-2 rounded-md shadow-md max-w-[80%] ${
              msg.userId === userId
                ? "bg-blue-500 ml-auto"
                : "bg-gray-700 mr-auto"
            }`}
          >
            <strong className="block text-sm text-gray-200">
              {msg.username}:
            </strong>
            <span className="block text-gray-100 break-words">
              {msg.content}
            </span>
          </div>
        ))}
      </div>

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

      <button
        onClick={handleAudioClick}
        className="w-full bg-transparent border-2 border-green-500 text-green-500 py-3 px-6 rounded-xl hover:bg-gray-300 hover:bg-opacity-10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        Audio Chat (Coming Soon)
      </button>
    </div>
  );
};

export default ChatComponent;
