import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, CreditCard as Edit3 } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { Modal } from './Modal';

export const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const { user, updateUsername } = useUser();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/play', label: 'Play' },
    { path: '/stats', label: 'Stats' },
    { path: '/rules', label: 'How to Play' },
    { path: '/privacy', label: 'Privacy' },
  ];

  const handleUsernameUpdate = () => {
    if (newUsername.trim() && newUsername !== user?.username) {
      updateUsername(newUsername.trim());
      setIsEditModalOpen(false);
      setNewUsername('');
    }
  };

  const openEditModal = () => {
    setNewUsername(user?.username || '');
    setIsEditModalOpen(true);
  };

  return (
    <>
      <nav className="sticky top-0 z-40 backdrop-blur-lg bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                NikoKadi
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    location.pathname === item.path
                      ? 'text-yellow-400 bg-yellow-400/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* User Info */}
            <div className="hidden md:flex items-center space-x-4">
              <GlassCard className="px-4 py-2">
                <div className="flex items-center space-x-2">
                  <User size={16} className="text-gray-300" />
                  <span className="text-sm text-white">{user?.username}</span>
                  <button
                    onClick={openEditModal}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>
              </GlassCard>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-300 hover:text-white p-2"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden backdrop-blur-lg bg-black/40 border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-yellow-400 bg-yellow-400/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile User Info */}
              <div className="px-3 py-2 border-t border-white/10 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User size={16} className="text-gray-300" />
                    <span className="text-sm text-white">{user?.username}</span>
                  </div>
                  <button
                    onClick={openEditModal}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Edit Username Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Username"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              placeholder="Enter new username"
              maxLength={20}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUsernameUpdate}
              disabled={!newUsername.trim() || newUsername === user?.username}
            >
              Update
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};