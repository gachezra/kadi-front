import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import Tilt from 'react-parallax-tilt';
import cards from '../assets/images/playing-cards.json';

const Home = () => {
    const [status, setStatus] = useState(true);

    useEffect(() => {
        const uid = localStorage.getItem('uid');
        if (uid) {
            setStatus(false);
        }
    }, []);

    return (
        <div className="mx-auto dark:bg-[#000614] bg-[#ebf1ff] rounded-lg min-h-screen shadow-lg overflow-hidden mt-5 p-4" style={{ fontFamily: 'Ubuntu Mono' }}>
            <div className="p-4">
                <h1 className="items-center justify-center text-center text-black dark:text-white text-xl font-semibold mb-4">
                    Welcome to NikoKadi
                </h1>
                <p className="text-center text-black dark:text-[#f5f9ff] mb-4">
                    Get ready to experience a unique and thrilling card game!
                </p>

                <div className="flex flex-col items-center justify-center text-center rounded outline-dashed p-4 m-2 bg-white dark:bg-[#1a1a2e] shadow-md">
                    <Tilt>
                        <div className="justify-center items-center max-w-[300px] w-full mx-auto">
                            <Lottie className="w-full h-auto" animationData={cards} loop={false} />
                        </div>
                    </Tilt>
                    <h1 className="text-5xl font-bold text-black dark:text-[#f5f9ff] mt-4">
                        Ikuje Vile Iko
                    </h1>
                    <p className="text-black dark:text-[#f5f9ff] text-xl mb-8">
                        When you hear this, it's time to get nervous!
                    </p>
                    <Link to='/rooms'>
                        <button className="bg-transparent hover:bg-[#0565f5] text-[#360396] font-semibold hover:text-black dark:text-[#f5f9ff] py-2 px-4 border border-blue-500 hover:border-transparent rounded transition-all duration-300">
                            Try it out
                        </button>
                    </Link>
                </div>

                <h1 className="items-center justify-center text-center text-black dark:text-white font-bold text-3xl mt-8 mb-4">
                    Players Stats
                </h1>

                {/* Skeleton Loading for Player Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 py-8">
                    {[1, 2, 3].map((_, index) => (
                        <div key={index} className="flex flex-col items-center justify-center p-4 rounded-lg shadow-lg bg-gray-300 dark:bg-gray-800 animate-pulse">
                            <div className="w-24 h-24 bg-gray-400 dark:bg-gray-600 rounded-full mb-4"></div>
                            <div className="w-2/3 h-6 bg-gray-400 dark:bg-gray-600 rounded mb-2"></div>
                            <div className="w-1/2 h-6 bg-gray-400 dark:bg-gray-600 rounded"></div>
                        </div>
                    ))}
                </div>

                {/* Sign Up / Sign In Section */}
                {status && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-5">
                        <div className="flex flex-col justify-center text-center">
                            <h2 className="text-3xl font-bold text-black dark:text-[#f5f9ff] mb-4">
                                Join the Adventure
                            </h2>
                            <p className="text-black dark:text-[#f5f9ff] text-xl mb-8">
                                Ready to embark on your journey? Sign up today!
                            </p>
                            <div className="flex justify-center gap-4">
                                <Link
                                    to='/signin'
                                    className="w-[30%] px-4 py-2 rounded-lg bg-[#23527f] hover:bg-[#193c5f] text-white font-bold shadow-md transition duration-300">
                                    Login
                                </Link>
                                <Link
                                    to='/signup'
                                    className="w-[30%] px-4 py-2 rounded-lg bg-[#5798d8] hover:bg-[#4373a8] text-white font-bold shadow-md transition duration-300">
                                    Sign Up
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
