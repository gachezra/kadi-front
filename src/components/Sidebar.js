import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BsArrowLeftCircle } from 'react-icons/bs'
import { GiCardAceSpades } from "react-icons/gi";
import { SiFuturelearn, SiOpenaccess } from 'react-icons/si';
import { CgProfile } from 'react-icons/cg'
import Logo from '../assets/images/logo.svg'
import HamburgerButton from './HamburgerMenuButton/HamburgerButton'

const Sidebar = () => {
  const [open, setOpen] = useState(true)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const userId = localStorage.getItem('uid');

    if (userId) {
      setIsLoggedIn(true)
    }
  }, [])

  const Menus = [
    { title: 'Rooms', path: '/rooms', src: <GiCardAceSpades /> },
    { title: 'How To', path: '/course', src: <SiFuturelearn /> },
    { title: 'Profile', path: '/profile', src: <CgProfile />, requiredAuth: true },
    { title: 'Sign In', path: '/signin', src: <SiOpenaccess />, gap: 'true', requiredAuth: false },
  ]

  return (
    <>
      <div
        className={`${
          open ? 'w-50' : 'w-250'
        } hidden sm:block relative duration-300 bg-gray-100 border-r border-gray-200 dark:border-gray-700 p-5 dark:bg-slate-800`}
      >
        <BsArrowLeftCircle
          className={`${
            !open && 'rotate-180'
          } absolute text-2xl bg-white fill-slate-800 rounded-full cursor-pointer top-9 -right-4 dark:fill-gray-400 dark:bg-gray-800`}
          onClick={() => setOpen(!open)}
        />
        <Link to='/'>
          <div className={`flex ${open && 'gap-x-2'} items-center`}>
            <img src={Logo} alt='' className='pl-2' />
            {open && (
              <span className='text-xl font-medium whitespace-nowrap dark:text-white'>
                NikoKadi
              </span>
            )}
          </div>
        </Link>
        <ul className='pt-6'>
          {Menus.map((menu, index) => (
            ((menu.requiredAuth && isLoggedIn) || (!menu.requiredAuth && !isLoggedIn) || !menu.hasOwnProperty('requiredAuth')) && (
              <Link to={menu.path} key={index}>
                <li
                  className={`flex items-center gap-x-2 p-3 text-base font-normal rounded-lg cursor-pointer dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700
                  ${menu.gap ? 'mt-8' : 'mt-6'} ${
                    location.pathname === menu.path &&
                    'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span className='text-xl' title={!open ? menu.title : ''}>{menu.src}</span>
                  <span
                    className={`${
                      !open && 'hidden'
                    } origin-left duration-300 hover:block`}
                  >
                    {menu.title}
                  </span>
                </li>
              </Link>
            )
          ))}
        </ul>
      </div>
      {/* Mobile Menu */}
      <div className="pt-3">
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
          {Menus.map((menu, index) => (
            ((menu.requiredAuth && isLoggedIn) || (!menu.requiredAuth && !isLoggedIn) || !menu.hasOwnProperty('requiredAuth')) && (
              <Link
                to={menu.path}
                key={index}
                onClick={() => setMobileMenu(false)}
              >
                <span
                  className={`${
                    location.pathname === menu.path &&
                    'bg-gray-200 dark:bg-gray-700'
                  } p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700`}
                >
                  {menu.title}
                </span>
              </Link>
            )
          ))}
        </div>
      </div>
    </>
  )
}

export default Sidebar