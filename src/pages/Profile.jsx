import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getUserDetailsRoute, updateUserRoute, getUserGameStatsRoute } from '../utils/APIRoutes';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrophy, FaGamepad, FaChartLine, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { GiCardAceSpades } from "react-icons/gi";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [gameStats, setGameStats] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    username: '',
    email: '',
    avatar: ''
  });
  const navigate = useNavigate();

  const fetchUserData = useCallback(async () => {
    const userId = localStorage.getItem('uid');
    try {
      const [userResponse, statsResponse] = await Promise.all([
        axios.get(`${getUserDetailsRoute}/${userId}`),
        axios.get(getUserGameStatsRoute(userId))
      ]);

      console.log('User Data:', statsResponse.data);

      setUserData(userResponse.data);
      setGameStats(statsResponse.data);
      setEditedData({
        username: userResponse.data.username,
        email: userResponse.data.email,
      });

      if (!userResponse.data.avatar) {
        navigate('/customize');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    setEditedData({
      ...editedData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('uid');
    try {
      await axios.put(updateUserRoute(userId), editedData);
      setIsEditing(false);
      fetchUserData();
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  if (!userData || !gameStats) return (
    <div className="container flex flex-col md:flex-row mx-auto px-4 py-8 bg-[#f7faff] dark:bg-[#0a0c10] min-h-screen items-center justify-center text-center animate-pulse text-[#1a202c] dark:text-[#e2e8f0] rounded-lg shadow-lg overflow-hidden transition-all duration-200" style={{ fontFamily: "Ubuntu Mono" }}>
      {/* User Info Skeleton */}
      <div className="md:w-1/4 w-full md:h-auto mb-8 bg-[#ffffff] dark:bg-[#1c1e21] shadow-xl rounded-lg p-6 flex flex-col items-center animate-pulse">
        <div className="w-40 h-40 rounded-full bg-[#e2e8f0] dark:bg-[#2d3748] mb-4"></div>
        <div className="w-20 h-4 bg-[#e2e8f0] dark:bg-[#2d3748] rounded mb-2"></div>
        <div className="w-32 h-4 bg-[#e2e8f0] dark:bg-[#2d3748] rounded mb-4"></div>
        <div className="w-24 h-8 bg-[#e2e8f0] dark:bg-[#2d3748] rounded-full"></div>
      </div>

      {/* Game Stats Skeleton */}
      <div className="md:w-3/4 w-full md:ml-6 bg-[#ffffff] dark:bg-[#1c1e21] shadow-lg rounded-lg p-6 animate-pulse">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full mr-2"></div>
            <div className="w-36 h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full h-20 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
          <div className="w-full h-20 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
          <div className="w-full h-20 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
          <div className="w-full h-20 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
        </div>

        {/* Performance Overview Skeleton */}
        <div className="mt-12">
          <div className="w-48 h-6 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
          <div className="bg-gray-200 dark:bg-gray-700 shadow-2xl rounded-lg p-6">
            <div className="w-full h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
            <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2.5 mb-2">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '50%' }}></div>
            </div>
          </div>
        </div>

        {/* Additional Stats Skeleton */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="w-full h-20 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
          <div className="w-full h-20 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
          <div className="w-full h-20 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
        </div>

        {/* Last Played Skeleton */}
        <div className="mt-8 text-center">
          <div className="w-64 h-4 bg-gray-300 dark:bg-gray-700 rounded mx-auto"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row mx-auto justify-center text-center bg-[#f7faff] dark:bg-[#0a0c10] text-[#1a202c] dark:text-[#e2e8f0] items-center rounded-lg shadow-lg overflow-hidden mt-5 p-4 transition-all duration-200" style={{ fontFamily: "Ubuntu Mono" }}>
      <div className="md:w-1/4 w-full md:h-auto mb-8 bg-[#ffffff] dark:bg-[#1c1e21] h-auto shadow-xl rounded-lg p-6 flex flex-col items-center">
        <img
          src={`data:image/svg+xml;base64,${userData.avatar}`}
          alt="User Avatar"
          className="w-40 h-40 rounded-full shadow-2xl mb-4 border-4 border-[#ffc107] dark:border-[#ffd700]"
        />
        {isEditing && (
          <Link to='/customize' className='text-[#3182ce] dark:text-[#63b3ed] font-bold hover:underline'>Change Avatar</Link>
        )}
        <h1 className="text-xl text-[#2d3748] dark:text-[#e2e8f0] font-semibold mb-2">{userData.username}</h1>
        <p className="text-[#4a5568] dark:text-[#a0aec0]">{userData.email}</p>
        <button
          onClick={handleEditToggle}
          className="mt-4 bg-transparent border-2 border-[#ffc107] dark:border-[#ffd700] hover:bg-[#ffc107] hover:bg-opacity-10 dark:hover:bg-[#ffd700] dark:hover:bg-opacity-10 text-[#b7791f] dark:text-[#ffd700] py-2 px-4 rounded-full transition duration-300"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
        {isEditing && (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col items-center w-full">
            <input
              type="text"
              name="username"
              value={editedData.username}
              onChange={handleInputChange}
              placeholder="Username"
              className="mb-2 p-3 bg-transparent border rounded-lg text-[#2d3748] dark:text-[#e2e8f0] border-[#cbd5e0] dark:border-[#4a5568] focus:outline-none focus:border-[#3182ce] dark:focus:border-[#63b3ed] w-full"
            />
            <input
              type="email"
              name="email"
              value={editedData.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="mb-2 p-3 bg-transparent border rounded-lg text-[#2d3748] dark:text-[#e2e8f0] border-[#cbd5e0] dark:border-[#4a5568] focus:outline-none focus:border-[#3182ce] dark:focus:border-[#63b3ed] w-full"
            />
            <button
              type="submit"
              className="bg-transparent border-2 border-[#48bb78] dark:border-[#68d391] hover:bg-[#48bb78] hover:bg-opacity-10 dark:hover:bg-[#68d391] dark:hover:bg-opacity-10 text-[#2f855a] dark:text-[#68d391] py-2 px-4 rounded-full transition duration-300"
            >
              Save Changes
            </button>
          </form>
        )}
      </div>

      <div className="md:w-3/4 w-full md:ml-6 bg-[#ffffff] dark:bg-[#1c1e21] shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <GiCardAceSpades className="text-4xl text-[#e53e3e] dark:text-[#fc8181] mr-2" />
            <h2 className="text-2xl text-[#2d3748] dark:text-[#e2e8f0] font-semibold">Game Stats</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard 
            icon={<FaGamepad className="text-4xl text-[#3182ce] dark:text-[#63b3ed]" />}
            title="Games Played"
            value={gameStats.gamesPlayed}
          />
          <StatCard 
            icon={<FaTrophy className="text-4xl text-[#d69e2e] dark:text-[#faf089]" />}
            title="Games Won"
            value={gameStats.gamesWon}
          />
          <StatCard 
            icon={<FaClock className="text-4xl text-[#805ad5] dark:text-[#b794f4]" />}
            title="Total Play Time"
            value={`${Math.floor(gameStats.totalTimePlayed / 1000 / 3600)}h ${Math.floor((gameStats.totalTimePlayed / 1000 % 3600) / 60)}m ${Math.floor((gameStats.totalTimePlayed / 1000) % 60)}s`}
          />
          <StatCard 
            icon={<GiCardAceSpades className="text-4xl text-[#e53e3e] dark:text-[#fc8181]" />}
            title="Total Cards Played"
            value={gameStats.totalCardsPlayed}
          />
        </div>

        <div className="mt-12">
          <h3 className="text-xl font-semibold text-[#2d3748] dark:text-[#e2e8f0] mb-4">Performance Overview</h3>
          <div className="bg-[#edf2f7] dark:bg-[#2d3748] text-[#2d3748] dark:text-[#e2e8f0] shadow-2xl rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <span>Win Rate</span>
              <span>{gameStats.winRate}%</span>
            </div>
            <div className="w-full bg-[#cbd5e0] dark:bg-[#4a5568] rounded-full h-2.5">
              <div 
                className="bg-[#3182ce] dark:bg-[#63b3ed] h-2.5 rounded-full transition-all duration-300" 
                style={{width: `${gameStats.winRate}%`}}
              ></div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-6">
          <StatCard 
            icon={<FaChartLine className="text-4xl text-[#e53e3e] dark:text-[#fc8181]" />}
            title="Current Win Streak"
            value={gameStats.winStreak}
          />
          <StatCard 
            icon={<FaTrophy className="text-4xl text-[#48bb78] dark:text-[#68d391]" />}
            title="Highest Win Streak"
            value={gameStats.highestWinStreak}
          />
          <StatCard 
            icon={<FaGamepad className="text-4xl text-[#3182ce] dark:text-[#63b3ed]" />}
            title="Games Started"
            value={gameStats.gamesStarted}
          />
        </div>

        <div className="mt-8 text-center">
          <p className="text-[#4a5568] dark:text-[#a0aec0]">
            <FaCalendarAlt className="inline mr-2" />
            Last Played: {new Date(gameStats.lastPlayedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value }) => (
  <div className="bg-[#edf2f7] dark:bg-[#2d3748] text-[#2d3748] dark:text-[#e2e8f0] shadow-2xl p-6 rounded-lg flex flex-col items-center transition-all duration-300 hover:shadow-xl hover:scale-105">
    {icon}
    <p className="text-lg font-semibold mt-2">{title}</p>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

export default Profile;

