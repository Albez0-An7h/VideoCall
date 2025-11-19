import React, { useEffect, useCallback, useRef } from "react";
import { useSocket } from "../providers/socket";
import { usePeer } from "../providers/peer";
import { useState } from "react";

const RoomPage = () => {
    const { socket } = useSocket()
    const { peer, createOffer, setRemoteAnswer, remoteStream, addIceCandidate } = usePeer()
    const [myStream, setMyStream] = useState(null)
    const [remoteEmailId, setRemoteEmailId] = useState()
    
    const myVideoRef = useRef(null)
    const remoteVideoRef = useRef(null)

    const handleNewUserJoined = useCallback(async (data) => {
        const { emailId } = data
        console.log('new user joined room', emailId)
        setRemoteEmailId(emailId)
        
        const offer = await createOffer()
        console.log('Offer created:', offer)
        socket.emit('call-user', { emailId, offer })
    }, [createOffer, socket])

    const handleIncomingCall = useCallback(async (data) => {
        const { from, offer } = data
        console.log('Incoming call from', from, offer)
        setRemoteEmailId(from)
        
        await peer.setRemoteDescription(new RTCSessionDescription(offer))
        console.log('Remote description set from offer')
        
        const ans = await peer.createAnswer()
        await peer.setLocalDescription(ans)
        
        console.log('Answer created:', ans)
        socket.emit('call-accepted', { emailId: from, ans })
    }, [socket, peer])

    const handleCallAccepted = useCallback(async (data) => {
        const { ans } = data
        console.log('call accepted', ans)
        console.log('Current signaling state:', peer.signalingState)
        
        if (peer.signalingState === 'have-local-offer') {
            await setRemoteAnswer(ans)
        } else {
            console.log('Ignoring answer, wrong state:', peer.signalingState)
        }
    }, [setRemoteAnswer, peer])

    const getUserMediaStream = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            setMyStream(stream)
            
            console.log('Adding my stream tracks to peer connection')
            const tracks = stream.getTracks()
            for (const track of tracks) {
                peer.addTrack(track, stream)
                console.log('Added track to peer:', track.kind)
            }
        } catch (error) {
            console.error('Error accessing camera/microphone:', error)
            alert('Please allow camera and microphone access to use video call')
        }
    }, [peer])

    const handleIceCandidate = useCallback((data) => {
        const { candidate } = data
        console.log('Received ICE candidate:', candidate)
        addIceCandidate(candidate)
    }, [addIceCandidate])

    useEffect(() => {
        socket.on('user-joined', handleNewUserJoined)
        socket.on('incoming-call', handleIncomingCall)
        socket.on('call-accepted', handleCallAccepted)
        socket.on('ice-candidate', handleIceCandidate)

        return () => {
            socket.off('user-joined', handleNewUserJoined)
            socket.off('incoming-call', handleIncomingCall)
            socket.off('call-accepted', handleCallAccepted)
            socket.off('ice-candidate', handleIceCandidate)
        }
    }, [handleCallAccepted, handleIncomingCall, handleNewUserJoined, socket, handleIceCandidate])

    useEffect(() => {
        
        peer.addEventListener('icecandidate', (event) => {
            if (event.candidate && remoteEmailId) {
                console.log('Sending ICE candidate:', event.candidate)
                socket.emit('ice-candidate', { emailId: remoteEmailId, candidate: event.candidate })
            }
        })

        return () => {}
    },[peer, socket, remoteEmailId])

    useEffect(() => {
        getUserMediaStream()
    }, [])

    useEffect(() => {
        if (myVideoRef.current && myStream) {
            myVideoRef.current.srcObject = myStream
        }
    }, [myStream])

    useEffect(() => {
        console.log('Remote stream changed:', remoteStream)
        if (remoteVideoRef.current && remoteStream) {
            console.log('Setting remote video srcObject')
            remoteVideoRef.current.srcObject = remoteStream
        }
    }, [remoteStream])

    return (
        <div className="min-h-screen p-8 relative" style={{ background: '#1a1a1a' }}>
            <div className="mb-12">
                <h1 className="text-4xl font-light text-white mb-2 tracking-tight">Conference Room</h1>
                {remoteEmailId && <p className="text-gray-400 text-sm uppercase tracking-wider">Session with: {remoteEmailId}</p>}
            </div>
            
            <div className="max-w-7xl mx-auto mb-6">
                <div className="bg-gray-900 overflow-hidden transition-all border border-gray-800 hover:border-gray-700">
                    <div className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: '#2a2a2a' }}>
                        <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">{remoteEmailId || 'Awaiting Connection'}</h3>
                        <span 
                            className="px-3 py-1 text-xs font-medium uppercase tracking-wider"
                            style={{
                                background: remoteStream ? 'transparent' : 'transparent',
                                color: remoteStream ? '#10b981' : '#6b7280',
                                border: '1px solid',
                                borderColor: remoteStream ? '#10b981' : '#6b7280'
                            }}
                        >
                            {remoteStream ? 'Live' : 'Offline'}
                        </span>
                    </div>
                    <video 
                        ref={remoteVideoRef} 
                        autoPlay 
                        className="w-full object-cover bg-black"
                        style={{ height: '70vh' }}
                    />
                </div>
            </div>

            <div className="fixed bottom-8 right-8 w-80 z-10">
                <div className="bg-gray-900 overflow-hidden transition-all border-2 border-gray-700 shadow-2xl">
                    <div className="flex justify-between items-center px-4 py-2 border-b" style={{ borderColor: '#2a2a2a' }}>
                        <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wider">Your Feed</h3>
                        <span 
                            className="px-2 py-1 text-xs font-medium uppercase tracking-wider"
                            style={{
                                background: myStream ? 'transparent' : 'transparent',
                                color: myStream ? '#10b981' : '#6b7280',
                                border: '1px solid',
                                borderColor: myStream ? '#10b981' : '#6b7280'
                            }}
                        >
                            {myStream ? 'Live' : 'Offline'}
                        </span>
                    </div>
                    <video 
                        ref={myVideoRef} 
                        autoPlay 
                        muted 
                        className="w-full h-48 object-cover bg-black"
                    />
                </div>
            </div>
        </div>
    )
}

export default RoomPage