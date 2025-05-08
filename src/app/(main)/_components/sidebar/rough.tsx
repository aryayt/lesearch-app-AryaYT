"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, MessageSquare, MoreHorizontal, Lock } from 'lucide-react';

const RightSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div 
      className={`h-full bg-white transition-all duration-200 ease-in-out flex flex-col ${
        isExpanded ? 'w-[320px]' : 'w-[50px]'
      }`}
      style={{ 
        order: 3, 
        display: 'flex', 
        flexDirection: 'column', 
        width: isExpanded ? '320px' : '50px', 
        overflow: 'hidden',
        isolation: 'auto', 
        background: 'transparent'
      }}
    >
      {/* Header */}
      <header className="bg-white max-w-full z-[100] user-select-none">
        <div className="opacity-100 transition-duration-200">
          <div className="notion-topbar w-full max-w-full h-11 opacity-100 transition-opacity-700 relative left-0">
            <div className="flex justify-between items-center overflow-hidden h-11 px-3">
              {isExpanded && (
                <div className="flex items-center line-height-1.2 text-sm h-full flex-grow-0 mr-2 min-w-0">
                  <div className="flex items-center h-6 px-1.5 rounded-md whitespace-nowrap text-sm cursor-pointer">
                    <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[240px]">
                      DSA
                    </div>
                  </div>
                  <div className="flex items-center h-6 px-1.5 rounded-md whitespace-nowrap text-sm cursor-pointer">
                    <Lock size={16} className="text-gray-400" />
                    <span className="text-gray-500 ml-1 mr-1">Private</span>
                    <ChevronRight size={11} className="text-gray-400" />
                  </div>
                </div>
              )}
              
              {isExpanded && (
                <div className="flex-grow-1 flex-shrink-1" />
              )}
              
              {isExpanded && (
                <div className="flex-grow-0 flex-shrink-0 flex items-center pl-2.5 justify-between z-[101] h-11 opacity-100 transition-opacity-700 w-[385px]">
                  <div />
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <button 
                        type="button"
                        className="cursor-pointer flex items-center h-7 px-2 rounded-md whitespace-nowrap text-sm"
                      >
                        Share
                      </button>
                    </div>
                    <div className="flex items-center">
                      <button 
                        type="button"
                        className="cursor-pointer flex items-center justify-center flex-shrink-0 rounded-md h-7 w-[34px] p-0 mr-0.5 bg-gray-100"
                      >
                        <MessageSquare size={22} className="text-gray-800" />
                      </button>
                    </div>
                    <div className="flex items-center">
                      <button 
                        type="button"
                        className="cursor-pointer flex items-center justify-center flex-shrink-0 rounded-md h-7 w-[34px] p-0 mr-0.5"
                      >
                        <Star size={22} className="text-yellow-400" />
                      </button>
                    </div>
                    <div className="flex items-center">
                      <button 
                        type="button"
                        className="cursor-pointer flex items-center justify-center w-[34px] h-7 rounded-md"
                      >
                        <MoreHorizontal size={22} className="text-gray-800" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="notion-frame flex-grow-0 flex-shrink-1 flex flex-col bg-white z-1 h-[calc(100vh-44px)] max-h-full relative w-full opacity-100 transform-translate-x-0 transition-duration-200">
        {isExpanded && (
          <div className="notion-scroller vertical z-1 flex flex-col flex-grow-1 relative items-center overflow-auto">
            <div className="sticky-portal-target" style={{ position: 'sticky', zIndex: 85, width: '100%', top: 0, left: 0, height: 0 }} />
            
            {/* Content Area */}
            <div className="w-full flex flex-col items-center flex-grow-1">
              <div className="max-w-full px-4 w-full">
                <div className="notion-page-controls flex pt-20 pb-1 justify-start flex-wrap -ml-0.5 text-gray-500">
                  {/* Page controls */}
                </div>
              </div>
              
              <div className="px-4">
                <div className="text-[#37352f] font-bold text-4xl flex items-center">
                  <h1 className="max-w-full w-full whitespace-pre-wrap break-words py-0.5 px-0.5">DSA</h1>
                </div>
              </div>
              
              <div className="mt-2 -ml-0.5">
                <div className="notion-page-content flex-shrink-0 flex-grow-1 max-w-full flex items-start flex-col text-base leading-normal w-full z-4 py-2">
                  <div className="w-full max-w-[695px] mt-8 mb-1">
                    <div className="flex w-full">
                      <h2 className="max-w-full w-full whitespace-pre-wrap break-words py-0.5 px-0.5 font-semibold text-3xl leading-tight">Patterns</h2>
                    </div>
                  </div>
                  
                  <div className="w-full max-w-[695px] my-0.5">
                    <div className="flex">
                      <a href="https://instabyte.io/p/interview-master-100" className="cursor-pointer text-inherit no-underline border-b-[0.05em] border-[rgba(55,53,47,.4)] opacity-70">
                        🚀 Interview Master 100 (instabyte.io)
                      </a>
                    </div>
                  </div>
                  
                  <div className="w-full max-w-[695px] my-0.5">
                    <div className="flex">
                      <div className="max-w-full w-full whitespace-pre-wrap break-words py-0.5 px-0.5 min-h-[1em] text-gray-500" />
                    </div>
                  </div>
                  
                  {/* Pattern List */}
                  <div className="w-full max-w-[695px] my-0.5">
                    <div className="flex">
                      <div className="max-w-full w-full whitespace-pre-wrap break-words py-0.5 px-0.5">
                        🔹 Prefix Sum
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full max-w-[695px] my-0.5">
                    <div className="flex">
                      <div className="max-w-full w-full whitespace-pre-wrap break-words py-0.5 px-0.5">
                        🔹 Two Pointers
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full max-w-[695px] my-0.5">
                    <div className="flex">
                      <div className="max-w-full w-full whitespace-pre-wrap break-words py-0.5 px-0.5">
                        🔹 Sliding Window
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full max-w-[695px] my-0.5">
                    <div className="flex">
                      <div className="max-w-full w-full whitespace-pre-wrap break-words py-0.5 px-0.5">
                        🔹 Fast and Slow Pointers
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full max-w-[695px] my-0.5">
                    <div className="flex">
                      <div className="max-w-full w-full whitespace-pre-wrap break-words py-0.5 px-0.5">
                        🔹 Monotonic Stack
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Toggle Button */}
        {!isExpanded && (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="absolute top-2 left-2 p-1 rounded-md hover:bg-gray-100"
            aria-label="Expand sidebar"
          >
            <ChevronRight size={16} />
          </button>
        )}
        
        {isExpanded && (
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="absolute top-2 right-2 p-1 rounded-md hover:bg-gray-100"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </main>
    </div>
  );
};

export default RightSidebar;