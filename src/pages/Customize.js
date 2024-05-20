import * as React from 'react';
import ReactNiceAvatar from 'react-nice-avatar';
import { FaHatCowboySide, FaAccusoft } from 'react-icons/fa';
import { SvgHatCowboySide, SvgGlasses, SvgHair } from '../components/svgicons';
import { saveAs } from 'file-saver';

const AvatarCustomizer = () => {
  const [config, setConfig] = React.useState({
    sex: 'man',
    faceColor: '#f5a623',
    earSize: 'small',
    hairColor: '#000000',
    hairStyle: 'normal',
    hairColorRandom: false,
    hatColor: '#ffffff',
    hatStyle: 'none',
    eyeStyle: 'circle',
    glassesStyle: 'none',
    noseStyle: 'short',
    mouthStyle: 'smile',
    shirtStyle: 'hoody',
    shirtColor: '#0081ff',
    bgColor: '#eeeeee',
    isGradient: false
  });

  const hairOptions = ['normal', 'thick', 'mohawk', 'womanLong', 'womanShort'];
  const hatOptions = ['beanie', 'turban', 'none'];
  const glassesOptions = ['round', 'square', 'none'];
  const sexOptions = ['man', 'woman'];
  const earSizeOptions = ['small', 'big'];
  const eyeStyleOptions = ['circle', 'oval', 'smile'];
  const noseStyleOptions = ['short', 'long', 'round'];
  const mouthStyleOptions = ['laugh', 'smile', 'peace'];
  const shirtStyleOptions = ['hoody', 'short', 'polo'];
  const eyeBrowStyleOptions = ['up', 'upWoman'];
  const faceColorOptions = ['#f5a623', '#8b572a', '#7ed321', '#d0021b', '#4a90e2'];
  const hairColorOptions = ['#000000', '#ffffff', '#f5a623', '#4a90e2', '#9013fe'];
  const hatColorOptions = ['#ffffff', '#000000', '#4a90e2', '#f5a623', '#9013fe'];
  const shirtColorOptions = ['#0081ff', '#f5a623', '#9013fe', '#4a90e2', '#000000'];
  const bgColorOptions = ['#eeeeee', '#dfe6e9', '#b2bec3', '#636e72', '#2d3436'];

  const handleOptionChange = (optionType, options) => {
    return () => {
      const currentIndex = options.indexOf(config[optionType]);
      const nextIndex = (currentIndex + 1) % options.length;
      setConfig({
        ...config,
        [optionType]: options[nextIndex]
      });
    };
  };

  const handleSaveAvatar = () => {
    const avatarComponent = ReactNiceAvatar.createComponent(config);
    const svgString = avatarComponent.renderSVG();
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    saveAs(blob, 'avatar.svg');
  };

  const handleTemplateChange = (template) => {
    setConfig(template);
  };

  return (
    <div className="flex items-center justify-center min-h-screen dark:bg-[#000614] bg-[#ebf1ff] rounded-lg shadow-lg">
      <div className="main rounded-lg p-10 transition-transform w-[100%] text-center">
        <ReactNiceAvatar {...config} className="mx-auto w-64 h-64 shadow-full mb-5 mt-10 rounded-full" />
        <div className="flex justify-center flex-wrap gap-2 mb-4">
          <button
            onClick={handleOptionChange('hairStyle', hairOptions)}
            className="bg-blue-500 text-white font-bold p-2 rounded-full inline-flex items-center"
          >
            <SvgHair />
          </button>
          <button
            onClick={handleOptionChange('hatStyle', hatOptions)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold p-2 rounded-full inline-flex items-center"
          >
            <SvgHatCowboySide />
          </button>
          <button
            onClick={handleOptionChange('glassesStyle', glassesOptions)}
            className="bg-red-500 hover:bg-red-700 text-white font-bold p-2 rounded-full inline-flex items-center"
          >
            <SvgGlasses />
          </button>
          <button
            onClick={handleOptionChange('sex', sexOptions)}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold p-2 rounded-full inline-flex items-center"
          >
            <FaHatCowboySide />
          </button>
          <button
            onClick={handleOptionChange('earSize', earSizeOptions)}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold p-2 rounded-full inline-flex items-center"
          >
            <FaAccusoft />
          </button>
          <button
            onClick={handleOptionChange('eyeStyle', eyeStyleOptions)}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold p-2 rounded-full inline-flex items-center"
          >
            <FaHatCowboySide />
          </button>
          <button
            onClick={handleOptionChange('noseStyle', noseStyleOptions)}
            className="bg-pink-500 hover:bg-pink-700 text-white font-bold p-2 rounded-full inline-flex items-center"
          >
            <FaHatCowboySide />
          </button>
          <button
            onClick={handleOptionChange('mouthStyle', mouthStyleOptions)}
            className="bg-red-500 hover:bg-red-700 text-white font-bold p-2 rounded-full inline-flex items-center"
          >
            <FaHatCowboySide />
          </button>
          <button
            onClick={handleOptionChange('shirtStyle', shirtStyleOptions)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 rounded-full inline-flex items-center"
          >
            <FaHatCowboySide />
          </button>
          <button
            onClick={handleOptionChange('eyeBrowStyle', eyeBrowStyleOptions)}
            className="bg-black hover:bg-black-700 text-white font-bold p-2 rounded-full inline-flex items-center"
          >
            <FaHatCowboySide />
          </button>
          <button
            onClick={handleOptionChange('faceColor', faceColorOptions)}
            className="bg-orange-500 hover:bg-orange-700 text-white font-bold p-2 rounded-full inline-flex items-center"
          >
            <FaHatCowboySide />
          </button>
          <button
            onClick={handleOptionChange('hairColor', hairColorOptions)}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold p-2 rounded-full inline-flex items-center"
          >
            <FaHatCowboySide />
          </button>
          <button
            onClick={handleOptionChange('hatColor', hatColorOptions)}
            className="bg-teal-500 hover:bg-teal-700 text-white font-bold p-2 rounded-full inline-flex items-center"
          >
            <FaHatCowboySide />
          </button>
          <button
            onClick={handleOptionChange('shirtColor', shirtColorOptions)}
            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold p-2 rounded-full inline-flex items-center"
          >
            <FaHatCowboySide />
          </button>
          <button
            onClick={handleOptionChange('bgColor', bgColorOptions)}
            className="bg-gray-800 hover:bg-gray-900 text-white font-bold p-2 rounded-full inline-flex items-center"
          >
            <FaHatCowboySide />
          </button>
        </div>
        <button
          onClick={handleSaveAvatar}
          className="bg-green-600 text-white py-3 px-6 rounded-md cursor-pointer transition-colors duration-300 hover:bg-green-500 mt-4"
        >
          Save Avatar
        </button>
        <h2 className="text-lg font-bold mt-8 mb-4 dark:text-white">Complete Configurations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="bg-white dark:bg-[#0f172a] rounded-lg shadow-md p-4 cursor-pointer transition-colors duration-300 hover:bg-gray-200 dark:hover:bg-[#1e293b]"
            onClick={() => handleTemplateChange({ sex: 'man', faceColor: '#f5a623', earSize: 'small', hairColor: '#000000', hairStyle: 'normal', hatColor: '#ffffff', hatStyle: 'none', eyeStyle: 'circle', glassesStyle: 'none', noseStyle: 'short', mouthStyle: 'smile', shirtStyle: 'hoody', shirtColor: '#0081ff', bgColor: '#eeeeee' })}
          >
            <h3 className="text-lg font-bold mb-2 dark:text-white">Male Avatar</h3>
            <ReactNiceAvatar
              sex="man"
              faceColor="#f5a623"
              earSize="small"
              hairColor="#000000"
              hairStyle="normal"
              hatColor="#ffffff"
              hatStyle="none"
              eyeStyle="circle"
              glassesStyle="none"
              noseStyle="short"
              mouthStyle="smile"
              shirtStyle="hoody"
              shirtColor="#0081ff"
              bgColor="#eeeeee"
              className="mx-auto w-48 h-48 shadow-full rounded-full"
            />
          </div>
          <div
            className="bg-white dark:bg-[#0f172a] rounded-lg shadow-md p-4 cursor-pointer transition-colors duration-300 hover:bg-gray-200 dark:hover:bg-[#1e293b]"
            onClick={() => handleTemplateChange({ sex: 'woman', faceColor: '#8b572a', earSize: 'big', hairColor: '#ffffff', hairStyle: 'womanLong', hatColor: '#9013fe', hatStyle: 'turban', eyeStyle: 'oval', glassesStyle: 'round', noseStyle: 'round', mouthStyle: 'peace', shirtStyle: 'polo', shirtColor: '#4a90e2', bgColor: '#dfe6e9' })}
          >
            <h3 className="text-lg font-bold mb-2 dark:text-white">Female Avatar</h3>
            <ReactNiceAvatar
              sex="woman"
              faceColor="#8b572a"
              earSize="big"
              hairColor="#ffffff"
              hairStyle="womanLong"
              hatColor="#9013fe"
              hatStyle="turban"
              eyeStyle="oval"
              glassesStyle="round"
              noseStyle="round"
              mouthStyle="peace"
              shirtStyle="polo"
              shirtColor="#4a90e2"
              bgColor="#dfe6e9"
              className="mx-auto w-48 h-48 shadow-full rounded-full"
            />
          </div>
          <div className="bg-white dark:bg-[#0f172a] rounded-lg shadow-md p-4 cursor-pointer transition-colors duration-300 hover:bg-gray-200 dark:hover:bg-[#1e293b]">
            <h3 className="text-lg font-bold mb-2 dark:text-white">Custom Avatar</h3>
            <ReactNiceAvatar
              {...config}
              className="mx-auto w-48 h-48 shadow-full rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarCustomizer;