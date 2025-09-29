import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Hash, Users, Clock } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useUser } from '../hooks/useUser';
import { createRoom, getRoomDetails, joinRoom } from '../utils/api';
import toast from 'react-hot-toast';

export const PlayPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Create room form state
  const [numPlayers, setNumPlayers] = useState(4);
  const [numToDeal, setNumToDeal] = useState(7);
  
  // Join room form state
  const [roomCode, setRoomCode] = useState('');
  const [roomId, setRoomId] = useState('');
  
  const { user } = useUser();
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    if (!user) {
      toast.error('You must be logged in to create a room.');
      return;
    }
    
    setIsLoading(true);
    try {
      // Step 1: Create the room and get its details
      const newRoom = await createRoom(numPlayers, numToDeal, user.id, user.username);

      console.log(newRoom)
      
      // Step 2: Ensure the game state is initialized on the server
      await getRoomDetails(newRoom.roomId);

      toast.success('Room created successfully!');
      navigate(`/room/${newRoom.roomId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create room');
    } finally {
      setIsLoading(false);
      setIsCreateModalOpen(false);
    }
  };

  /**
   * Handles joining a room, functionality is largely the same but robust.
   */
  const handleJoinRoom = async () => {
    if (!user) {
      toast.error('You must be logged in to join a room.');
      return;
    }
    
    // The original used the Room ID in the URL, which we replicate here.
    // The targetRoomId will be the full UUID. The roomCode is sent in the body.
    const targetRoomId = roomId.trim() || roomCode.trim();
    if (!targetRoomId) {
      toast.error('Please enter a Room ID or Room Code.');
      return;
    }
    
    setIsLoading(true);
    try {
      // The `joinRoom` utility will POST to `/join/:roomId` with the code in the body.
      const joinedRoom = await joinRoom(targetRoomId, user.id, user.username, roomCode.trim() || undefined);
      toast.success('Joined room successfully!');
      navigate(`/room/${joinedRoom.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to join room. Check the Code/ID.');
    } finally {
      setIsLoading(false);
      setIsJoinModalOpen(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          Start Playing NikoKadi
        </h1>
        <p className="text-xl text-gray-300">
          Create a new room or join an existing game
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Create Room Card */}
        <GlassCard className="p-8 text-center" hover onClick={() => setIsCreateModalOpen(true)}>
          <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Plus className="text-green-400" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Create Room</h2>
          <p className="text-gray-400 mb-6">
            Set up a new game room and invite your friends to play
          </p>
          <Button variant="success" size="lg" className="w-full">
            Create New Room
          </Button>
        </GlassCard>

        {/* Join Room Card */}
        <GlassCard className="p-8 text-center" hover onClick={() => setIsJoinModalOpen(true)}>
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Hash className="text-blue-400" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Join Room</h2>
          <p className="text-gray-400 mb-6">
            Enter a room code or ID to join an existing game
          </p>
          <Button variant="primary" size="lg" className="w-full">
            Join Existing Room
          </Button>
        </GlassCard>
      </div>

      {/* Game Rules Quick Reference */}
      <GlassCard className="p-8">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">Quick Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Users className="mx-auto mb-3 text-blue-400" size={24} />
            <h4 className="font-semibold text-white mb-2">Players</h4>
            <p className="text-gray-400 text-sm">2-8 players per room</p>
          </div>
          <div className="text-center">
            <Clock className="mx-auto mb-3 text-green-400" size={24} />
            <h4 className="font-semibold text-white mb-2">Goal</h4>
            <p className="text-gray-400 text-sm">First to empty your hand wins</p>
          </div>
          <div className="text-center">
            <Hash className="mx-auto mb-3 text-yellow-400" size={24} />
            <h4 className="font-semibold text-white mb-2">Special Cards</h4>
            <p className="text-gray-400 text-sm">Aces, 8s, and Queens</p>
          </div>
        </div>
      </GlassCard>

      {/* Create Room Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Room"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Number of Players
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                <button
                  key={num}
                  onClick={() => setNumPlayers(num)}
                  className={`p-2 rounded-lg border transition-all ${
                    numPlayers === num
                      ? 'bg-blue-500/30 border-blue-400 text-white'
                      : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Cards to Deal (per player)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[5, 6, 7, 8, 9, 10, 11, 12, 13].map((num) => (
                <button
                  key={num}
                  onClick={() => setNumToDeal(num)}
                  className={`p-2 rounded-lg border transition-all ${
                    numToDeal === num
                      ? 'bg-green-500/30 border-green-400 text-white'
                      : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleCreateRoom}
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Create Room'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Join Room Modal */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        title="Join Room"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Room Code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-center text-lg font-mono"
              placeholder="Enter 6-digit room code"
              maxLength={6}
            />
          </div>

          <div className="flex items-center">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="px-4 text-gray-400 text-sm">OR</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Room ID
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Enter full room ID"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsJoinModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleJoinRoom}
              disabled={isLoading || (!roomCode.trim() && !roomId.trim())}
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Join Room'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};