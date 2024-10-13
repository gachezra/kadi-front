import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
// import { FaGoogle } from "react-icons/fa";
import axios from 'axios';
import { registerRoute } from '../utils/APIRoutes';

const Signup = () => {
    const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('token');

    if (user) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check password length
    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    await axios.post( registerRoute, {
        email,
        username,
        password,
    })
    // On success, redirect to login
    navigate('/signin');
  };

    // const handleGoogleSignin = async () => {
    //     try {
    //         await googleLogin();
    //         navigate("/account");
    //     } catch (err) {
    //         setError(err.message);
    //         console.log(err.message);
    //     }
    // };

    return (
        <div className="flex items-center justify-center min-h-screen dark:bg-[#000614] bg-[#ebf1ff] rounded-lg shadow-lg">
            <div className="main bg-gray-200 rounded-lg shadow-md p-10 mx-4 transition-transform w-full max-w-md text-center">
                <h1 className="text-green-600 text-3xl">NikoKadi</h1>
                <h3 className="text-lg">Create a new account</h3>
                {/* <div className="my-4 flex justify-center">
                    <button
                        onClick={handleGoogleSignin}
                        type="button"
                        className="mx-1 h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-[0_4px_9px_-4px_#3b71ca] flex items-center justify-center"
                    >
                        <FaGoogle size={20} />
                    </button>
                </div>
                <div className="my-5 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-neutral-300 after:mt-0.5 after:flex-1 after:border-t after:border-neutral-300">
                    <p className="mx-4 mb-0 text-center font-semibold text-slate-500">
                        Or
                    </p>
                </div> */}
                <form onSubmit={handleSubmit}>
                    <label htmlFor="username" className="block mt-4 mb-2 text-left text-gray-700 font-bold">
                        Username:
                    </label>
                    <input
                        className="block w-full mb-6 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-400"
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your Username"
                        required
                    />
                    <label htmlFor="email" className="block mt-4 mb-2 text-left text-gray-700 font-bold">
                        Email:
                    </label>
                    <input
                        className="block w-full mb-6 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-400"
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your Email"
                        required
                    />
                    <label htmlFor="password" className="block mb-2 text-left text-gray-700 font-bold">
                        Password:
                    </label>
                    <input
                        className="block w-full mb-6 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-400"
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your Password"
                        required
                    />
                    <label htmlFor="confirmPassword" className="block mb-2 text-left text-gray-700 font-bold">
                        Confirm Password:
                    </label>
                    <input
                        className="block w-full mb-6 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-400"
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your Password"
                        required
                    />
                    <div className="flex justify-center items-center">
                        <button
                            type="submit"
                            className="bg-green-600 text-white py-3 px-6 rounded-md cursor-pointer transition-colors duration-300 hover:bg-green-500"
                        >
                            Sign Up
                        </button>
                    </div>
                </form>
                <p className="mt-4">
                    Already have an account?{" "}
                    <Link to='/signin' className="text-blue-500 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;