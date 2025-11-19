import React, { useMemo } from "react";
import { io } from "socket.io-client"

const SocketContext = React.createContext(null)

export const useSocket = () => {
    return React.useContext(SocketContext)
}

const SocketProvider = (props) => {
    const socket = useMemo(() => io(import.meta.env.VITE_SERVER_URL || 'http://localhost:8000'), [])

    return (
        <SocketContext.Provider value={{ socket }}>
            {props.children}
        </SocketContext.Provider>
    )
}

export default SocketProvider
