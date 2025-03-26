"use client"
import React from 'react'
import { useParams } from 'next/navigation'

const Page = () => {
const params = useParams()
const pageId = params.pageId;
  return (
    <div>{pageId}</div>
  )
}

export default Page