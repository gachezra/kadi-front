import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Play, Users, Target, Zap, Shield, HelpCircle, FastForward, Repeat } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';

interface RuleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
}

const RuleSection: React.FC<RuleSectionProps> = ({ title, children, defaultOpen = false, icon }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <GlassCard className="overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {icon}
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        {isOpen ? <ChevronDown className="text-gray-400" /> : <ChevronRight className="text-gray-400" />}
      </button>
      {isOpen && (
        <div className="p-6 pt-0">
          <div className="border-t border-white/10 pt-6 text-gray-300">
            {children}
          </div>
        </div>
      )}
    </GlassCard>
  );
};

export const RulesPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <GlassCard className="p-8 mb-8 text-center">
        <h1 className="text-5xl font-extrabold text-white tracking-tight mb-2">How to Play NikoKadi</h1>
        <p className="text-gray-300 text-lg">Master the chaos. Become the legend.</p>
      </GlassCard>

      <div className="space-y-6">
        {/* Game Objective */}
        <RuleSection 
          title="🎯 Game Objective" 
          defaultOpen={true}
          icon={<Target className="text-green-400" size={20} />}
        >
          <p>
            The goal is simple: be the first player to get rid of all your cards. But watch out for special cards that can turn the tide of the game in an instant!
          </p>
        </RuleSection>

        {/* Basic Setup */}
        <RuleSection 
          title="⚙️ Basic Setup" 
          icon={<Users className="text-blue-400" size={20} />}
        >
          <div className="space-y-4">
            <p><strong>Players:</strong> 2-8 players can join a room.</p>
            <p><strong>Cards:</strong> Each player is dealt 5-13 cards (set by the room owner).</p>
            <p><strong>Starting:</strong> One card is placed face-up as the starting card. The remaining cards form the draw pile.</p>
            <p><strong>Turn Order:</strong> Players take turns, typically in a clockwise direction until a special card reverses it.</p>
          </div>
        </RuleSection>

        {/* Gameplay Flow */}
        <RuleSection 
          title="▶️ Gameplay Flow" 
          icon={<Play className="text-gray-400" size={20} />}
        >
          <div className="space-y-4">
            <p>On your turn, you must play a card that matches either the <strong>value</strong> or the <strong>suit</strong> of the top card on the discard pile.</p>
            <p><strong>Example:</strong> If the top card is a <strong>7 of Hearts (7♥)</strong>, you can play any Heart card or any 7 card (e.g., 7♣, 7♠, 7♦).</p>
            <p>If you cannot play a card, you must <strong>pick up one card</strong> from the draw pile. If you can play the card you just picked up, you may do so immediately.</p>
            <p>Certain special cards can be played at any time. Let's get to those now!</p>
          </div>
        </RuleSection>

        {/* Special Cards */}
        <RuleSection
          title="🃏 Special Cards"
          icon={<Zap className="text-yellow-400" size={20} />}
        >
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-red-300 mb-2 flex items-center"><Shield className="mr-2" size={16}/>🅰️ Ace (A) - Suit Changer & Stopper</h4>
              <p>The Ace is a powerful card. When played, you can change the current suit to any suit of your choice. It can be played at any time (on any suit or value) and also <strong>stops a feeding chain</strong> (when you are being forced to pick up 2s or 3s).</p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-blue-300 mb-2">🍖 Feeding Cards (2 & 3)</h4>
              <p>When a <strong>2</strong> or a <strong>3</strong> is played, the next player is forced to 'eat' (pick up) 2 or 3 cards, respectively. These can be stacked! If a player drops a 2, the next can drop another 2, forcing the following player to pick up 4 cards.</p>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-purple-300 mb-2 flex items-center"><HelpCircle className="mr-2" size={16}/>❓ Question Cards (8 & Q)</h4>
              <p>Playing an <strong>8</strong> or a <strong>Queen (Q)</strong> lets you ask a question to the next player. They must answer with cards of the same value. These can often be played on any card.</p>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-green-300 mb-2 flex items-center"><FastForward className="mr-2" size={16}/>🏃 Jumper (J)</h4>
              <p>The <strong>Jack (J)</strong> is a 'jumper'. It skips the next player's turn. You can stack Jacks to skip multiple players. For example, playing two Jacks at once will skip the next two players in line.</p>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-orange-300 mb-2 flex items-center"><Repeat className="mr-2" size={16}/>🔄 Kickback (K)</h4>
              <p>The <strong>King (K)</strong> is a 'kickback'. Playing it immediately reverses the direction of play. If play was moving clockwise, it will now move counter-clockwise, and vice-versa.</p>
            </div>
          </div>
        </RuleSection>

        {/* NikoKadi Rule */}
        <RuleSection 
          title="⚡ The NikoKadi Rule" 
          icon={<Zap className="text-orange-400" size={20} />}
        >
          <div className="space-y-4">
            <p>When a player has <strong>only one card remaining</strong>, other players can declare <strong>"NikoKadi!"</strong> before the next turn starts.</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>If the declaration is correct, the player with one card must pick up <strong>5 penalty cards</strong>.</li>
              <li>If the declaration is incorrect (the player has more than one card), the person who made the declaration picks up <strong>5 penalty cards</strong> themselves.</li>
            </ul>
            <p>Timing is everything! You must declare it before the next player officially starts their turn.</p>
          </div>
        </RuleSection>

        <div className="text-center pt-8">
            <Link to="/play">
                <Button variant="primary" size="lg">
                    <Play className="mr-2" />
                    Let's Play!
                </Button>
            </Link>
        </div>
      </div>
    </div>
  );
};
