"use client"
import React from 'react';
import Navbar from "./components/navbar";
import { useRouter } from 'next/navigation';


export default function Home() {
  const router = useRouter();
    return (
      
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <main className="flex flex-col items-center justify-center py-10">
                <h1 className="text-4xl font-bold mb-4">Welcome to My App</h1>
                <button 
                  className="bg-blue-700 border rounded-md text-white text-md font-bold px-4 py-2" 
                  onClick={() => router.push('/profileCreation')}
                >
                  Get Started
                </button>
            </main>
        </div>
    );
}
