import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Clients from './components/Clients';
import Doctorhp from './components/Doctorhp';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Receptionisthp from './components/Receptionisthp';
import Signup from './components/Signup';
import './App.css'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <Router>
        <Routes>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/" element={<Login/>}/>
          <Route path="/clients" element={<ProtectedRoute requiredRole="doctor@gmail.com"><Clients/></ProtectedRoute>}/>
          <Route path="/dhome" element={<ProtectedRoute requiredRole="doctor@gmail.com"><Doctorhp/></ProtectedRoute>}/>
          <Route path="/rhome" element={<Receptionisthp/>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App
