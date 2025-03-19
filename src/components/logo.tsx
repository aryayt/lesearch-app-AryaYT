"use client"
import React from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'

const Logo = () => {
    const {resolvedTheme} = useTheme();
  return (
    <Image src={resolvedTheme === "dark" ? "/logo/Lesearch Logo Dark.svg" : "/logo/Lesearch Logo.svg"} alt="Logo" width={32} height={32}/>
  )
}

export default Logo