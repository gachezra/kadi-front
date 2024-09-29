import React from 'react';
import { FaGamepad, FaAccusoft, FaHandPaper, FaTrophy, FaChartLine } from 'react-icons/fa';

const Course = () => {
  return (
    <div className="container mx-auto px-4 py-8 bg-[#f7faff] dark:bg-[#0a0c10] text-[#1a202c] dark:text-[#e2e8f0] rounded-lg shadow-lg overflow-hidden transition-all duration-200" style={{ fontFamily: "Ubuntu Mono" }}>
      <Title>How to Play the Card Game</Title>
      
      <Section
        icon={<FaGamepad className="text-4xl text-[#3182ce] dark:text-[#63b3ed]" />}
        title="Game Overview"
        content="This card game is played in a room with multiple players. Each player will have a hand of cards and will take turns playing."
      />
      
      <Section
        icon={<FaAccusoft className="text-4xl text-[#d69e2e] dark:text-[#faf089]" />}
        title="Card Mechanics"
        content="Players can pick cards from the deck or drop cards onto the central stack based on the game rules. The goal is to play all your cards first!"
      />
      
      <Section
        icon={<FaHandPaper className="text-4xl text-[#805ad5] dark:text-[#b794f4]" />}
        title="Game Actions"
        content="Players can play a card that matches the rank or suit of the card on top of the stack. Special cards trigger unique actions."
      />
      
      <Section
        icon={<FaTrophy className="text-4xl text-[#48bb78] dark:text-[#68d391]" />}
        title="Winning the Game"
        content="A player wins by depleting their hand under specific conditions. The game continues until someone meets the winning criteria."
      />
      
      <Section
        icon={<FaChartLine className="text-4xl text-[#e53e3e] dark:text-[#fc8181]" />}
        title="Game Flow"
        content="Players take turns in sequence. The current player is tracked, and turns proceed until a player wins."
      />
    </div>
  );
};

const Title = ({ children }) => (
  <h1 className="text-3xl font-bold text-center mb-8 text-[#2d3748] dark:text-[#e2e8f0]">
    {children}
  </h1>
);

const Section = ({ icon, title, content }) => (
  <div className="mb-8 bg-[#ffffff] dark:bg-[#1c1e21] shadow-xl rounded-lg p-6 transition-all duration-300 hover:shadow-2xl">
    <div className="flex items-center mb-4">
      {icon}
      <h2 className="text-xl font-semibold ml-4 text-[#2d3748] dark:text-[#e2e8f0]">{title}</h2>
    </div>
    <p className="text-[#4a5568] dark:text-[#a0aec0]">{content}</p>
  </div>
);

export default Course;