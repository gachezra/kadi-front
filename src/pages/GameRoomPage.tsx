import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, Users, Play, ArrowLeft, Crown } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { PlayingCard } from '../components/PlayingCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { useUser } from '../hooks/useUser';
import toast from 'react-hot-toast';
import ChatComponent from '../components/ChatComponent';
import {
  joinRoom,
  getRoomDetails,
  startGame,
  terminateRoom,
  makeMove,
  nikoKadi,
  changeSuit,
  answerQuestion,
  dropAce,
  onGameStateUpdated,
  onGameStarted,
  onGameTerminated,
  onRoomUsers,
  connectSocketService,
} from '../utils/api';
import { Card } from '../types';
import { CARD_SUITS } from '../utils/constants';

const cardToString = (card: Card): string => `${card.value}${card.suit}`;

export const GameRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useUser();

  // Room state
  const [room, setRoom] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Game UI state
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showSuitSelector, setShowSuitSelector] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionAnswer, setQuestionAnswer] = useState('');
  const [showAceDropModal, setShowAceDropModal] = useState(false);
  const [isKadi, setIsKadi] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Derived state
  const playerList = room?.playerList || [];
  const myPlayer = playerList.find((p: any) => p.userId === user?.id);
  const isOwner = room?.owner === user?.id;
  const canStart = isOwner && room?.status === 'waiting' && playerList.length >= 2;
  const isMyTurn =
    room && user && playerList.findIndex((p: any) => p.userId === user.id) === room.currentPlayer;

  // Fetch room details
  const updateGameState = async () => {
    if (!roomId || !user) return;
    try {
      const data = await getRoomDetails(roomId);
      console.log('[GameRoom] Room state updated:', data);
      setRoom(data.clientRoom || data);
      setIsKadi(data.clientRoom?.isCard?.includes(user.id) || false);
      setError(null);
    } catch (err: any) {
      console.error('[GameRoom] Failed to fetch room:', err);
      setError(err.message || 'Failed to fetch room details');
    }
  };

  // Initialize room and socket on mount
  useEffect(() => {
    const init = async () => {
      if (!roomId || !user) return;
      setIsLoading(true);
      try {
        // 1. Connect socket first
        await connectSocketService();

        // 2. Register listeners IMMEDIATELY (before any room operations) to catch broadcasts
        const unsubGameState = onGameStateUpdated((data: any) => {
          if (data.roomId !== roomId) return;
          setRoom(data);
          setIsKadi(data.isCard?.includes(user?.id) || false);
          if (data.awaitingAction) {
            const { type, playerId } = data.awaitingAction;
            if (playerId === user?.id) {
              if (type === 'pick-suit') setShowSuitSelector(true);
              else if (type === 'answer-question') setShowQuestionModal(true);
              else if (type === 'drop-ace') setShowAceDropModal(true);
            }
          } else {
            setShowSuitSelector(false);
            setShowQuestionModal(false);
            setShowAceDropModal(false);
          }
        });

        const unsubGameStarted = onGameStarted((data: any) => {
          if (data.room?.roomId === roomId) {
            setRoom(data.room);
            toast.success('Game started!');
          }
        });

        const unsubGameTerminated = onGameTerminated((_data: any) => {
          toast.success('Game ended');
          setTimeout(() => navigate('/play'), 2000);
        });

        const unsubRoomUsers = onRoomUsers((users: any[]) => {
          setRoom((prev: any) => ({
            ...prev,
            playerList: users.map((u: any) => ({
              ...u,
              hand: prev?.playerList?.find((p: any) => p.userId === u.userId)?.hand || [],
            })),
          }));
        });

        // Store unsubscribers for cleanup
        const unsubscribers = [unsubGameState, unsubGameStarted, unsubGameTerminated, unsubRoomUsers];

        // 3. Fetch room details (will trigger broadcasts)
        const data = await getRoomDetails(roomId);
        const initialRoom = data.clientRoom || data;
        setRoom(initialRoom);
        setIsKadi(initialRoom.isCard?.includes(user.id) || false);

        const isInRoom = initialRoom.playerList?.some((p: any) => p.userId === user.id);
        if (!isInRoom && initialRoom.owner !== user.id) {
          setShowJoinModal(true);
        }
        setIsLoading(false);

        // Cleanup listeners on unmount
        return () => {
          unsubscribers.forEach((unsub) => {
            try { unsub(); } catch (e) {}
          });
        };
      } catch (err: any) {
        console.error('[GameRoom] Init error:', err);
        setError(err.message || 'Failed to load room');
        setIsLoading(false);
      }
    };

    const cleanup = init();
    return () => {
      cleanup?.then((c) => c?.());
    };
  }, [roomId, user]);

  // Handlers
  const handleJoinRoom = async () => {
    if (!user || !room) return;
    setJoinLoading(true);
    setJoinError(null);
    try {
      await joinRoom(room.roomId, user.id, user.username, joinRoomCode.trim());
      setShowJoinModal(false);
      await updateGameState();
      toast.success('Joined room!');
    } catch (err: any) {
      setJoinError(err.message || 'Failed to join room');
      toast.error(err.message || 'Failed to join');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleStartGame = async () => {
    if (!room || !user) return;
    setIsActionLoading(true);
    try {
      await startGame(room.roomId);
      toast.success('Game started!');
      await updateGameState();
    } catch (err: any) {
      toast.error(err.message || 'Failed to start game');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleTerminateRoom = async () => {
    if (!room || !user || !window.confirm('Terminate this room?')) return;
    setIsActionLoading(true);
    try {
      await terminateRoom(room.roomId, user.id);
      toast.success('Room terminated');
      navigate('/play');
    } catch (err: any) {
      toast.error(err.message || 'Failed to terminate');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCardClick = (card: Card) => {
    if (!isMyTurn) {
      toast.error("It's not your turn!");
      return;
    }
    const cardId = cardToString(card);
    setSelectedCards((prev) =>
      prev.some((c) => cardToString(c) === cardId)
        ? prev.filter((c) => cardToString(c) !== cardId)
        : [...prev, card]
    );
  };

  const performMove = async (action: 'play' | 'pick') => {
    if (!room || !user) return;
    setIsActionLoading(true);
    try {
      const cards = action === 'play' ? selectedCards.map(cardToString) : [];
      await makeMove(room.roomId, user.id, action, cards);
      toast.success('Move successful');
      setSelectedCards([]);
      await updateGameState();
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSuitSelection = async (suit: string) => {
    if (!room || !user) return;
    setIsActionLoading(true);
    try {
      await changeSuit(room.roomId, user.id, suit);
      setShowSuitSelector(false);
      setSelectedCards([]);
      toast.success('Suit changed!');
      await updateGameState();
    } catch (err: any) {
      toast.error(err.message || 'Failed to change suit');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleQuestionSubmit = async () => {
    if (!questionAnswer.trim() || !room || !user) return;
    setIsActionLoading(true);
    try {
      await answerQuestion(room.roomId, user.id, questionAnswer.trim());
      setShowQuestionModal(false);
      setQuestionAnswer('');
      setSelectedCards([]);
      toast.success('Answer submitted!');
      await updateGameState();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit answer');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDropAce = async (drop: boolean) => {
    if (!room || !user) return;
    setIsActionLoading(true);
    try {
      await dropAce(room.roomId, user.id, drop);
      setShowAceDropModal(false);
      toast.success(drop ? 'Ace dropped!' : 'Ace kept');
      await updateGameState();
    } catch (err: any) {
      toast.error(err.message || 'Failed to drop ace');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleNikoKadi = async () => {
    if (!room || !user) return;
    setIsActionLoading(true);
    try {
      await nikoKadi(room.roomId, user.id);
      toast.success(isKadi ? 'Kadi revoked!' : 'Niko Kadi declared!');
      setIsKadi(!isKadi);
      await updateGameState();
    } catch (err: any) {
      toast.error(err.message || 'Failed to declare Niko Kadi');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleShareRoom = async () => {
    if (!room) return;
    const roomUrl = `${window.location.origin}/rooms/${room.roomId}`;
    const shareMessage = `Come play nikokadi with me!\n${roomUrl}\nUse room code ${room.roomCode}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Come play NikoKadi!',
          text: shareMessage,
          url: roomUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareMessage);
        toast.success('Invite copied to clipboard!');
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const shouldShowNikoKadiButton = () => {
    if (!room || !user || !myPlayer) return false;
    const playerIndex = playerList.findIndex((p: any) => p.userId === user.id);
    const prevIndex =
      room.gameDirection === 'forward'
        ? (room.currentPlayer - 1 + room.numPlayers) % room.numPlayers
        : (room.currentPlayer + 1) % room.numPlayers;
    return playerIndex === prevIndex;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <GlassCard className="p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-4">Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <Button onClick={() => navigate('/play')}>
            <ArrowLeft className="mr-2" size={16} />
            Back
          </Button>
        </GlassCard>
      </div>
    );
  }

  if (!room) return null;

  // Join modal
  if (showJoinModal) {
    return (
      <Modal isOpen={true} onClose={() => {}} title="Join Room">
        <div className="space-y-4">
          <p className="text-gray-300">Enter the room code to join:</p>
          <input
            type="text"
            value={joinRoomCode}
            onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center text-lg font-mono"
            placeholder="ROOM CODE"
            maxLength={6}
            autoFocus
          />
          {joinError && <div className="text-red-500 text-sm">{joinError}</div>}
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleJoinRoom}
              disabled={joinLoading || joinRoomCode.length < 6}
            >
              {joinLoading ? <LoadingSpinner size="sm" /> : 'Join'}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // Waiting room view
  if (room.status === 'waiting') {
    return (
      <div className="max-w-7xl mx-auto">
        <GlassCard className="p-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Button variant="secondary" onClick={() => navigate('/play')}>
                <ArrowLeft size={16} />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Room {room.roomCode}</h1>
                <p className="text-gray-400">Waiting for players...</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={handleShareRoom}>
                <Share2 size={14} className="mr-2" />
                Share
              </Button>
              {canStart && (
                <Button onClick={handleStartGame} disabled={isActionLoading}>
                  <Play className="mr-2" size={16} />
                  Start Game
                </Button>
              )}
              {isOwner && (
                <Button variant="danger" size="sm" onClick={handleTerminateRoom} disabled={isActionLoading}>
                  Terminate
                </Button>
              )}
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GlassCard className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="text-blue-400" />
              <h2 className="text-xl font-bold text-white">
                Players ({playerList.length}/{room.numPlayers})
              </h2>
            </div>
            <div className="space-y-3">
              {playerList.map((p: any) => (
                <div key={p.userId} className="flex items-center space-x-3 p-3 rounded-lg bg-white/10">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {p.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 flex items-center space-x-2">
                    <span className="text-white font-medium">{p.username}</span>
                    {room.owner === p.userId && <Crown className="text-yellow-400" size={16} />}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Game Settings</h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Cards per player:</span>
                <span className="text-white">{room.numToDeal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Room Owner:</span>
                <span className="text-white">{room.ownerName}</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  // Game view
  return (
    <div className="max-w-7xl mx-auto">
      <GlassCard className="p-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button variant="secondary" onClick={() => navigate('/play')}>
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Room {room.roomCode}</h1>
              <p className="text-gray-400">In Progress</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleShareRoom}>
              <Share2 size={14} className="mr-2" />
              Share
            </Button>
            {isOwner && (
              <Button variant="danger" size="sm" onClick={handleTerminateRoom} disabled={isActionLoading}>
                Terminate
              </Button>
            )}
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-400 mb-2">Game Info</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300">
                    Deck: <span className="text-white font-semibold">{room.deckSize || 0} cards</span>
                  </p>
                  <p className="text-gray-300">
                    Players: <span className="text-white font-semibold">{room.numPlayers}</span>
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-400 mb-2">Players</h4>
                <div className="space-y-2">
                  {playerList.map((p: any, idx: number) => (
                    <div
                      key={p.userId}
                      className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                        room.currentPlayer === idx ? 'bg-white/10' : 'bg-transparent'
                      }`}
                    >
                      <span className="text-white flex items-center gap-2">
                        {p.username}
                        {room.owner === p.userId && <Crown className="text-yellow-400" size={14} />}
                      </span>
                      <div className="flex items-center space-x-2">
                        {room.isCard?.includes(p.userId) && (
                          <span className="text-red-500 text-xs font-bold animate-pulse">KADI!</span>
                        )}
                        <span className="text-gray-400">{p.hand?.length || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Top Card Display */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Table</h3>
            <div className="flex items-center justify-center min-h-[200px]">
              {room.topCard ? (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-gray-400 text-sm">Top Card</p>
                  <PlayingCard card={room.topCard} size="lg" />
                </div>
              ) : (
                <p className="text-gray-400">No cards on table yet</p>
              )}
            </div>
          </GlassCard>

          {myPlayer && (
            <GlassCard className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
                <h3 className="text-lg font-bold text-white">Your Hand ({myPlayer.hand?.length || 0})</h3>
                <div className="flex items-center gap-2">
                  {isMyTurn && (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => performMove('play')}
                        disabled={selectedCards.length === 0 || isActionLoading}
                      >
                        Play ({selectedCards.length})
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => performMove('pick')} disabled={isActionLoading}>
                        Pick
                      </Button>
                    </>
                  )}
                  {shouldShowNikoKadiButton() && (
                    <Button
                      variant={isKadi ? 'danger' : 'secondary'}
                      size="sm"
                      onClick={handleNikoKadi}
                      disabled={isActionLoading}
                    >
                      {isKadi ? 'Revoke Kadi' : 'Niko Kadi'}
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-3 min-h-[148px]">
                {myPlayer.hand?.map((card: any) => (
                  <PlayingCard
                    key={cardToString(card)}
                    card={card}
                    isSelected={selectedCards.some((c) => cardToString(c) === cardToString(card))}
                    onClick={() => handleCardClick(card)}
                  />
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        <GlassCard className="p-6 lg:col-span-1">
          <ChatComponent roomId={room.roomId} userId={user?.id || ''} username={user?.username || ''} />
        </GlassCard>
      </div>

      {/* Suit selector modal */}
      <Modal isOpen={showSuitSelector} onClose={() => setShowSuitSelector(false)} title="Choose Suit">
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(CARD_SUITS).map(([suit, symbol]: [string, string]) => (
            <Button
              key={suit}
              variant="primary"
              onClick={() => handleSuitSelection(suit)}
              className="p-4 text-2xl"
            >
              {symbol}
            </Button>
          ))}
        </div>
      </Modal>

      {/* Question answer modal */}
      <Modal isOpen={showQuestionModal} onClose={() => setShowQuestionModal(false)} title="Answer Question">
        <div className="space-y-4">
          <p className="text-gray-300">You played a question card! Ask a question:</p>
          <input
            type="text"
            value={questionAnswer}
            onChange={(e) => setQuestionAnswer(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter your question..."
            maxLength={100}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowQuestionModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleQuestionSubmit}
              disabled={!questionAnswer.trim() || isActionLoading}
            >
              Submit
            </Button>
          </div>
        </div>
      </Modal>

      {/* Ace drop modal */}
      {showAceDropModal && myPlayer?.hand?.some((card: any) => cardToString(card).startsWith('A')) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <GlassCard className="p-6 max-w-sm">
            <h3 className="text-xl font-bold mb-4 text-white">Do you want to drop your Ace?</h3>
            <div className="flex gap-4">
              <Button variant="success" onClick={() => handleDropAce(true)} disabled={isActionLoading}>
                Drop Ace
              </Button>
              <Button variant="danger" onClick={() => handleDropAce(false)} disabled={isActionLoading}>
                Keep Ace
              </Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default GameRoomPage;
