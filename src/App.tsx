import { Route, Routes } from 'react-router-dom'
import './App.css'
import Welcome from './pages/Welcome'
import SignUp from './pages/SignUp'
import Verify from './pages/Verify'
import Login from './pages/Login'
import CampusSelect from './pages/CampusSelect'
import Market from './pages/Market'
import Listing from './pages/Listing'
import BookDetail from './pages/BookDetail'
import Chat from './pages/Chat'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="/login" element={<Login />} />
      <Route path="/campus" element={<CampusSelect />} />
      <Route path="/market" element={<Market />} />
      <Route path="/listing" element={<Listing />} />
      <Route path="/book" element={<BookDetail />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  )
}

export default App
