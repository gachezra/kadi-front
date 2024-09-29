import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './chat/app/store';
import { ThemeProvider } from './components/ThemeContext'
import Background from './components/Background'
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ThemeProvider>
            <Background>
                <Provider store={store}>
                    <App />
                </Provider>
            </Background>
        </ThemeProvider>
    </React.StrictMode>
)

reportWebVitals();