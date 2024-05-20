import React from 'react'
import { Link } from'react-router-dom';
import Lottie from "lottie-react";
import Tilt from 'react-parallax-tilt';
import cards from '../assets/images/playing-cards.json';

const Home = () => {
    return (
        <div className="mx-auto dark:bg-[#000614] bg-[#ebf1ff] rounded-lg shadow-lg overflow-hidden mt-5 p-4" style={{ fontFamily: "Ubuntu Mono" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
                <div className="flex flex-col justify-center text-center rounded outline-dashed m-2">
                    <h1 className="text-5xl font-bold text-black  dark:text-[#f5f9ff] mb-4">
                        Discover Unforgettable Adventures
                    </h1>
                    <p className="text-black dark:text-[#f5f9ff] text-xl mb-8">
                        Embark on a journey through captivating worlds in our latest game
                        release. Prepare to be amazed!
                    </p>
                    <Link to='/game'>
                        <button className="bg-transparent hover:bg-[#0565f5] text-[#360396] font-semibold hover:text-black dark:text-[#f5f9ff] py-2 px-4 border border-blue-500 hover:border-transparent rounded">
                            Check it out!
                        </button>
                    </Link>
                
                </div>
                <div className="relative">
                <div className="justify-center items-center mb-0">
                    <Tilt>
                        <Lottie
                            className='sm:w-100 h-auto'
                            animationData={cards} 
                            loop={false} 
                        />
                    </Tilt>
                </div>
                <div className="inset-0 flex justify-center items-center hover:opacity-75 transition duration-300">
                    <Link to='/game'>
                    <span className="text-black dark:text-[#f5f9ff] text-3xl font-bold px-4 py-2bg-opacity-50">
                        Explore
                    </span>
                    </Link>
                </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-5">
                {/* Add your additional sections here */}
                <div className="flex flex-col justify-center text-center">
                <h2 className="text-3xl font-bold text-black dark:text-[#f5f9ff] mb-4">
                    Join the Adventure
                </h2>
                <p className="text-black dark:text-[#f5f9ff] text-xl mb-8">
                    Ready to embark on your journey? Sign up today!
                </p>
                <div className="flex justify-center gap-4">
                    <Link to='/signin' className="w-[30%] px-4 py-2 rounded-lg bg-[#23527f] hover:bg-[#193c5f] text-white font-bold shadow-md transition duration-300">Login</Link>
                    <Link to='/signup' className="w-[30%] px-4 py-2 rounded-lg bg-[#5798d8] hover:bg-[#4373a8] text-white font-bold shadow-md transition duration-300">Sign Up</Link>
                </div>
                </div>
            </div>
            </div>
    );
}

export default Home
