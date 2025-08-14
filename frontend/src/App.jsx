import React from 'react'
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom'
import Home from './pages/Home'
import NoPage from './pages/NoPage'
import SignUp from './pages/SignUp'
import './App.css'
import Login from './pages/Login'
import Editor from './pages/Editor'
const App = () => {
  return (
    <div>
      <BrowserRouter>
      <RouteHandler/>
      </BrowserRouter>
    </div>
  )
};
const RouteHandler=()=>{
  const isLoggedIn=localStorage.getItem("isLoggedIn");
  return(
    <Routes>
        <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to={"/login"}/>} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/editor/:id" element={isLoggedIn ? <Editor /> : <Navigate to={"/login"}/>} />
        <Route path="*" element={<NoPage />} />
      </Routes>
  )

}

export default App
