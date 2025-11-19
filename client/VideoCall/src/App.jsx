import { Routes, Route } from "react-router-dom"
import HomePage from "./pages/Home"
import SocketProvider from "./providers/socket"
import RoomPage from "./pages/Room"
import PeerProvider from "./providers/peer"

function App() {

  return (
    <>
      <SocketProvider>
        <PeerProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/room/:roomId" element={<RoomPage />} />
          </Routes>
        </PeerProvider>
      </SocketProvider>
    </>
  )
}

export default App
