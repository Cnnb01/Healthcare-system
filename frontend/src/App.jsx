import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Clients from './components/Clients';
import Doctorhp from './components/Doctorhp';
import Login from './components/Login';
import Programs from './components/Programs';
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
          <Route path="/clients" element={<Clients/>}/>
          <Route path="/client/:client_id" element={<Clients/>}/>
          <Route path="/dhome" element={<Doctorhp/>}/>
          <Route path="/rhome" element={<Receptionisthp/>}/>
          <Route path="/programs" element={<Programs/>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App
