import React,{useCallback} from "react";
import {useNavigate} from 'react-router-dom'
import { useSocket } from "../providers/Socket";
import { useState,useEffect } from "react";

const HomePage = () => {
    const {socket} = useSocket()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [roomId, setRoomId] = useState('')

    
    const handleRoomJoined = useCallback(({roomId}) => {
        navigate(`/room/${roomId}`)
    },[navigate])

    useEffect(() => {
        socket.on('joined-room',handleRoomJoined)

        return () => {
            socket.off('joined-room',handleRoomJoined )
        }
    },[handleRoomJoined, socket])

    const handleJoinRoom = () => {
        socket.emit('join-room', {emailId: email, roomId})
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center p-5" style={{ background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)' }}>
            <div className="bg-white p-16 rounded-sm shadow-xl max-w-lg w-full border-t-4" style={{ borderTopColor: '#FF7878' }}>
                <h1 className="text-5xl font-light text-gray-900 mb-3 tracking-tight">VideoCall</h1>
                <p className="text-gray-600 mb-12 font-light text-sm tracking-wide uppercase">Professional Video Conferencing</p>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">Email Address</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="your@email.com" 
                            className="w-full px-4 py-3 border-b-2 text-base transition-all focus:outline-none bg-transparent"
                            style={{ 
                                borderColor: '#e0e0e0'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#FF7878'
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e0e0e0'
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">Room ID</label>
                        <input 
                            type="text" 
                            value={roomId} 
                            onChange={(e) => setRoomId(e.target.value)} 
                            placeholder="Enter room identifier" 
                            className="w-full px-4 py-3 border-b-2 text-base transition-all focus:outline-none bg-transparent"
                            style={{ 
                                borderColor: '#e0e0e0'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#FF7878'
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e0e0e0'
                            }}
                        />
                    </div>
                    <button 
                        onClick={handleJoinRoom} 
                        className="w-full py-4 text-white border-none text-sm font-medium cursor-pointer transition-all hover:opacity-90 uppercase tracking-widest mt-8"
                        style={{ 
                            background: '#FF7878'
                        }}
                    >
                        Join Conference
                    </button>
                </div>
            </div>
        </div>
    )
}

export default HomePage