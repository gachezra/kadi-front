import Layout from './components/Layout';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Rooms from './pages/Rooms';
import Room from './pages/Room';
import Course from './pages/Course';
import Profile from './pages/Profile';
import SignUp from './pages/Signup';
import Login from './pages/Login';
import Customize from './pages/Customize';
import AboutUs from './pages/AboutUs';
import PrivacyPolicy from './pages/PrivacyPolicy';

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/rooms' element={<Rooms />} />
                    <Route path="/rooms/:roomId" element={<Room/>} />
                    <Route path='/course' element={<Course />} />
                    <Route path='/signin' element={<Login />} />
                    <Route path='/signup' element={<SignUp />} />
                    <Route path='/customize' element={<Customize />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
};

export default App
