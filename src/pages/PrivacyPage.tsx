import React from 'react';
import { Shield, Eye, Database, Lock, Users, Clock } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
        <p className="text-xl text-gray-300">
          Your privacy matters to us. Learn how we protect your data.
        </p>
      </div>

      {/* Quick Overview */}
      <GlassCard className="p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="text-green-400" size={24} />
          <h2 className="text-2xl font-bold text-white">Privacy at a Glance</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Lock className="mx-auto mb-3 text-blue-400" size={32} />
            <h3 className="text-lg font-semibold text-white mb-2">No Registration</h3>
            <p className="text-gray-400 text-sm">Play without creating accounts or providing personal information</p>
          </div>
          
          <div className="text-center">
            <Database className="mx-auto mb-3 text-green-400" size={32} />
            <h3 className="text-lg font-semibold text-white mb-2">Local Storage Only</h3>
            <p className="text-gray-400 text-sm">Your data stays on your device using browser storage</p>
          </div>
          
          <div className="text-center">
            <Eye className="mx-auto mb-3 text-purple-400" size={32} />
            <h3 className="text-lg font-semibold text-white mb-2">Minimal Data</h3>
            <p className="text-gray-400 text-sm">We only collect what's necessary for gameplay</p>
          </div>
        </div>
      </GlassCard>

      {/* Data Collection */}
      <GlassCard className="p-8">
        <h2 className="text-2xl font-bold text-white mb-6">What Data Do We Collect?</h2>
        
        <div className="space-y-6">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-300 mb-3">Local Storage Data</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• <strong>User ID:</strong> A randomly generated UUID to identify you in games</li>
              <li>• <strong>Username:</strong> Your chosen display name (can be changed anytime)</li>
              <li>• <strong>Game Preferences:</strong> Settings you choose for better experience</li>
            </ul>
            <p className="text-sm text-gray-400 mt-3">
              This data is stored locally in your browser and never sent to external servers except during active gameplay.
            </p>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-300 mb-3">Game Session Data</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• <strong>Room Participation:</strong> Which game rooms you join or create</li>
              <li>• <strong>Game Actions:</strong> Cards played, moves made (only during active games)</li>
              <li>• <strong>Chat Messages:</strong> Messages sent in game rooms (if chat feature is used)</li>
            </ul>
            <p className="text-sm text-gray-400 mt-3">
              This data is temporary and only exists during active game sessions.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Data Usage */}
      <GlassCard className="p-8">
        <h2 className="text-2xl font-bold text-white mb-6">How Do We Use Your Data?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">✅ What We Do</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start space-x-2">
                <Users className="text-green-400 mt-0.5 flex-shrink-0" size={16} />
                <span>Enable multiplayer gameplay and room management</span>
              </li>
              <li className="flex items-start space-x-2">
                <Clock className="text-green-400 mt-0.5 flex-shrink-0" size={16} />
                <span>Maintain game state and session continuity</span>
              </li>
              <li className="flex items-start space-x-2">
                <Database className="text-green-400 mt-0.5 flex-shrink-0" size={16} />
                <span>Generate anonymous game statistics</span>
              </li>
              <li className="flex items-start space-x-2">
                <Shield className="text-green-400 mt-0.5 flex-shrink-0" size={16} />
                <span>Prevent cheating and ensure fair gameplay</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">❌ What We Don't Do</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start space-x-2">
                <Eye className="text-red-400 mt-0.5 flex-shrink-0" size={16} />
                <span>Track your browsing or personal activities</span>
              </li>
              <li className="flex items-start space-x-2">
                <Database className="text-red-400 mt-0.5 flex-shrink-0" size={16} />
                <span>Sell or share your data with third parties</span>
              </li>
              <li className="flex items-start space-x-2">
                <Users className="text-red-400 mt-0.5 flex-shrink-0" size={16} />
                <span>Require personal information or registration</span>
              </li>
              <li className="flex items-start space-x-2">
                <Lock className="text-red-400 mt-0.5 flex-shrink-0" size={16} />
                <span>Store payment information (the game is free!)</span>
              </li>
            </ul>
          </div>
        </div>
      </GlassCard>

      {/* Data Storage */}
      <GlassCard className="p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Where Is Your Data Stored?</h2>
        
        <div className="space-y-6">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-300 mb-3">Your Browser (localStorage)</h3>
            <p className="text-gray-300 mb-3">
              Your user ID and preferences are stored locally in your browser using localStorage. 
              This means:
            </p>
            <ul className="space-y-2 text-gray-300 pl-4">
              <li>• Data stays on your device - we can't access it remotely</li>
              <li>• You control this data and can clear it anytime</li>
              <li>• It persists between sessions for convenience</li>
              <li>• It's automatically deleted if you clear browser data</li>
            </ul>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-300 mb-3">Game Servers (Temporary)</h3>
            <p className="text-gray-300 mb-3">
              During active gameplay, minimal data is temporarily stored on our game servers:
            </p>
            <ul className="space-y-2 text-gray-300 pl-4">
              <li>• Game room states and player actions</li>
              <li>• Anonymous user IDs (no personal information)</li>
              <li>• Data is automatically deleted when games end</li>
              <li>• Servers are secured and regularly monitored</li>
            </ul>
          </div>
        </div>
      </GlassCard>

      {/* Your Rights */}
      <GlassCard className="p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Your Rights and Controls</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">🎮 Game Controls</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• Change your username anytime</li>
              <li>• Leave game rooms at any time</li>
              <li>• Delete rooms you created</li>
              <li>• Control your game visibility</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">🗑️ Data Controls</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• Clear browser data to remove all traces</li>
              <li>• Use incognito mode for temporary sessions</li>
              <li>• Contact us to delete server-side game data</li>
              <li>• Request information about your stored data</li>
            </ul>
          </div>
        </div>
      </GlassCard>

      {/* Contact */}
      <GlassCard className="p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Contact & Updates</h2>
        
        <div className="space-y-4">
          <p className="text-gray-300">
            We're committed to transparency and protecting your privacy. If you have any questions, 
            concerns, or requests regarding your data or this privacy policy, please contact us.
          </p>

          <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-4">
            <p className="text-gray-300 mb-2">
              <strong>Policy Updates:</strong> We may update this privacy policy to reflect changes in our 
              practices or legal requirements. Any updates will be posted on this page with a revised date.
            </p>
            <p className="text-sm text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              By using NikoKadi, you agree to this privacy policy and our data handling practices.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};