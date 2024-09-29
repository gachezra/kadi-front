import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { updateUserAvatarRoute } from '../utils/APIRoutes';
import axios from "axios";

const Customize = () => {
  const api = 'https://api.multiavatar.com/45678945';
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const history = useNavigate();

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const fetchedAvatars = [];
        for (let i = 0; i < 4; i++) {
          const response = await fetch(`${api}/${Math.round(Math.random() * 1000)}`);
          const data = await response.text();
          fetchedAvatars.push(btoa(data)); // Convert SVG to base64
        }
        setAvatars(fetchedAvatars);
        setIsLoading(false);
      } catch (error) {
        toast.error('Failed to load avatars. Please try again.');
      }
    };
    fetchAvatars();
  }, []);

  const setProfilePicture = async () => {
    if (selectedAvatar === null) {
      toast.error('Please select an avatar');
    } else {
      const userId = localStorage.getItem('uid');
      const response = await axios.put(updateUserAvatarRoute(userId), {
        avatar: avatars[selectedAvatar],
      })
      console.log(response.data);
      toast(response.data.message)
      localStorage.setItem('avatarImage', avatars[selectedAvatar]);
      history('/profile'); // Redirect to profile page
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="mx-auto bg-[#f7faff] dark:bg-[#0a0c10] text-[#131324] dark:text-[#e2e8f0] rounded-lg shadow-lg overflow-hidden mt-5 p-4 transition-all duration-200" style={{ fontFamily: "Ubuntu Mono" }}>
          <img src="/loader.gif" alt="loader" className="w-10 mx-auto" />
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center min-h-screen bg-[#f7faff] dark:bg-[#0a0c10] text-[#131324] dark:text-[#e2e8f0] p-10 transition-all duration-300">
          <h1 className="text-[#131324] dark:text-[#e2e8f0] text-2xl mb-8 font-bold">
            Pick an avatar as your profile picture
          </h1>
          <div className="flex gap-6 mb-10">
            {avatars.map((avatar, index) => (
              <div
                key={index}
                className={`w-24 h-24 border-4 rounded-full flex justify-center items-center cursor-pointer transition-all duration-300 ${
                  selectedAvatar === index 
                    ? 'border-[#3b82f6] dark:border-[#60a5fa] scale-110' 
                    : 'border-[#cbd5e0] dark:border-[#4b5563] hover:border-[#93c5fd] dark:hover:border-[#93c5fd]'
                }`}
                onClick={() => setSelectedAvatar(index)}
              >
                <img
                  src={`data:image/svg+xml;base64,${avatar}`}
                  alt="avatar"
                  className="w-20 h-20"
                />
              </div>
            ))}
          </div>
          <button
            className="px-6 py-3 bg-[#3b82f6] dark:bg-[#60a5fa] text-white font-bold rounded-full transition-all duration-300 hover:bg-[#2563eb] dark:hover:bg-[#3b82f6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3b82f6] dark:focus:ring-[#60a5fa]"
            onClick={setProfilePicture}
          >
            Set as Profile Picture
          </button>
        </div>
      )}
      <Toaster
        position="top-center"
        reverseOrder={true}
        toastOptions={{
          className: 'bg-[#f7faff] dark:bg-[#131324] text-[#131324] dark:text-[#e2e8f0]',
        }}
      />
    </>
  );
};

export default Customize;