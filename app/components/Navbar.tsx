"use client"
import React from 'react'
import Auth from './Auth'

const Navbar = () => {
  return (
    <div className='h-15 w-full bg-[#ffff] flex gap-5 items-center justify-between px-10 border-b-4 border-[#f1f3f6]'>
        <h2 className='font-bold'>Chat App</h2>
        <Auth />
    </div>
  )
}

export default Navbar