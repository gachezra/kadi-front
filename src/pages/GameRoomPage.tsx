import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, Users, Play, ArrowLeft, Crown } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { PlayingCard } from '../components/PlayingCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { useUser } from '../hooks/useUser';
import { useGameRoom } from '../hooks/useGameRoom';
import { makeMove, startGame, terminateRoom, changeSuit, answerQuestion, joinRoom, declareNikoKadi, MakeMoveResponse } from '../utils/api';
import { Card, GameMove } from '../types';
import { CARD_SUITS } from '../utils/constants';
import toast from 'react-hot-toast';

const parseCardString = (cardStr: string): Card | null => {
    if (typeof cardStr !== 'string' || cardStr.length < 2) return null;
    const suit = cardStr.slice(-1);
    const value = cardStr.slice(0, -1);
    const validSuits = ['♠', '♥', '♦', '♣'];
    if (!validSuits.includes(suit) || !value) return null;
    return { suit, value };
};

const cardToString = (card: Card): string => `${card.value}${card.suit}`;

export const GameRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const { room, isLoading, error, updateGameState } = useGameRoom(roomId);

  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showSuitSelector, setShowSuitSelector] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionAnswer, setQuestionAnswer] = useState('');
  const [isKadi, setIsKadi] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const playerList = room?.playerList || [];
  const myPlayer = playerList.find(p => p.userId === user?.id);
  const isOwner = room?.owner === user?.id;
  const isMyTurn = typeof room?.currentPlayer === 'number' && playerList[room.currentPlayer]?.userId === user?.id;
  const canStart = isOwner && room?.status === 'waiting' && playerList.length >= 2;

  useEffect(() => {
    if (room && user && !playerList.some(p => p.userId === user.id) && !room.isTerminated) {
      setShowJoinModal(true);
    } else {
      setShowJoinModal(false);
    }
    if (room && user) {
      setIsKadi(room.isCard?.includes(user.id) || false);
    }
  }, [room, user, playerList]);

  const handleJoinRoom = async () => {
    if (!user || !room) return;
    setJoinLoading(true);
    setJoinError(null);
    try {
      await joinRoom(room.roomId, user.id, user.username, joinRoomCode.trim());
      setShowJoinModal(false);
      updateGameState();
    } catch (err: any) {
      setJoinError(err.response?.data?.message || 'Failed to join room.');
    } finally {
      setJoinLoading(false);
    }
  };

  useEffect(() => {
    if (error?.includes('not found')) {
      toast.error('Room not found');
      navigate('/play');
    }
  }, [error, navigate]);

  const handleShareRoom = async () => {
    if (!room) return;
    const roomUrl = `${window.location.origin}/rooms/${room.roomId}`;
    const shareMessage = `Come play nikokadi with me!\n${roomUrl}\nUse room code ${room.roomCode}`;

    try {
      // The navigator.share API is the modern way to share content.
      // It opens the native sharing dialog on the user's device.
      if (navigator.share) {
        await navigator.share({
          title: 'Come play NikoKadi!',
          // The 'text' and 'url' fields are often combined by the OS.
          text: `Come play nikokadi with me!\nUse room code ${room.roomCode}`,
          url: roomUrl,
        });
      } else {
        // Fallback for older browsers that do not support the Web Share API.
        // This will copy the complete message to the user's clipboard.
        await navigator.clipboard.writeText(shareMessage);
        toast.success('Invite copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing room:', error);
      toast.error('Could not copy invite link.');
    }
  };


  const handleStartGame = async () => {
    if (!room || !user) return;
    setIsActionLoading(true);
    try {
      await startGame(room.roomId, user.id);
      toast.success('Game started!');
      updateGameState();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start game');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleTerminateRoom = async () => {
    if (!room || !user || !window.confirm('Are you sure you want to terminate this room?')) return;
    setIsActionLoading(true);
    try {
      await terminateRoom(room.roomId, user.id);
      toast.success('Room terminated');
      navigate('/play');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to terminate room');
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
    setSelectedCards(prev =>
      prev.some(c => cardToString(c) === cardId)
        ? prev.filter(c => cardToString(c) !== cardId)
        : [...prev, card]
    );
  };

  const performMove = async (action: 'drop' | 'pick') => {
    if (!room || !user) return;
    setIsActionLoading(true);
    try {
      const move: GameMove = { 
        action, 
        userId: user.id, 
        cards: action === 'drop' ? selectedCards.map(cardToString) : undefined 
      };
      const response: MakeMoveResponse = await makeMove(room.roomId, move);
      
      if(response.message) toast.success(response.message);

      if (response?.awaitingSpecialAction) {
          const specialCardValue = response.specialCard?.slice(0, -1);
          if (specialCardValue === 'A') setShowSuitSelector(true);
          else if (specialCardValue && ['8', 'Q'].includes(specialCardValue)) setShowQuestionModal(true);
          else { 
              setSelectedCards([]);
              updateGameState();
          }
      } else {
        setSelectedCards([]);
        updateGameState();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} card`);
      updateGameState();
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDropCard = () => selectedCards.length > 0 && performMove('drop');
  const handlePickCard = () => performMove('pick');

  const handleDeclareNikoKadi = async () => {
    if (!room || !user) return;
    setIsActionLoading(true);
    try {
      await declareNikoKadi(room.roomId, user.id);
      toast.success(isKadi ? 'Kadi revoked!' : 'Niko Kadi declared!');
      updateGameState();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to declare Niko Kadi');
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
      updateGameState();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change suit');
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
      updateGameState();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit answer');
    } finally {
      setIsActionLoading(false);
    }
  };

  const shouldShowNikoKadiButton = () => {
    if (!room || !user || !myPlayer) return false;
    const playerIndex = playerList.findIndex(p => p.userId === user.id);
    const prevPlayerIndex = room.gameDirection === 'forward'
      ? (room.currentPlayer - 1 + room.numPlayers) % room.numPlayers
      : (room.currentPlayer + 1) % room.numPlayers;
    return playerIndex === prevPlayerIndex;
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>;
  if (error && !room) return <div className="text-center p-4"><GlassCard className="p-8 max-w-md mx-auto"><h2 className="text-xl font-bold text-white mb-4">Error</h2><p className="text-gray-300 mb-6">{error}</p><Button onClick={() => navigate('/play')}><ArrowLeft className="mr-2" size={16} />Back</Button></GlassCard></div>;
  if (!room) return null;

  if (showJoinModal) return <Modal isOpen={true} onClose={() => {}} title="Join Room"><div className="space-y-4"><p className="text-gray-300">Enter the room code to join:</p><input type="text" value={joinRoomCode} onChange={e => setJoinRoomCode(e.target.value.toUpperCase())} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center text-lg font-mono" placeholder="ROOM CODE" maxLength={6} autoFocus />{joinError && <div className="text-red-500 text-sm">{joinError}</div>}<div className="flex justify-end pt-2"><Button variant="primary" onClick={handleJoinRoom} disabled={joinLoading || joinRoomCode.length < 6}>{joinLoading ? <LoadingSpinner size="sm" /> : 'Join'}</Button></div></div></Modal>;
  
  const WaitingRoomView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <GlassCard className="p-6">
        <div className="flex items-center space-x-2 mb-4"><Users className="text-blue-400" /><h2 className="text-xl font-bold text-white">Players ({playerList.length}/{room.numPlayers})</h2></div>
        <div className="space-y-3">
          {playerList.map(p => (
            <div key={p.userId} className="flex items-center space-x-3 p-3 rounded-lg bg-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">{p.username.charAt(0).toUpperCase()}</div>
              <div className="flex-1 flex items-center space-x-2"><span className="text-white font-medium">{p.username}</span>{room.owner === p.userId && <Crown className="text-yellow-400" size={16} />}</div>
            </div>
          ))}
        </div>
      </GlassCard>
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">Game Settings</h2>
        <div className="space-y-4 text-sm">
          <div className="flex justify-between"><span className="text-gray-400">Cards per player:</span><span className="text-white">{room.numToDeal}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Room Owner:</span><span className="text-white">{room.ownerName}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Status:</span><span className="text-yellow-400 capitalize">{room.status}</span></div>
        </div>
        {canStart && <div className="mt-6 p-4 bg-green-900/50 rounded-lg border border-green-400/30 text-center"><p className="text-green-300">Ready to start!</p></div>}
      </GlassCard>
    </div>
  );

  const GameView = () => {
    const renderTopCard = () => {
      if (!room?.topCard) {
        return <div className="w-20 h-28 bg-gray-800 rounded-lg flex items-center justify-center"><p className="text-gray-500">No card</p></div>;
      }

      const suitNames = Object.keys(CARD_SUITS);
      const isSuit = suitNames.includes(room.topCard);

      if (isSuit) {
        const suitSymbol = CARD_SUITS[room.topCard as keyof typeof CARD_SUITS];
        const color = ['hearts', 'diamonds'].includes(room.topCard) ? 'text-red-500' : 'text-white';
        return (
          <div className="w-20 h-28 bg-gray-900 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-center">
            <p className="text-gray-400 text-xs leading-tight">New Suit</p>
            <div className={`text-4xl font-bold ${color}`}>{suitSymbol}</div>
          </div>
        );
      }

      const card = parseCardString(room.topCard);
      if (card) {
        return <PlayingCard card={card} size="md" />;
      }

      return <div className="w-20 h-28 bg-gray-800 rounded-lg flex items-center justify-center"><p className="text-gray-500">?</p></div>;
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <GlassCard>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div>
                  <h4 className="font-semibold text-gray-400 mb-2">Top Card</h4>
                  <div className="flex items-center space-x-4">
                    {renderTopCard()}
                    <p className="text-gray-400">Deck: <span className="font-semibold text-white">{room.deckCount || 0} cards</span></p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-400 mb-2">Players</h4>
                  <div className="space-y-2">
                    {playerList.map((p, index) => (
                      <div key={p.userId} className={`flex items-center justify-between p-2 rounded-lg ${room.currentPlayer === index ? 'bg-white/10' : 'bg-transparent'}`}>
                        <span className="text-white font-medium flex items-center gap-2">
                          {p.username}
                          {room.owner === p.userId && <span title="Room Owner"><Crown className="text-yellow-400" size={14} /></span>}
                        </span>
                        <div className="flex items-center space-x-3 text-sm">
                          {room.isCard?.includes(p.userId) && <div className="text-red-500 font-bold animate-pulse">KADI!</div>}
                          <span className="text-gray-400">{p.hand.length} cards</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
          
          {myPlayer && (
            <GlassCard className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
                <h3 className="text-lg font-bold text-white">Your Hand ({myPlayer.hand.length})</h3>
                <div className="flex items-center gap-2">
                  {isMyTurn && (
                    <>
                      <Button variant="success" size="sm" onClick={handleDropCard} disabled={selectedCards.length === 0 || isActionLoading}>Drop ({selectedCards.length})</Button>
                      <Button variant="primary" size="sm" onClick={handlePickCard} disabled={isActionLoading}>Pick</Button>
                    </>
                  )}
                  {shouldShowNikoKadiButton() && (
                    <Button variant={isKadi ? 'danger' : 'secondary'} size="sm" onClick={handleDeclareNikoKadi} disabled={isActionLoading}>
                      {isKadi ? 'Revoke Kadi' : 'Niko Kadi'}
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-3 min-h-[148px]">
                {myPlayer.hand.map(card => (
                    <PlayingCard key={cardToString(card)} card={card} isSelected={selectedCards.some(c => cardToString(c) === cardToString(card))} onClick={() => handleCardClick(card)} />
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        <GlassCard className="p-6 lg:col-span-1">
          <h2 className="text-xl font-bold text-white mb-4">Chat</h2>
          <div className="bg-black/20 rounded-lg p-4 h-full flex items-center justify-center"><p className="text-gray-500">Coming soon...</p></div>
        </GlassCard>
      </div>
    );
  }

  const EndView = () => (
    <GlassCard className="p-8 text-center max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-white mb-4">🎉 Game Over! 🎉</h2>
      {room.winner ? (
        <p className="text-xl text-gray-300">{playerList.find(p => p.userId === room.winner)?.username || 'Unknown'} wins!</p>
      ) : (
        <p className="text-xl text-gray-300">The room was terminated.</p>
      )}
      <div className="mt-6"><Button onClick={() => navigate('/play')}><ArrowLeft className="mr-2" size={16} />Back to Lobbies</Button></div>
    </GlassCard>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <GlassCard className="p-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button variant="secondary" onClick={() => navigate('/play')}><ArrowLeft size={16} /></Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Room {room.roomCode}</h1>
              <p className="text-gray-400 capitalize">{room.status}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleShareRoom}><Share2 size={14} className="mr-2" />Share</Button>
            {canStart && <Button variant="success" onClick={handleStartGame} disabled={isActionLoading}><Play className="mr-2" size={16} />Start Game</Button>}
            {isOwner && <Button variant="danger" size="sm" onClick={handleTerminateRoom} disabled={isActionLoading}>Terminate</Button>}
          </div>
        </div>
      </GlassCard>

      {room.isTerminated || room.winner ? <EndView /> : (room.status === 'waiting' ? <WaitingRoomView /> : <GameView />)}

      <Modal isOpen={showSuitSelector} onClose={() => setShowSuitSelector(false)} title="Choose Suit">
        <div className="grid grid-cols-2 gap-4">{Object.entries(CARD_SUITS).map(([suit, symbol]) => <Button key={suit} variant="primary" onClick={() => handleSuitSelection(suit)} className="p-4 text-2xl">{symbol} {suit.charAt(0).toUpperCase() + suit.slice(1)}</Button>)}</div>
      </Modal>
      <Modal isOpen={showQuestionModal} onClose={() => setShowQuestionModal(false)} title="Answer Question">
        <div className="space-y-4">
          <p className="text-gray-300">You played a question card! Ask a question:</p>
          <input type="text" value={questionAnswer} onChange={(e) => setQuestionAnswer(e.target.value)} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white" placeholder="Enter your question..." maxLength={100} />
          <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setShowQuestionModal(false)}>Cancel</Button><Button variant="primary" onClick={handleQuestionSubmit} disabled={!questionAnswer.trim() || isActionLoading}>{isActionLoading ? <LoadingSpinner size="sm" /> : 'Submit'}</Button></div>
        </div>
      </Modal>
    </div>
  );
};
