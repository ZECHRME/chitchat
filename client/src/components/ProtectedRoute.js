import React from 'react';
import {Outlet} from 'react-router-dom';
import { useAuthState } from '../context/auth';
import Home from './Home';




export default function ProtectedRoute(props) {
    const  {user}  = useAuthState();
    let a=(user)
    
    if (a) {
        console.log("hi")
        return <Outlet />
    } else {
        console.log("bye")
        return <Home/>
    } 
}

