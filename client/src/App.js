import React from 'react';
import Register from './components/Register';
import './App.css';
import ApolloProvider from './ApolloProvider';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Chitchat from './components/Chitchat';
import Home from './components/Home';
import Login from './components/Login';
import { AuthProvider } from './context/auth';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <ApolloProvider>
            <AuthProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path='/' element={<Home/>} />
                            <Route element={<ProtectedRoute authenticated/>}>
                                <Route path='/chitchat' element={<Chitchat/>} />
                            </Route>
                            <Route path='/register' element={<Register />} />
                            <Route path='/login' element={<Login />} />
                        </Routes>
                    </BrowserRouter>
            </AuthProvider>
        </ApolloProvider>
    );
}

export default App;
