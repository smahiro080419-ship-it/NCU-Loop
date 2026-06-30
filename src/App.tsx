import { Route, Routes } from 'react-router-dom'
import './App.css'
import Welcome from './pages/Welcome'
import SignUp from './pages/SignUp'
import Verify from './pages/Verify'
import Login from './pages/Login'
import Market from './pages/Market'
import Listing from './pages/Listing'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="/login" element={<Login />} />
      <Route path="/market" element={<Market />} />
      <Route path="/listing" element={<Listing />} />
    </Routes>
  )
}

export default App
