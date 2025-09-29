import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Users, Trophy, TrendingUp } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { getGameStats } from '../utils/api';
import { GameStats } from '../types';

export const HomePage: React.FC = () => {
  const [stats, setStats] = useState<GameStats | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const gameStats = await getGameStats();
        setStats(gameStats);
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="text-center py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            NikoKadi
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            The ultimate online card game experience. Play with friends, challenge your skills, 
            and master the art of NikoKadi!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/play">
              <Button size="lg" className="w-full sm:w-auto">
                <Play className="mr-2" size={24} />
                Start Playing
              </Button>
            </Link>
            <Link to="/rules">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Learn Rules
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              Live Game Statistics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <GlassCard className="p-6 text-center" hover>
                <Users className="mx-auto mb-4 text-blue-400" size={32} />
                <div className="text-3xl font-bold text-white mb-2">
                  {stats.playersOnline.toLocaleString()}
                </div>
                <div className="text-gray-400">Players Online</div>
              </GlassCard>
              
              <GlassCard className="p-6 text-center" hover>
                <Play className="mx-auto mb-4 text-green-400" size={32} />
                <div className="text-3xl font-bold text-white mb-2">
                  {stats.activeGames.toLocaleString()}
                </div>
                <div className="text-gray-400">Active Games</div>
              </GlassCard>
              
              <GlassCard className="p-6 text-center" hover>
                <Trophy className="mx-auto mb-4 text-yellow-400" size={32} />
                <div className="text-3xl font-bold text-white mb-2">
                  {stats.totalGames.toLocaleString()}
                </div>
                <div className="text-gray-400">Total Games</div>
              </GlassCard>
              
              <GlassCard className="p-6 text-center" hover>
                <TrendingUp className="mx-auto mb-4 text-purple-400" size={32} />
                <div className="text-3xl font-bold text-white mb-2">24/7</div>
                <div className="text-gray-400">Always Available</div>
              </GlassCard>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Why Choose NikoKadi?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <GlassCard className="p-6" hover>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <Users className="text-blue-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Multiplayer Fun</h3>
              <p className="text-gray-400">
                Play with 2-8 friends in real-time. Create private rooms or join public games.
              </p>
            </GlassCard>
            
            <GlassCard className="p-6" hover>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                <Play className="text-green-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Easy to Learn</h3>
              <p className="text-gray-400">
                Simple rules, engaging gameplay. Perfect for casual players and card game enthusiasts.
              </p>
            </GlassCard>
            
            <GlassCard className="p-6" hover>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                <Trophy className="text-purple-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Competitive</h3>
              <p className="text-gray-400">
                Track your stats, climb leaderboards, and become the ultimate NikoKadi champion.
              </p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <GlassCard className="p-12">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Play?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of players in the most exciting card game online.
              No registration required!
            </p>
            <Link to="/play">
              <Button size="lg">
                <Play className="mr-2" size={24} />
                Play Now - It's Free!
              </Button>
            </Link>
          </GlassCard>
        </div>
      </section>
    </div>
  );
};