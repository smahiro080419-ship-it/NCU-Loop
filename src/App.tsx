import { Route, Routes } from 'react-router-dom'
import './App.css'
import Welcome from './pages/Welcome'
import SignUp from './pages/SignUp'
import Verify from './pages/Verify'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/verify" element={<Verify />} />
    </Routes>
  )
}

export default App
