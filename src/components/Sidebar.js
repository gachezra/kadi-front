import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BsArrowLeftCircle } from 'react-icons/bs';
import { GiCardAceSpades, GiCardDraw } from "react-icons/gi";
import { SiOpenaccess } from 'react-icons/si';
import { CgProfile } from 'react-icons/cg';
import { FiLogOut } from 'react-icons/fi';
import HamburgerButton from './HamburgerMenuButton/HamburgerButton';
// import cardgame from '../assets/cardgame.svg';
import suits from '../assets/images/suits.png';

const Sidebar = () => {
  const [open, setOpen] = useState(true)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const location = useLocation()
  const userId = localStorage.getItem('uid');

  useEffect(() => {
    setIsLoggedIn(!!userId)
  }, [userId])

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('uid');
  localStorage.removeItem('avatarImage');
  setIsLoggedIn(false);
};

  const linkClass = (path) => `
    flex items-center gap-x-2 p-3 text-base font-normal rounded-lg cursor-pointer
    dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700
    ${location.pathname === path ? 'bg-gray-200 dark:bg-gray-700' : ''}
  `

  return (
    <>
      <div
        className={`${
          open ? 'w-55' : 'w-15'
        } hidden sm:block relative h-screen duration-300 bg-gray-100 p-5 dark:bg-slate-800`}
      >
        <BsArrowLeftCircle
          className={`${
            !open && 'rotate-180'
          } absolute text-2xl bg-white fill-slate-800 rounded-full cursor-pointer top-9 -right-4 dark:fill-gray-400 dark:bg-gray-800`}
          onClick={() => setOpen(!open)}
        />
        <Link to='/'>
          <div className={`flex ${open && 'gap-x-1'} items-center`}>
            <img alt='nikokadi logo' src={suits} style={{height: 50}} />
            {open && (
              <span className='text-xl font-medium whitespace-nowrap dark:text-white'>
                NikoKadi
              </span>
            )}
          </div>
        </Link>
        <div className="flex flex-col justify-between h-[calc(100%-60px)] mt-6">
          <ul>
            <li>
              <Link to="/rooms" className={linkClass('/rooms')}>
                <GiCardAceSpades className="text-xl" title='Rooms' />
                <span className={!open ? 'hidden' : 'block'}>Rooms</span>
              </Link>
            </li>
            <li className="mt-6">
              <Link to="/course" className={linkClass('/course')}>
                <GiCardDraw className="text-xl" title='How to Play' />
                <span className={!open ? 'hidden' : 'block'}>How To</span>
              </Link>
            </li>
          </ul>
          <ul>
            {isLoggedIn ? (
              <>
                <li>
                  <Link to="/profile" className={linkClass('/profile')}>
                    <CgProfile className="text-xl" title='Profile' />
                    <span className={!open ? 'hidden' : 'block'}>Profile</span>
                  </Link>
                </li>
                <li className="mt-6">
                  <Link to='/' onClick={() => logout()} className={linkClass('/logout')}>
                    <FiLogOut className="text-xl" title='Logout' />
                    <span className={!open ? 'hidden' : 'block'}>Log Out</span>
                  </Link>
                </li>
              </>
            ) : (
              <li>
                <Link to='/signin' className={linkClass('/signin')}>
                  <SiOpenaccess className="text-xl" title='sign up' />
                  <span className={!open ? 'hidden' : 'block'}>Sign In / Sign Up</span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
      {/* Mobile Menu */}
      <div className="pt-3 sm:hidden">
        <HamburgerButton
          setMobileMenu={setMobileMenu}
          mobileMenu={mobileMenu}
        />
      </div>
      <div className="sm:hidden">
        <div
          className={`${
            mobileMenu ? 'flex' : 'hidden'
          } absolute z-50 flex-col items-center self-end py-8 mt-16 space-y-6 font-bold sm:w-auto left-6 right-6 dark:text-white bg-gray-50 dark:bg-slate-800 drop-shadow md rounded-xl`}
        >
          <Link to="/rooms" onClick={() => setMobileMenu(false)}>
            <span className={linkClass('/rooms')}>Rooms</span>
          </Link>
          <Link to="/course" onClick={() => setMobileMenu(false)}>
            <span className={linkClass('/course')}>How To</span>
          </Link>
          {isLoggedIn ? (
            <>
              <Link to="/profile" onClick={() => setMobileMenu(false)}>
                <span className={linkClass('/profile')}>Profile</span>
              </Link>
              <Link to='/' onClick={() => {
                setMobileMenu(false)
                logout()
              }}>
                <span className={linkClass('/logout')}>Log Out</span>
              </Link>
            </>
          ) : (
            <Link to="/signin" onClick={() => setMobileMenu(false)}>
              <span className={linkClass('/signin')}>Sign In / Sign Up</span>
            </Link>
          )}
        </div>
      </div>
    </>
  )
}

export default Sidebar
