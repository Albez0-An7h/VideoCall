import React, { useMemo,useEffect,useState } from "react";
import { useCallback } from "react";

const PeerContext = React.createContext(null)



export const usePeer = () => React.useContext(PeerContext)

const PeerProvider = (props) => {

    const [remoteStream, setRemoteStream] = useState(null)


    const peer = useMemo(() => new RTCPeerConnection({
        iceServers: [
            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:global.stun.twilio.com:3478"
                ]
            }
        ]
    }), [])

    const addIceCandidate = async (candidate) => {
        try {
            await peer.addIceCandidate(new RTCIceCandidate(candidate))
            console.log('ICE candidate added successfully')
        } catch (error) {
            console.error('Error adding ICE candidate:', error)
        }
    }

    const createOffer = async  () => {
        const offer = await peer.createOffer()
        await peer.setLocalDescription(offer)
        return offer
    }

    const createAnswer = async (offer) => {
        await peer.setRemoteDescription(offer)
        const answer = await peer.createAnswer()
        await peer.setLocalDescription(answer)
        return answer
    }

    const setRemoteAnswer = async(ans) => {
        await peer.setRemoteDescription(ans)
    }

    const sendStream = async (stream) => {
        const tracks = stream.getTracks()
        const senders = peer.getSenders()
        
        for(const track of tracks){
            const existingSender = senders.find(sender => sender.track === track)
            if (!existingSender) {
                peer.addTrack(track, stream)
            }
        }
    }

    const handleTrackEvent = useCallback((ev) => {
        const streams = ev.streams
        console.log('Track event received:', ev)
        console.log('Remote stream:', streams[0])
        console.log('Remote stream tracks:', streams[0].getTracks())
        setRemoteStream(streams[0])
    },[])

    useEffect(() => {
        peer.addEventListener('track', handleTrackEvent)
        
        peer.addEventListener('iceconnectionstatechange', () => {
            console.log('ICE connection state:', peer.iceConnectionState)
        })
        
        peer.addEventListener('connectionstatechange', () => {
            console.log('Connection state:', peer.connectionState)
        })
        
        peer.addEventListener('signalingstatechange', () => {
            console.log('Signaling state:', peer.signalingState)
        })

        return () => {
            peer.removeEventListener('track', handleTrackEvent)
        }
    },[handleTrackEvent,peer])

    return (
        <PeerContext.Provider value={{ peer, createOffer, createAnswer, setRemoteAnswer, sendStream, remoteStream, addIceCandidate }}>{props.children}</PeerContext.Provider>
    )
}

export default PeerProvider