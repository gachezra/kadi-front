import React from 'react'
import Toggle from './ThemeToggle'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className='bg-white border-gray-200 mx-1 px-2 py-2 rounded dark:bg-gray-800'>
      <div className='container flex justify-between items-center mx-auto pt-3'>
        <div className='flex items-center mx-auto'>
          <Link to='/'>
            <span className='text-xl font-medium whitespace-nowrap dark:text-white'>
              NikoKadi
            </span>
          </Link>
        </div>

        <div className='flex justify-end'>
          <Toggle />
        </div>
      </div>
    </nav>
  )
}

export default Navbar
