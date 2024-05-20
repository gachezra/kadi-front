import Layout from './components/Layout';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Course from './pages/Course';
import Profile from './pages/Profile';
import SignUp from './pages/Signup';
import Login from './pages/Login';
import AvatarCustomizer from './pages/Customize';
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/dashboard' element={<Dashboard />} />
                    <Route path='/course' element={<Course />} />
                    <Route path='/signin' element={<Login />} />
                    <Route path='/signup' element={<SignUp />} />
                    <Route path='/account' element={<AvatarCustomizer />} />
                    <Route
                        path="/cutomize"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
};

export default App
