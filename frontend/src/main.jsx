import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import "./index.css";  
import { BrowserRouter } from "react-router-dom";
import {Toaster} from 'react-hot-toast';
import { AuthProvider } from "./context/AuthContext";


ReactDOM.createRoot(document.getElementById('root')).render(

    <BrowserRouter>
        <AuthProvider>
          <Toaster position="top-center" reverseOrder={false} toastOptions={{ duration: 3000 }} />
          <App />
        </AuthProvider>
    </BrowserRouter>
)
