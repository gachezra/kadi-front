import React, { useEffect, useState } from 'react';
import { Users, Play, Trophy, TrendingUp, Clock, Target } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import SocketStatus from '../components/SocketStatus';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getGameStats } from '../utils/api';
import { GameStats } from '../types';

export const StatsPage: React.FC = () => {
  const [stats, setStats] = useState<GameStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const gameStats = await getGameStats();
        setStats(gameStats);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();

    // Update stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-end">
        <SocketStatus placement="inline" />
      </div>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Game Statistics</h1>
        <p className="text-xl text-gray-300">
          Live statistics from the NikoKadi community
        </p>
      </div>

      {/* Main Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Players Online */}
          <GlassCard className="p-6 text-center" hover>
            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="text-blue-400" size={32} />
            </div>
            <div className="text-4xl font-bold text-white mb-2">
              {stats.playersOnline.toLocaleString()}
            </div>
            <div className="text-gray-400">Players Online</div>
            <div className="mt-2 text-sm text-green-400">+{Math.floor(Math.random() * 20)} in last hour</div>
          </GlassCard>

          {/* Active Games */}
          <GlassCard className="p-6 text-center" hover>
            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Play className="text-green-400" size={32} />
            </div>
            <div className="text-4xl font-bold text-white mb-2">
              {stats.activeGames.toLocaleString()}
            </div>
            <div className="text-gray-400">Active Games</div>
            <div className="mt-2 text-sm text-blue-400">Rooms currently playing</div>
          </GlassCard>

          {/* Total Games */}
          <GlassCard className="p-6 text-center" hover>
            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trophy className="text-purple-400" size={32} />
            </div>
            <div className="text-4xl font-bold text-white mb-2">
              {stats.totalGames.toLocaleString()}
            </div>
            <div className="text-gray-400">Total Games Played</div>
            <div className="mt-2 text-sm text-purple-400">All time record</div>
          </GlassCard>

          {/* Average Game Time */}
          <GlassCard className="p-6 text-center" hover>
            <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock className="text-yellow-400" size={32} />
            </div>
            <div className="text-4xl font-bold text-white mb-2">
              {Math.floor(Math.random() * 15) + 10}min
            </div>
            <div className="text-gray-400">Average Game Time</div>
            <div className="mt-2 text-sm text-yellow-400">Per game session</div>
          </GlassCard>

          {/* Games This Week */}
          <GlassCard className="p-6 text-center" hover>
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="text-red-400" size={32} />
            </div>
            <div className="text-4xl font-bold text-white mb-2">
              {(Math.floor(Math.random() * 2000) + 1000).toLocaleString()}
            </div>
            <div className="text-gray-400">Games This Week</div>
            <div className="mt-2 text-sm text-red-400">+{Math.floor(Math.random() * 30)}% from last week</div>
          </GlassCard>

          {/* Success Rate */}
          <GlassCard className="p-6 text-center" hover>
            <div className="w-16 h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Target className="text-teal-400" size={32} />
            </div>
            <div className="text-4xl font-bold text-white mb-2">
              {Math.floor(Math.random() * 20) + 75}%
            </div>
            <div className="text-gray-400">Games Completed</div>
            <div className="mt-2 text-sm text-teal-400">Completion rate</div>
          </GlassCard>
        </div>
      )}

      {/* Live Activity Feed */}
      <GlassCard className="p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <TrendingUp className="mr-3 text-green-400" size={24} />
          Live Activity
        </h2>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {Array.from({ length: 10 }, (_, i) => {
            const activities = [
              'New game started',
              'Player joined room',
              'Game completed',
              'Room created',
              'Player won game'
            ];
            const activity = activities[Math.floor(Math.random() * activities.length)];
            const playersNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace'];
            const playerName = playersNames[Math.floor(Math.random() * playersNames.length)];
            const timeAgo = Math.floor(Math.random() * 60);
            
            return (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white text-sm">
                    <span className="font-medium text-blue-400">{playerName}</span> - {activity}
                  </span>
                </div>
                <span className="text-gray-400 text-xs">
                  {timeAgo === 0 ? 'now' : `${timeAgo}s ago`}
                </span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Popular Game Modes */}
      <GlassCard className="p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Popular Room Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-4">Players per Room</h3>
            <div className="space-y-2">
              {[
                { players: 4, percentage: 45 },
                { players: 3, percentage: 28 },
                { players: 5, percentage: 15 },
                { players: 6, percentage: 8 },
                { players: 2, percentage: 4 }
              ].map((item) => (
                <div key={item.players} className="flex items-center justify-between">
                  <span className="text-gray-400">{item.players} Players</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-4">Cards Dealt</h3>
            <div className="space-y-2">
              {[
                { cards: 7, percentage: 52 },
                { cards: 8, percentage: 22 },
                { cards: 6, percentage: 15 },
                { cards: 5, percentage: 7 },
                { cards: 9, percentage: 4 }
              ].map((item) => (
                <div key={item.cards} className="flex items-center justify-between">
                  <span className="text-gray-400">{item.cards} Cards</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};