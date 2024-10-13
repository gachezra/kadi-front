import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { 
  getUserRoomsRoute, 
  createRoomRoute, 
  getUserDetailsRoute, 
  getGameDataRoute, 
  joinRoomRoute 
} from '../utils/APIRoutes';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [numPlayers, setNumPlayers] = useState(2);
  const [numToDeal, setNumToDeal] = useState(5);
  const [roomCode, setRoomCode] = useState('');
  const [roomId, setRoomId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserRooms();
    fetchAllRooms();
  }, []);

  const fetchUserRooms = async () => {
    const userId = localStorage.getItem('uid');
    if (userId) {
      try {
        const response = await axios.get(getUserRoomsRoute(userId));
        const filteredRooms = response.data.filter((room) => !room.isTerminated);
        setRooms(filteredRooms);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    }
  };

  const fetchAllRooms = async () => {
    const userId = localStorage.getItem('uid');
    if (userId) {
      try {
        const response = await axios.get(createRoomRoute);
        setAllRooms(response.data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    }
  };

  const createRoom = async () => {
    const userId = localStorage.getItem('uid');
    if (!userId) {
        toast('You need to be looged in to start a room!');
    } else {
        try {
        const userResponse = await axios.get(`${getUserDetailsRoute}/${userId}`);
        const { username } = userResponse.data;
        const createResponse = await axios.post(createRoomRoute, {
            numPlayers,
            numToDeal,
            owner: userId,
            ownerName: username
        });
        await axios.get(getGameDataRoute(createResponse.data.roomId));
        navigate(`/rooms/${createResponse.data.roomId}`);
        fetchUserRooms();
        fetchAllRooms();
        } catch (error) {
        console.error('Error creating room:', error);
        alert(error.response?.data?.error || 'Failed to create room');
        }
    }
  };

  const joinRoom = async () => {
    const userId = localStorage.getItem('uid');
    if (!userId) {
        toast('You need to be looged in to start a room!');
    } else {
        try {
        const userResponse = await axios.get(`${getUserDetailsRoute}/${userId}`);
        const { username } = userResponse.data;
        await axios.post(joinRoomRoute(roomId), {
            userId,
            username,
            roomCode
        });
        navigate(`/rooms/${roomId}`);
        } catch (error) {
        console.error('Error joining room:', error);
        alert(error.response?.data?.error || 'Failed to join room');
        }
    }
  };

  const openRoom = (roomId) => {
    navigate(`/rooms/${roomId}`);
  };

  return (
    <div className="mx-auto dark:bg-[#0a0c10] bg-[#f7faff] text-gray-800 dark:text-gray-200 rounded-lg shadow-lg overflow-hidden mt-5 p-4 transition-all duration-200" style={{ fontFamily: "Ubuntu Mono" }}>
      <h1 className="text-4xl font-bold mb-8 text-center">Poker Rooms</h1>

      <Toaster
        position="top-center"
        reverseOrder={true}
    />

      <div className="mb-12 bg-[#e0e0e0] dark:bg-[#1c1c1c] p-6 rounded-lg shadow-lg transition-colors duration-200">
        <h2 className="text-2xl font-semibold mb-4">Create a New Room</h2>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
          <div className="flex-1">
            <label className="block mb-2 text-sm font-medium">Number of Players</label>
            <input 
              type="number" 
              value={numPlayers} 
              onChange={(e) => {setNumPlayers}
              className="w-full p-3 bg-transparent border-b dark:border-gray-600 border-gray-300 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-300 transition-all"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-2 text-sm font-medium">Cards to Deal</label>
            <input 
              type="number" 
              value={numToDeal} 
              onChange={(e) => {setNumToDeal}
              className="w-full p-3 bg-transparent border-b dark:border-gray-600 border-gray-300 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-300 transition-all"
            />
          </div>
        </div>
        <button 
          onClick={createRoom}
          className="bg-gray-100 dark:bg-gray-800 border-2 border-blue-700 dark:border-indigo-600 hover:bg-gray-200 dark:hover:bg-gray-700 text-blue-700 dark:text-indigo-400 px-4 py-2 rounded-xl font-semibold transition-colors duration-200"
        >
          Create Room
        </button>
      </div>

      <div className="mb-12 bg-[#e0e0e0] dark:bg-[#1c1c1c] p-6 rounded-lg shadow-lg transition-colors duration-200">
        <h2 className="text-2xl font-semibold mb-4">Join a Room</h2>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
          <input 
            type="text" 
            value={roomCode} 
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="Enter Room Code"
            className="flex-1 p-3 bg-transparent border-b dark:border-gray-600 border-gray-300 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-300 transition-all"
          />
          <input 
            type="text" 
            value={roomId} 
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID"
            className="flex-1 p-3 bg-transparent border-b dark:border-gray-600 border-gray-300 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-300 transition-all"
          />
          <button 
            onClick={joinRoom}
            className="bg-gray-100 dark:bg-gray-800 border-2 border-green-700 dark:border-green-500 hover:bg-gray-200 dark:hover:bg-gray-700 text-green-700 dark:text-green-400 px-4 py-2 rounded-xl font-semibold transition-colors duration-200"
          >
            Join Room
          </button>
        </div>
      </div>

      <div className="bg-[#e0e0e0] dark:bg-[#1c1c1c] p-6 rounded-lg shadow-lg transition-colors duration-200">
        <h2 className="text-2xl font-semibold mb-4">Your Rooms</h2>
        {rooms.length === 0 ? (
          <p className="text-gray-500">You haven't created any rooms yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div 
                key={room.id} 
                className={`p-4 rounded-lg cursor-pointer transition-all duration-300 shadow-xl ${
                  selectedRoomId === room.id ? 'bg-[#2c2b36] dark:bg-[#34313e]' : 'bg-[#3b3848] dark:bg-[#3d394d] hover:bg-[#423f52] dark:hover:bg-[#454054]'
                }`}
                onClick={() => setSelectedRoomId(room.id)}
              >
                <h3 className="text-xl font-semibold mb-2">Room: {room.roomCode}</h3>
                <p>Players: {room.numPlayers}</p>
                <p>Cards Dealt: {room.numToDeal}</p>
                <button 
                  onClick={() => openRoom(room.id)}
                  className="mt-2 bg-transparent border-2 dark:border-indigo-400 border-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-700 text-indigo-600 dark:text-indigo-300 px-3 py-1 rounded text-sm transition-colors duration-200"
                >
                  Open Room
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#e0e0e0] dark:bg-[#1c1c1c] p-6 rounded-lg shadow-lg mt-4 transition-colors duration-200">
        <h2 className="text-2xl font-semibold mb-4">All Rooms</h2>
        {allRooms.length === 0 ? (
          <p className="text-gray-500">No rooms available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allRooms.map((room) => (
              <div 
                key={room.id} 
                className="p-4 rounded-lg bg-[#3b3848] dark:bg-[#3d394d] hover:bg-[#423f52] dark:hover:bg-[#454054] transition-all duration-300 shadow-xl"
                onClick={() => openRoom(room.id)}
              >
                <h3 className="text-xl font-semibold mb-2">Room: {room.roomCode}</h3>
                <p>Players: {room.numPlayers}</p>
                <p>Cards Dealt: {room.numToDeal}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;
