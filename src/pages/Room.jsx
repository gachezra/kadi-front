import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getRoomDetailsRoute, makeMoveRoute, terminateRoomRoute, answerQuestionCardRoute, changeSuitRoute, dropAceRoute, isCardRoute } from '../utils/APIRoutes';
import Card from '../components/Card';
import { FaWhatsapp } from "react-icons/fa";
import ChatComponent from '../chat/chatComponent';

const Room = () => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [selectedCards, setSelectedCards] = useState([]);
  const [selectedAnswerCards, setSelectedAnswerCards] = useState([]);
  const [droppingCards, setDroppingCards] = useState([]);
  const [message, setMessage] = useState('');
  const [isKadi, setIsKadi] = useState(null);
  const [showSuitSelector, setShowSuitSelector] = useState(false);
  const [showQuestionAnswer, setShowQuestionAnswer] = useState(false);
  const [awaitingAceDrops, setAwaitingAceDrops] = useState(false);
  const suits = ['♥', '♦', '♣', '♠'];
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('uid');

  const fetchRoomDetails = useCallback(async () => {
    try {
      const response = await axios.get(getRoomDetailsRoute(roomId));
      console.log('Room Updated', response.data);
      if (response.data.roomData) {
        setError(response.data.message);
        setMessage(response.data.roomData);
        return;
      };
      setRoom(response.data.clientRoom);
      setIsKadi(response.data.clientRoom.isCard.includes(userId));
      setAwaitingAceDrops(response.data.clientRoom.awaitingAceDrops || false);
    } catch (err) {
      setError('Failed to fetch room details');
      console.error('Error fetching room details:', err);
    }
  }, [roomId]);

  useEffect(() => {
    fetchRoomDetails();
    const intervalId = setInterval(fetchRoomDetails, 5000); // Fetch every 5 seconds
    return () => clearInterval(intervalId);
  }, [fetchRoomDetails]);

  const handleCardSelect = (card) => {
    setSelectedCards(prev => 
      prev.includes(card) ? prev.filter(c => c !== card) : [...prev, card]
    );
  };

  const handleAnswerCardSelect = (card) => {
    setSelectedAnswerCards(prev => 
      prev.includes(card) ? prev.filter(c => c !== card) : [...prev, card]
    );
  };

  const handleMove = async (action) => {

    if (action === 'drop') {
      setDroppingCards(selectedCards);
      setTimeout(() => {
        setDroppingCards([]);
        setSelectedCards([]);
      }, 300); // Duration of the fade-out animation
    }
  
    try {
      const response = await axios.post(makeMoveRoute(roomId), {
        userId,
        action,
        cards: action === 'drop' ? selectedCards : []
      });
  
      //console.log('Move response:', response.data);
      
      if (response.data.awaitingSpecialAction) {
        if (response.data.specialCard.charAt(0) === 'A') {
          setShowSuitSelector(true);
        } else if (['8', 'Q'].includes(response.data.specialCard.charAt(0))) {
          setShowQuestionAnswer(true);
        }
      } else {
        setShowQuestionAnswer(false);
        setSelectedCards([]);
        setError(null);
        await fetchRoomDetails();
      }

  
      // Update local state with the response from the server
      setRoom(prevRoom => ({
        ...prevRoom,
        ...response.data,
        currentPlayer: response.data.awaitingSpecialAction ? prevRoom.currentPlayer : response.data.currentPlayer,
      }));
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to make move');
      console.error('Error making move:', error);
    }
  };

  const handleDropAce = async (drop = true) => {
    try {
      const response = await axios.post(`${dropAceRoute(roomId)}`, {
        userId,
        drop
      });
      console.log(response.data)
      setAwaitingAceDrops(false);
      await fetchRoomDetails();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to drop ace');
      console.error('Error dropping ace:', error);
    }
  };

  const handleIsCard = async () => {
    try {
      await axios.post(isCardRoute(roomId), {
        userId
      })
      setIsKadi(!isKadi);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to set NikoKadi');
      console.error('Error setting NikoKadi:', e);
    }
  };

  const handleSuitChange = async (suit) => {
    try {
      await axios.post(changeSuitRoute(roomId), {
        userId,
        newSuit: suit
      });
      setShowSuitSelector(false);
      setSelectedCards([]);
      setError(null);
      await fetchRoomDetails();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to change suit');
      console.error('Error changing suit:', error);
    }
  };

  const handleQuestionAnswer = async (selectedAnswerCards) => {
    try {
      await axios.post(answerQuestionCardRoute(roomId), {
        action: 'drop',
        userId,
        cards: selectedAnswerCards
      });
      setShowQuestionAnswer(false);
      setSelectedAnswerCards([]);
      setSelectedCards([]);
      setError(null);
      await fetchRoomDetails();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to answer question card');
      console.error('Error answering question card:', error);
    }
  };

  const terminateRoom = async () => {
    try{
      const response = await axios.post(terminateRoomRoute(roomId), {
        userId: userId
      })
      console.log('Room terminated:', response.data);
    } catch (error) {
      console.error('Error terminating room:', error);
      setError(error.response?.data?.error || 'Failed to terminate room');
    }
  }

  if (!room) {
    console.log(message)
    return (
      <div className="bg-[#151515] min-h-screen p-8">
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="text-green-500 mb-4 text-2xl">{message.winnerMessage}</div>
        <h1 className="text-xl font-bold text-[#F5F5F5]">Room: {message.roomCode}</h1>
        <div>
          <h2 className="text-xl font-semibold text-[#F5F5F5] mb-4">Players</h2>
          {message ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {message.playerList.map((player, index) => (
                <div key={index} className={`p-4 rounded ${player.userId === userId ? 'bg-[#282734]' : 'bg-[#2F2D40]'}`}>
                  <p className="text-[#F5F5F5]">{player.username}</p>
                  <p className="text-[#B0A7B3]">Cards: {player.hand.length}</p>
                </div>
              ))}
            </div>
          ) : ''}
        </div>
      </div>
    );
  }

  const currentPlayer = room.playerList.find(player => player.userId === userId);
  const username = currentPlayer.username;
  
  const playerIndex = room.playerList.findIndex(player => player.userId === userId);
  const previousPlayerIndex = room.gameDirection === 'forward'
    ? (room.currentPlayer - 1 + room.numPlayers) % room.numPlayers
    : (room.currentPlayer + 1) % room.numPlayers;

  return (
  <div className="mx-auto dark:bg-[#0a0c10] bg-[#f7faff] text-gray-800 dark:text-gray-200 rounded-lg shadow-lg overflow-hidden mt-5 p-4 transition-all duration-200" style={{ fontFamily: "Ubuntu Mono" }}>
    <header className="flex flex-col sm:flex-row items-center justify-between mb-4 bg-gray-800 p-4 rounded-lg shadow-md">
      <h1 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-2 sm:mb-0">
        Room: {room.roomCode}
      </h1>
      
      <div className="flex items-center gap-4">
        <button
          onClick={terminateRoom}
          className="bg-transparent border-2 border-[#D83149] text-[#D83149] hover:bg-[#D83149] hover:text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Terminate Room
        </button>
        
        <a
          href={`whatsapp://send?text=Let's play NikoKadi!%0AJoin my room:%0ARoom Code: *${room.roomCode}*%0ARoom ID: *${room.roomId}*%0Ahttps://kadi.pexmon.one/rooms`}
          className="flex items-center text-[#25D366] hover:text-opacity-80 transition-colors duration-200"
          title="Share room details"
        >
          <span className="mr-2 text-sm sm:text-base">Share room details</span>
          <FaWhatsapp size={24} />
        </a>
      </div>
    </header>

        
    {error && <div className="text-red-500 mb-4">{error}</div>}
  
    {message && <div className="text-green-500 mb-4 text-2xl">{message.winnerMessage}</div>}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
      <div>
        <h2 className="text-xl font-semibold text-[#F5F5F5] mb-4">Game Info</h2>
        <div className="bg-[#1C1C1E] p-6 rounded-lg shadow-xl">
          <p className="text-[#F5F5F5]">Players: {room.numPlayers}</p>
          <p className="text-[#F5F5F5]">Cards Dealt: {room.numToDeal}</p>
          <p className="text-[#F5F5F5]">Current Player: {room.playerList[room.currentPlayer].username}</p>
          <p className="text-[#F5F5F5]">Game Direction: {room.gameDirection}</p>
          <p className="text-[#F5F5F5]">Deck Size: {room.deckSize}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[#F5F5F5] mb-4">Players</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {room.playerList.map((player, index) => (
              <div key={index} className={`p-4 rounded ${player.userId === userId ? 'bg-[#282734]' : 'bg-[#2F2D40]'}`}>
                <p className="text-[#F5F5F5]">{player.username}</p>
                <p className="text-[#B0A7B3]">Cards: {player.hand.length}</p>
                {room.currentPlayer === index && <p className="text-[#FFD700]">Current Turn</p>}
                {room.isCard.includes(player.userId) && <p className='text-red-700'>NikoKadi</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold text-[#F5F5F5] mb-4">Top Card</h2>
        <div className="bg-[#1C1C1E] p-6 rounded-lg shadow-xl flex justify-center items-center">
          <Card card={room.topCard} />
        </div>
      </div>
    </div>
  
    {showSuitSelector && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-[#232946] p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-[#F5F5F5]">Select a suit:</h3>
          <div className="flex gap-4">
            {suits.map(suit => (
              <button
                key={suit}
                onClick={() => handleSuitChange(suit)}
                className="bg-[#4ECCA3] hover:bg-[#399b7e] text-white font-bold py-2 px-4 rounded transition-colors"
              >
                {suit}
              </button>
            ))}
          </div>
        </div>
      </div>
    )}
  
    {currentPlayer && (
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-[#F5F5F5] mb-4">Your Hand</h2>
        <div className="flex flex-wrap gap-4">
          {currentPlayer.hand ? (
            currentPlayer.hand.map((card, index) => (
              <div
                key={index}
                onClick={() => handleCardSelect(card)}
                className={`cursor-pointer ${selectedCards.includes(card) ? 
                  'border-4 rounded border-[#ceb89b] bg-[#948979] shadow-lg animate-move-card' : 
                  'border-4 border-transparent'}
                  ${droppingCards.includes(card) ? 'animate-fade-out' : ''}`}
              >
                <Card card={card} />
              </div>
            ))
          ) : (
            <p className="text-[#F5F5F5]">Cards in hand: {currentPlayer.handSize || 0}</p>
          )}
        </div>
      </div>
    )}
  
    {awaitingAceDrops && currentPlayer && currentPlayer.hand.some(card => card.charAt(0) === 'A') && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-[#232946] p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-[#F5F5F5]">Do you want to drop your Ace?</h3>
          <div className="flex gap-4">
            <button
              onClick={() => handleDropAce(true)}
              className="bg-[#4ECCA3] hover:bg-[#399b7e] text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Drop Ace
            </button>
            <button
              onClick={() => handleDropAce(false)}
              className="bg-[#E94560] hover:bg-[#D83149] text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Don't Drop
            </button>
          </div>
        </div>
      </div>
    )}
  
    {showQuestionAnswer && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-8">
        <div className="bg-[#232946] p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-[#F5F5F5]">Answer the question card:</h3>
          <div className="flex flex-wrap gap-4">
            {currentPlayer.hand.map((card, index) => (
              <div
                key={index}
                onClick={() => handleAnswerCardSelect(card)}
                className={`cursor-pointer ${selectedAnswerCards.includes(card) ? 
                  'border-4 border-[#948979] bg-[#948979] shadow-lg animate-move-card' : 
                  'border-4 border-transparent'}
                  ${droppingCards.includes(card) ? 'animate-fade-out' : ''}`}
              >
                <Card card={card} />
              </div>
            ))}
          </div>
          <div className="flex gap-4 my-8">
            <button
              onClick={() => handleQuestionAnswer(selectedAnswerCards)}
              className="bg-[#4ECCA3] hover:bg-[#399b7e] text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Drop
            </button>
            <button
              onClick={() => handleMove('pick')}
              className="bg-[#4ECCA3] hover:bg-[#399b7e] text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Pick
            </button>
          </div>
        </div>
      </div>
    )}
  
  <div className="mb-8 text-center">
      <div className="flex gap-4 justify-center items-center">
        <button
          onClick={() => handleMove('drop')}
          className="bg-transparent border-2 border-[#1AD95D] hover:bg-opacity-10 hover:bg-gray-300 text-[#1AD95D] font-bold py-2 p-4 rounded-xl transition-colors"
          disabled={
            !currentPlayer || 
            !currentPlayer.hand || 
            selectedCards.length === 0 || 
            room.currentPlayer !== room.playerList.findIndex(p => p.userId === userId)
          }
        >
          Drop
        </button>
        <button
          onClick={() => handleMove('pick')}
          className="bg-transparent border-2 border-[#F2CC0F] hover:bg-opacity-10 hover:bg-gray-300 text-[#F2CC0F] font-bold py-2 p-4 rounded-xl transition-colors"
          disabled={
            !currentPlayer || 
            !currentPlayer.hand || 
            room.currentPlayer !== room.playerList.findIndex(p => p.userId === userId)
          }
        >
          Pick
        </button>
      </div>

      <div className="flex justify-center items-center mt-4">
        {playerIndex === previousPlayerIndex && (
          <button
            onClick={() => handleIsCard()}
            className={`font-bold py-2 p-4 rounded-xl transition-colors cursor-pointer ${isKadi ? 
              'bg-[#D83149] text-white' : 
              'bg-transparent border-2 border-[#D83149] hover:bg-opacity-10 hover:bg-gray-300 text-[#D83149]'
            }`}
          >
            NikoKadi
          </button>
        )}
      </div>
    </div>
    <ChatComponent roomId={roomId} userId={userId} username={username}/>
  </div>    
  );  
};

export default Room;
