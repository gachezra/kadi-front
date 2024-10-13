import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
// import { FaGoogle } from "react-icons/fa";
import axios from 'axios';
import { loginRoute } from '../utils/APIRoutes'

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('token');

    if (user) {
      navigate('/');
    }
  }, [navigate]);

  // const handleGoogleSignin = () => {
  //   // TODO: Implement Google Sign-In
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await axios.post( loginRoute, {
        email,
        password,
    });

    const { uid, token} = response.data;

    // Save to localStorage
    localStorage.setItem('uid', uid);
    localStorage.setItem('token', token);

    // Redirect to home page or dashboard
    navigate('/rooms');
  };

    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-[#000614] bg-[#ebf1ff] rounded-lg shadow-lg">
        <div className="main bg-gray-200  rounded-lg shadow-md p-10 transition-transform w-full mx-4 max-w-md text-center">
          <h1 className="text-green-600 text-3xl">NikoKadi</h1>
          <h3 className="text-lg">Login to your account</h3>
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
            <label htmlFor="email" className="block mt-4 mb-2 text-left  text-gray-700 font-bold">
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
            <div className="flex justify-center items-center">
              <button
                type="submit"
                className="bg-green-600 text-white py-3 px-6 rounded-md cursor-pointer transition-colors duration-300 hover:bg-green-500"
              >
                Submit
              </button>
            </div>
          </form>
          <p className="mt-4">
            Don&apos;t have an account?{" "}
            <Link to='/signup' className="text-blue-500 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    );
}

export default Login;