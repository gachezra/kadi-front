import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './components/ThemeContext'
import Background from './components/Background'
import reportWebVitals from './reportWebVitals';
import { AuthContextProvider } from "./context/AuthContext";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ThemeProvider>
            <Background>
                <AuthContextProvider>
                    <App />
                </AuthContextProvider>
            </Background>
        </ThemeProvider>
    </React.StrictMode>
)

reportWebVitals();