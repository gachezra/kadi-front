import React from 'react';

const AboutUs = () => {
  return (
    <div className="bg-[#151515] text-white font-sans min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-[#E2E2E2] mb-4">About NikoKadi</h1>
          <p className="text-xl md:text-2xl">Discover the passion and innovation behind our game</p>
        </header>

        <main>
          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-[#E2E2E2] mb-4">Our Story</h2>
            <p className="mb-4">
              NikoKadi was born from a simple yet powerful idea: to create a card game that brings people together,
              challenges their minds, and provides endless entertainment. Our journey began when a group of passionate
              gamers and developers came together, united by their love for card games and their desire to innovate in
              the online gaming space.
            </p>
            <p className="mb-4">
              Inspired by classic card games and modern digital experiences, we set out to create something unique.
              After months of brainstorming, prototyping, and rigorous testing, NikoKadi emerged as a game that blends
              familiar elements with exciting new mechanics, offering a fresh and addictive gaming experience.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-[#E2E2E2] mb-4">Our Mission</h2>
            <p className="mb-4">At NikoKadi, our mission is threefold:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>To provide an engaging, fair, and enjoyable gaming platform for players of all skill levels</li>
              <li>To foster a vibrant community where strategy, skill, and social interaction converge</li>
              <li>To continuously innovate and evolve, pushing the boundaries of what's possible in online card games</li>
            </ol>
            <p className="mt-4">
              We believe that games have the power to bring people together, stimulate minds, and create lasting
              memories. With NikoKadi, we aim to deliver on this belief every single day.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-[#E2E2E2] mb-4">The NikoKadi Difference</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Innovative Gameplay: Our unique blend of traditional card game elements with special cards and actions
                creates a dynamic and unpredictable gaming experience.
              </li>
              <li>
                Community-Driven Development: We actively listen to our players, incorporating feedback and ideas to
                continually improve the game.
              </li>
              <li>
                Fair Play Focus: Our sophisticated algorithms ensure balanced matchmaking and detect any unfair
                practices, maintaining a level playing field for all.
              </li>
              <li>
                Regular Updates: We're committed to keeping the game fresh with new features, cards, and events,
                ensuring there's always something new to discover.
              </li>
              <li>
                Accessibility: NikoKadi is designed to be easy to learn but difficult to master, welcoming players of all
                experience levels.
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-[#E2E2E2] mb-4">Meet the Team</h2>
            <p className="mb-4">
              Behind NikoKadi is a diverse team of passionate individuals, each bringing their unique skills and
              perspectives to the table:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Game Designers: Crafting the rules and mechanics that make NikoKadi uniquely entertaining</li>
              <li>Developers: Building and maintaining the robust platform that powers our game</li>
              <li>Artists: Creating the vibrant visuals that bring the NikoKadi world to life</li>
              <li>Community Managers: Fostering a positive and engaging environment for all players</li>
              <li>Support Team: Ensuring smooth gameplay experiences and addressing player concerns</li>
            </ul>
          </section>

          <section className="text-center">
            <p className="text-xl mb-4">Join us in shaping the future of online card gaming. Your adventure in NikoKadi awaits!</p>
            <button className="bg-[#1E1C24] hover:bg-[#2A2730] text-white font-bold py-3 px-6 rounded-lg text-xl transition duration-300">
              Start Playing Now
            </button>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AboutUs;
