import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { PlayPage } from './pages/PlayPage';
import { GameRoomPage } from './pages/GameRoomPage';
import { StatsPage } from './pages/StatsPage';
import { RulesPage } from './pages/RulesPage';
import { PrivacyPage } from './pages/PrivacyPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/play" element={<PlayPage />} />
            <Route path="/room/:roomId" element={<GameRoomPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
          </Routes>
        </main>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(17, 24, 39, 0.9)',
              backdropFilter: 'blur(10px)',
              color: '#f3f4f6',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#f3f4f6',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f3f4f6',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;