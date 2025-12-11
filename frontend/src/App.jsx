import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register'; // <--- Import your Register page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        
        {/* THIS LINE IS REQUIRED FOR YOUR BUTTON TO WORK: */}
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;