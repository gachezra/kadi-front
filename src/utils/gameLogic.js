export const isValidCard = (rank, suit) => {
    const validRanks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const validSuits = ['♥', '♦', '♣', '♠'];
    return validRanks.includes(rank) && validSuits.includes(suit);
  };
  
  export const isFeedingCard = (rank) => {
    return rank === '2' || rank === '3';
  };
  
  export const isSpecialCard = (rank) => {
    return ['2', '3', 'A', 'K', 'J', 'Q', '8'].includes(rank);
  };
  
  export const validateMove = (topCard, playedCards) => {
    if (playedCards.length < 1) {
      return false;
    }

    const topRank = topCard.charAt(0);
    const topSuit = topCard.charAt(1);

    for (const card of playedCards) {
      const cardRank = card.charAt(0);
      const cardSuit = card.charAt(1);

      if (cardRank === 'A') {
        return true;
      }

      if (['8', 'Q'].includes(cardRank)) {
        return cardSuit === topSuit || cardRank === topRank;
      }

      if (cardRank === topRank || cardSuit === topSuit || (isFeedingCard(cardRank) && cardSuit === topSuit)) {
        return true;
      }
    }

    return false;
  };
  
  export const handleSpecialCard = (card, gameState) => {
    const rank = card.charAt(0);
    const suit = card.charAt(1);
  
    switch (rank) {
      case 'A':
        gameState.currentSuit = suit;
        break;
      case '2':
      case '3':
        gameState.feedingCount = parseInt(rank);
        break;
      case 'J':
        gameState.skipCount += 1;
        break;
      case 'K':
        gameState.gameDirection = gameState.gameDirection === 'forward' ? 'backward' : 'forward';
        break;
        default:
        break;
    }
  
    return gameState;
  };
  
  export const determineWinner = (players, currentPlayerIndex, topCard) => {
    const currentPlayer = players[currentPlayerIndex];
    const otherPlayers = players.filter((_, index) => index !== currentPlayerIndex);
    const hasAtLeastOneCard = otherPlayers.every((player) => player.hand.length >= 1);
    const playerHasDepletedHand = currentPlayer.hand.length === 0;
    const finalRank = topCard.charAt(0);
  
    if (hasAtLeastOneCard && playerHasDepletedHand && finalRank >= '4' && finalRank <= '7') {
      return currentPlayer;
    }
  
    return null;
  };