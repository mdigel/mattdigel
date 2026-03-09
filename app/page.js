'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import FirstLoadAnimation from '../components/FirstLoadAnimation';
import featureFlags from '../config/features';

const quizQuestions = [
    {
      id: 1,
      question: "what's my favorite company I've worked for?",
      choices: [
        {
          option: "A",
          text: "Nike",
          explanation: "I did love it, but the slowness and tech as a second-class citizen eventually caused me to look elsewhere."
        },
        {
          option: "B",
          text: "BlinkRx",
          correct: true,
          explanation: "Yes! My first marketplace product (4-sided). A rocketship — we've grown 7x during my tenure. I've reported to the founder the entire time and have been mentored by one of Jeff Bezos' direct reports."
        },
        {
          option: "C",
          text: "FabFitFun",
          explanation: "Not quite. I did own the core experience which involved a gamified flash sale. We had 2M users signing on for these shopping events at the height of COVID. Fun times, but wasn't meant to last for me."
        },
        {
          option: "D",
          text: "Gonomic AI",
          explanation: "This was my first startup. We tried to build an AI company before ChatGPT (insane). It was an AI-Enabled Mobile Application for the Ergonomic Assessment of Home Workspaces to help you improve your posture… a 'COVID employee benefit' was the thought. We shut it down when a co-founder got a Director gig at Amazon."
        }
      ]
    },
    {
      id: 2,
      question: "How much money have I generated from my Internet businesses?",
      choices: [
        {
          option: "A",
          text: "$150k",
          explanation: "One day!"
        },
        {
          option: "B",
          text: "$75k",
          explanation: "Not quite."
        },
        {
          option: "C",
          text: "$30k",
          correct: true,
          explanation: "Through a Shopify store and vibe coding for clients I've generated $32k of revenue in my non-W2 internet career."
        },
        {
          option: "D",
          text: "$12k",
          explanation: "I'm better than that!"
        }
      ]
    },
    {
      id: 3,
      question: "What blog do I make all my direct reports read?",
      choices: [
        {
          option: "A",
          text: "High Agency in 30 mins",
          url: "highagency.com",
          correct: true,
          explanation: "Exactly. This is the mindset I want every PM to internalize — it's not about permission, it's about ownership, resourcefulness, and figuring it out anyway."
        },
        {
          option: "B",
          text: "Communication is the Job by Andrew Bosworth",
          url: "boz.com/articles/communication-is-the-job",
          explanation: "A classic, but more about how to sound effective than how to be effective."
        },
        {
          option: "C",
          text: "Good Product Strategy, Bad Product Strategy by Shreyas Doshi",
          url: "medium.com/@shreyashere/good-product-strategy-bad-product-strategy-826cdfe74818",
          explanation: "Great framework piece, but not the one I evangelize. More 'how to think,' less 'how to act.'"
        },
        {
          option: "D",
          text: "Distribution, by Ben Horowitz",
          url: "a16z.com/distribution",
          explanation: "Worth reading, but focused on scale and GTM — not the core of personal agency or ownership."
        }
      ]
    },
    {
      id: 4,
      question: "What do I think about for every Product decision?",
      choices: [
        {
          option: "A",
          text: "What is the user really trying to do? What is the user feeling?",
          correct: true,
          explanation: "The north star. Everything else — metrics, features, optics — follows from this."
        },
        {
          option: "B",
          text: "How can we make this simpler without losing impact?",
          explanation: "Always on my mind, but simplicity is a tactic — not the foundation."
        },
        {
          option: "C",
          text: "How can we validate this before we ship it?",
          explanation: "A practical next step, but not the first lens I use."
        },
        {
          option: "D",
          text: "How do I make this feel like their idea so it actually gets approved?",
          explanation: "Painfully real. The political calculus every PM secretly does — but not exactly the soul of product thinking."
        }
      ]
    },
    {
      id: 5,
      question: "My preferred tech stack for personal projects?",
      choices: [
        {
          option: "A",
          text: "React, Next.js, Supabase (Postgres), Vercel",
          correct: true,
          explanation: "Yup — my happy place. Fast, modern, and perfect for full-stack MVPs with velocity. Supabase for auth/db, Vercel for deploys, and Cursor for flow."
        },
        {
          option: "B",
          text: "Vue 3 + Nuxt, Firebase Cloud Functions, Firestore, Netlify",
          explanation: "Respectable combo. I prefer TypeScript-first ergonomics and the Next.js/Vercel DX."
        },
        {
          option: "C",
          text: "React Native, Expo, Supabase",
          explanation: "This is what I'd use for mobile — modern, fast iteration, and full-stack ready. Supabase handles backend and auth, Expo streamlines builds. But I haven't pursued mobile much yet."
        },
        {
          option: "D",
          text: "Lovable",
          explanation: "Fun for jumpstarting CRUD and auth. Great for a sprint, though I usually end up iterating in Cursor after scaffolding."
        }
      ]
    }
  ];

export default function Home() {
  const [nycTime, setNycTime] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const [answers, setAnswers] = useState({});
  const [showKeyboardHint, setShowKeyboardHint] = useState(true);
  const [showTransitionAnimation, setShowTransitionAnimation] = useState(false);
  const [showCalendly, setShowCalendly] = useState(false);
  const [profileTilt, setProfileTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [showProducts, setShowProducts] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const nycTimeString = now.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setNycTime(nycTimeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const playGameSound = (soundType) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    switch(soundType) {
      case 'coin':
        // Mario-style coin collect
        const coinFreq = 800;
        const oscillator1 = audioContext.createOscillator();
        const gainNode1 = audioContext.createGain();
        
        oscillator1.connect(gainNode1);
        gainNode1.connect(audioContext.destination);
        
        oscillator1.frequency.setValueAtTime(coinFreq, audioContext.currentTime);
        oscillator1.frequency.linearRampToValueAtTime(1200, audioContext.currentTime + 0.1);
        oscillator1.type = 'square';
        
        gainNode1.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode1.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
        
        oscillator1.start(audioContext.currentTime);
        oscillator1.stop(audioContext.currentTime + 0.15);
        break;
        
      case 'powerup':
        // Power-up sound (ascending)
        const powerupFreqs = [400, 600, 800, 1000];
        powerupFreqs.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
          oscillator.type = 'triangle';
          
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);
          
          oscillator.start(audioContext.currentTime + index * 0.05);
          oscillator.stop(audioContext.currentTime + index * 0.05 + 0.08);
        });
        break;
        
      case 'levelup':
        // Level up fanfare
        const melody = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        melody.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.12, audioContext.currentTime + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
          
          oscillator.start(audioContext.currentTime + index * 0.1);
          oscillator.stop(audioContext.currentTime + index * 0.1 + 0.2);
        });
        break;
        
      case 'error':
        // Simple error buzz (keeping original)
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        
        oscillator2.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator2.type = 'sawtooth';
        
        gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode2.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
        gainNode2.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        
        oscillator2.start(audioContext.currentTime);
        oscillator2.stop(audioContext.currentTime + 0.3);
        break;
        
      case 'duolingo_wrong':
        // Duolingo-style wrong answer sound
        const wrongTime = audioContext.currentTime;
        
        // Layer 1: downward "bwah" (detuned dual saw through LPF)
        const bwahOsc1 = audioContext.createOscillator();
        const bwahOsc2 = audioContext.createOscillator();
        const bwahGain1 = audioContext.createGain();
        const bwahGain2 = audioContext.createGain();
        const bwahOut = audioContext.createGain();
        const bwahLP = audioContext.createBiquadFilter();
        
        bwahOsc1.connect(bwahGain1);
        bwahOsc2.connect(bwahGain2);
        bwahGain1.connect(bwahOut);
        bwahGain2.connect(bwahOut);
        bwahOut.connect(bwahLP);
        bwahLP.connect(audioContext.destination);
        
        bwahOsc1.type = 'sawtooth';
        bwahOsc2.type = 'sawtooth';
        bwahLP.type = 'lowpass';
        bwahLP.Q.value = 0.9;
        
        const f0 = 440 * Math.pow(2, (55 - 69) / 12); // E2
        const f1 = f0 * 0.43; // deeper fall
        
        bwahOsc1.frequency.setValueAtTime(f0 * 1.01, wrongTime);
        bwahOsc2.frequency.setValueAtTime(f0 * 0.99, wrongTime);
        bwahOsc1.frequency.exponentialRampToValueAtTime(f1 * 1.01, wrongTime + 0.26);
        bwahOsc2.frequency.exponentialRampToValueAtTime(f1 * 0.99, wrongTime + 0.26);
        
        bwahLP.frequency.setValueAtTime(1600, wrongTime);
        bwahLP.frequency.exponentialRampToValueAtTime(500, wrongTime + 0.26);
        
        bwahGain1.gain.value = 0.6;
        bwahGain2.gain.value = 0.55;
        
        bwahOut.gain.setValueAtTime(0, wrongTime);
        bwahOut.gain.exponentialRampToValueAtTime(0.9, wrongTime + 0.004);
        bwahOut.gain.exponentialRampToValueAtTime(0.35, wrongTime + 0.064);
        bwahOut.gain.exponentialRampToValueAtTime(0.001, wrongTime + 0.35);
        
        bwahOsc1.start(wrongTime);
        bwahOsc2.start(wrongTime);
        bwahOsc1.stop(wrongTime + 0.45);
        bwahOsc2.stop(wrongTime + 0.45);
        
        // Layer 2: error blip (minor 2nd cluster)
        const blipOsc1 = audioContext.createOscillator();
        const blipOsc2 = audioContext.createOscillator();
        const blipGain1 = audioContext.createGain();
        const blipGain2 = audioContext.createGain();
        const blipPan1 = audioContext.createStereoPanner();
        const blipPan2 = audioContext.createStereoPanner();
        
        blipOsc1.connect(blipGain1);
        blipOsc2.connect(blipGain2);
        blipGain1.connect(blipPan1);
        blipGain2.connect(blipPan2);
        blipPan1.connect(audioContext.destination);
        blipPan2.connect(audioContext.destination);
        
        blipOsc1.type = 'triangle';
        blipOsc2.type = 'triangle';
        blipPan1.pan.value = -0.15;
        blipPan2.pan.value = 0.15;
        
        const blipFreq1 = 440 * Math.pow(2, (64 - 69) / 12); // E4
        const blipFreq2 = 440 * Math.pow(2, (65 - 69) / 12); // F4
        
        blipOsc1.frequency.setValueAtTime(blipFreq1, wrongTime + 0.03);
        blipOsc2.frequency.setValueAtTime(blipFreq2, wrongTime + 0.03);
        blipOsc1.frequency.exponentialRampToValueAtTime(blipFreq1 * 0.92, wrongTime + 0.14);
        blipOsc2.frequency.exponentialRampToValueAtTime(blipFreq2 * 0.92, wrongTime + 0.14);
        
        blipGain1.gain.setValueAtTime(0, wrongTime + 0.03);
        blipGain2.gain.setValueAtTime(0, wrongTime + 0.03);
        blipGain1.gain.exponentialRampToValueAtTime(0.6, wrongTime + 0.032);
        blipGain2.gain.exponentialRampToValueAtTime(0.6, wrongTime + 0.032);
        blipGain1.gain.exponentialRampToValueAtTime(0.1, wrongTime + 0.072);
        blipGain2.gain.exponentialRampToValueAtTime(0.1, wrongTime + 0.072);
        blipGain1.gain.exponentialRampToValueAtTime(0.001, wrongTime + 0.18);
        blipGain2.gain.exponentialRampToValueAtTime(0.001, wrongTime + 0.18);
        
        blipOsc1.start(wrongTime + 0.03);
        blipOsc2.start(wrongTime + 0.03);
        blipOsc1.stop(wrongTime + 0.18);
        blipOsc2.stop(wrongTime + 0.18);
        
        // Layer 3: muffled thunk (noise burst through LPF)
        const thunkBuffer = audioContext.createBuffer(1, Math.ceil(audioContext.sampleRate * 0.06 * 2), audioContext.sampleRate);
        const thunkData = thunkBuffer.getChannelData(0);
        for (let i = 0; i < thunkData.length; i++) {
          thunkData[i] = (Math.random() * 2 - 1);
        }
        const thunkSource = audioContext.createBufferSource();
        const thunkGain = audioContext.createGain();
        const thunkLP = audioContext.createBiquadFilter();
        
        thunkSource.buffer = thunkBuffer;
        thunkSource.connect(thunkGain);
        thunkGain.connect(thunkLP);
        thunkLP.connect(audioContext.destination);
        
        thunkLP.type = 'lowpass';
        thunkLP.frequency.value = 900;
        
        thunkGain.gain.setValueAtTime(0.001, wrongTime + 0.01);
        thunkGain.gain.exponentialRampToValueAtTime(0.3, wrongTime + 0.018);
        thunkGain.gain.exponentialRampToValueAtTime(0.001, wrongTime + 0.07);
        
        thunkSource.start(wrongTime + 0.01);
        thunkSource.stop(wrongTime + 0.08);
        
        // Layer 4: faint hiss (high-passed noise)
        const hissBuffer = audioContext.createBuffer(1, Math.ceil(audioContext.sampleRate * 0.05 * 1.5), audioContext.sampleRate);
        const hissData = hissBuffer.getChannelData(0);
        for (let i = 0; i < hissData.length; i++) {
          hissData[i] = (Math.random() * 2 - 1);
        }
        const hissSource = audioContext.createBufferSource();
        const hissGain = audioContext.createGain();
        const hissHP = audioContext.createBiquadFilter();
        
        hissSource.buffer = hissBuffer;
        hissSource.connect(hissGain);
        hissGain.connect(hissHP);
        hissHP.connect(audioContext.destination);
        
        hissHP.type = 'highpass';
        hissHP.frequency.value = 3500;
        
        hissGain.gain.setValueAtTime(0.001, wrongTime + 0.02);
        hissGain.gain.exponentialRampToValueAtTime(0.05, wrongTime + 0.025);
        hissGain.gain.exponentialRampToValueAtTime(0.001, wrongTime + 0.07);
        
        hissSource.start(wrongTime + 0.02);
        hissSource.stop(wrongTime + 0.07);
        break;
        
      case 'cartoon_fail':
        // Cartoon-style fail sound
        const cartoonTime = audioContext.currentTime;
        
        // Layer A: "Boing" - sine with exaggerated bounce + vibrato
        const boingOsc = audioContext.createOscillator();
        const boingGain = audioContext.createGain();
        const boingLFO = audioContext.createOscillator();
        const boingLFOGain = audioContext.createGain();
        
        boingOsc.type = 'sine';
        boingLFO.type = 'sine';
        boingLFO.frequency.setValueAtTime(8, cartoonTime);
        boingLFOGain.gain.value = 440 * Math.pow(2, (62 - 69) / 12) * 0.006 * 1.3; // vibrato depth
        
        boingLFO.connect(boingLFOGain);
        boingLFOGain.connect(boingOsc.frequency);
        boingOsc.connect(boingGain);
        boingGain.connect(audioContext.destination);
        
        const baseFreq = 440 * Math.pow(2, (62 - 69) / 12); // E4
        const hiFreq = baseFreq * 2.3;
        const lowFreq = baseFreq * 0.45;
        const reboundFreq = lowFreq * 1.28;
        
        boingOsc.frequency.setValueAtTime(hiFreq, cartoonTime);
        boingOsc.frequency.exponentialRampToValueAtTime(lowFreq, cartoonTime + 0.18);
        boingOsc.frequency.exponentialRampToValueAtTime(reboundFreq, cartoonTime + 0.23);
        boingOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, cartoonTime + 0.28);
        
        boingGain.gain.setValueAtTime(0, cartoonTime);
        boingGain.gain.exponentialRampToValueAtTime(0.95, cartoonTime + 0.003);
        boingGain.gain.exponentialRampToValueAtTime(0.25, cartoonTime + 0.063);
        boingGain.gain.exponentialRampToValueAtTime(0.001, cartoonTime + 0.37);
        
        boingOsc.start(cartoonTime);
        boingLFO.start(cartoonTime);
        boingOsc.stop(cartoonTime + 0.48);
        boingLFO.stop(cartoonTime + 0.48);
        
        // Layer B: Tritone blip (cartoony dissonance)
        const tritoneFreqs = [440 * Math.pow(2, (67 - 69) / 12), 440 * Math.pow(2, (73 - 69) / 12)]; // G4, C#5
        tritoneFreqs.forEach((freq, i) => {
          const tritoneOsc = audioContext.createOscillator();
          const tritoneGain = audioContext.createGain();
          const tritonePan = audioContext.createStereoPanner();
          
          tritoneOsc.type = 'triangle';
          tritonePan.pan.value = i ? 0.18 : -0.18;
          
          tritoneOsc.connect(tritoneGain);
          tritoneGain.connect(tritonePan);
          tritonePan.connect(audioContext.destination);
          
          tritoneOsc.frequency.setValueAtTime(freq * 1.04, cartoonTime + 0.015);
          tritoneOsc.frequency.exponentialRampToValueAtTime(freq * 0.86, cartoonTime + 0.135);
          
          tritoneGain.gain.setValueAtTime(0, cartoonTime + 0.015);
          tritoneGain.gain.exponentialRampToValueAtTime(0.9, cartoonTime + 0.017);
          tritoneGain.gain.exponentialRampToValueAtTime(0.1, cartoonTime + 0.057);
          tritoneGain.gain.exponentialRampToValueAtTime(0.001, cartoonTime + 0.255);
          
          tritoneOsc.start(cartoonTime + 0.015);
          tritoneOsc.stop(cartoonTime + 0.255);
        });
        
        // Layer C: Mini "sad trombone" wah
        const wahOsc = audioContext.createOscillator();
        const wahGain = audioContext.createGain();
        const wahLP = audioContext.createBiquadFilter();
        const wahBP = audioContext.createBiquadFilter();
        
        wahOsc.type = 'sawtooth';
        wahLP.type = 'lowpass';
        wahLP.Q.value = 0.9;
        wahBP.type = 'bandpass';
        wahBP.Q.value = 6.0;
        
        wahOsc.connect(wahGain);
        wahGain.connect(wahLP);
        wahLP.connect(wahBP);
        wahBP.connect(audioContext.destination);
        
        const wahStartFreq = 440 * Math.pow(2, (52 - 69) / 12) * 1.8; // E3
        const wahEndFreq = wahStartFreq * 0.43;
        
        wahOsc.frequency.setValueAtTime(wahStartFreq, cartoonTime);
        wahOsc.frequency.exponentialRampToValueAtTime(wahEndFreq, cartoonTime + 0.35);
        
        wahBP.frequency.setValueAtTime(2500, cartoonTime);
        wahBP.frequency.exponentialRampToValueAtTime(600, cartoonTime + 0.147);
        wahBP.frequency.exponentialRampToValueAtTime(2000, cartoonTime + 0.245);
        wahBP.frequency.exponentialRampToValueAtTime(540, cartoonTime + 0.35);
        
        wahGain.gain.setValueAtTime(0, cartoonTime);
        wahGain.gain.exponentialRampToValueAtTime(0.7, cartoonTime + 0.005);
        wahGain.gain.exponentialRampToValueAtTime(0.18, cartoonTime + 0.085);
        wahGain.gain.exponentialRampToValueAtTime(0.001, cartoonTime + 0.5);
        
        wahOsc.start(cartoonTime);
        wahOsc.stop(cartoonTime + 0.5);
        
        // Layer D: Bonk + puff
        // Bonk
        const bonkOsc = audioContext.createOscillator();
        const bonkGain = audioContext.createGain();
        
        bonkOsc.type = 'sine';
        bonkOsc.connect(bonkGain);
        bonkGain.connect(audioContext.destination);
        
        bonkOsc.frequency.setValueAtTime(130, cartoonTime + 0.03);
        bonkOsc.frequency.exponentialRampToValueAtTime(90, cartoonTime + 0.08);
        
        bonkGain.gain.setValueAtTime(0, cartoonTime + 0.03);
        bonkGain.gain.exponentialRampToValueAtTime(0.7, cartoonTime + 0.031);
        bonkGain.gain.exponentialRampToValueAtTime(0.01, cartoonTime + 0.061);
        bonkGain.gain.exponentialRampToValueAtTime(0.001, cartoonTime + 0.15);
        
        bonkOsc.start(cartoonTime + 0.03);
        bonkOsc.stop(cartoonTime + 0.15);
        
        // Puff
        const puffBuffer = audioContext.createBuffer(1, Math.ceil(audioContext.sampleRate * 0.09), audioContext.sampleRate);
        const puffData = puffBuffer.getChannelData(0);
        for (let i = 0; i < puffData.length; i++) {
          puffData[i] = (Math.random() * 2 - 1);
        }
        const puffSource = audioContext.createBufferSource();
        const puffGain = audioContext.createGain();
        const puffHP = audioContext.createBiquadFilter();
        
        puffSource.buffer = puffBuffer;
        puffSource.connect(puffGain);
        puffGain.connect(puffHP);
        puffHP.connect(audioContext.destination);
        
        puffHP.type = 'highpass';
        puffHP.frequency.value = 4000;
        
        puffGain.gain.setValueAtTime(0.001, cartoonTime + 0.04);
        puffGain.gain.exponentialRampToValueAtTime(0.17, cartoonTime + 0.058);
        puffGain.gain.exponentialRampToValueAtTime(0.001, cartoonTime + 0.13);
        
        puffSource.start(cartoonTime + 0.04);
        puffSource.stop(cartoonTime + 0.13);
        break;
        
      case 'sad_trombone':
        // Gentle sad trombone sound
        const sadTime = audioContext.currentTime;
        
        // Create gentle room reverb
        const reverbBuffer = audioContext.createBuffer(2, Math.ceil(audioContext.sampleRate * 0.7), audioContext.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
          const data = reverbBuffer.getChannelData(ch);
          for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.32) * 0.6;
          }
        }
        const reverbConvolver = audioContext.createConvolver();
        const reverbGain = audioContext.createGain();
        reverbConvolver.buffer = reverbBuffer;
        reverbGain.gain.value = 0.08;
        
        // First wah pulse
        const wah1Tri = audioContext.createOscillator();
        const wah1Saw = audioContext.createOscillator();
        const wah1MixT = audioContext.createGain();
        const wah1MixS = audioContext.createGain();
        const wah1Gain = audioContext.createGain();
        const wah1LP = audioContext.createBiquadFilter();
        const wah1BP = audioContext.createBiquadFilter();
        const wah1Pan = audioContext.createStereoPanner();
        const wah1LFO = audioContext.createOscillator();
        const wah1LFOGain = audioContext.createGain();
        
        wah1Tri.type = 'triangle';
        wah1Saw.type = 'sawtooth';
        wah1LFO.type = 'sine';
        wah1LP.type = 'lowpass';
        wah1BP.type = 'bandpass';
        
        wah1MixT.gain.value = 0.75;
        wah1MixS.gain.value = 0.25 * 0.92; // softness
        wah1LFO.frequency.value = 4.2;
        wah1LFOGain.gain.value = 220 * 0.0036; // vibrato depth
        wah1LP.Q.value = 1.18; // 0.7 + 0.6*softness
        wah1BP.Q.value = 3.4; // 1.8 + 2.0*softness
        wah1Pan.pan.value = -0.05;
        
        const sadBaseFreq = 220; // A3
        const sadEndFreq = sadBaseFreq * 0.67; // fallRatio with softness
        
        wah1Tri.frequency.setValueAtTime(sadBaseFreq, sadTime);
        wah1Saw.frequency.setValueAtTime(sadBaseFreq, sadTime);
        wah1Tri.frequency.exponentialRampToValueAtTime(sadEndFreq, sadTime + 0.42);
        wah1Saw.frequency.exponentialRampToValueAtTime(sadEndFreq, sadTime + 0.42);
        
        wah1LP.frequency.setValueAtTime(1440, sadTime); // lpStart
        wah1LP.frequency.exponentialRampToValueAtTime(660, sadTime + 0.42); // lpEnd
        wah1BP.frequency.setValueAtTime(1140, sadTime); // bpStart
        wah1BP.frequency.exponentialRampToValueAtTime(370, sadTime + 0.42); // bpEnd
        
        wah1Gain.gain.setValueAtTime(0, sadTime);
        wah1Gain.gain.exponentialRampToValueAtTime(0.42, sadTime + 0.01);
        wah1Gain.gain.exponentialRampToValueAtTime(0.28, sadTime + 0.11);
        wah1Gain.gain.exponentialRampToValueAtTime(0.001, sadTime + 0.56);
        
        wah1LFO.connect(wah1LFOGain);
        wah1LFOGain.connect(wah1Tri.frequency);
        wah1LFOGain.connect(wah1Saw.frequency);
        wah1Tri.connect(wah1MixT);
        wah1Saw.connect(wah1MixS);
        wah1MixT.connect(wah1Gain);
        wah1MixS.connect(wah1Gain);
        wah1Gain.connect(wah1LP);
        wah1LP.connect(wah1BP);
        wah1BP.connect(wah1Pan);
        wah1Pan.connect(audioContext.destination);
        
        wah1Tri.start(sadTime);
        wah1Saw.start(sadTime);
        wah1LFO.start(sadTime);
        wah1Tri.stop(sadTime + 0.62);
        wah1Saw.stop(sadTime + 0.62);
        wah1LFO.stop(sadTime + 0.62);
        
        // Second wah pulse (lower and quieter)
        const wah2Tri = audioContext.createOscillator();
        const wah2Saw = audioContext.createOscillator();
        const wah2MixT = audioContext.createGain();
        const wah2MixS = audioContext.createGain();
        const wah2Gain = audioContext.createGain();
        const wah2LP = audioContext.createBiquadFilter();
        const wah2BP = audioContext.createBiquadFilter();
        const wah2Pan = audioContext.createStereoPanner();
        const wah2LFO = audioContext.createOscillator();
        const wah2LFOGain = audioContext.createGain();
        
        wah2Tri.type = 'triangle';
        wah2Saw.type = 'sawtooth';
        wah2LFO.type = 'sine';
        wah2LP.type = 'lowpass';
        wah2BP.type = 'bandpass';
        
        wah2MixT.gain.value = 0.75;
        wah2MixS.gain.value = 0.25 * 0.92;
        wah2LFO.frequency.value = 4.2;
        wah2LFOGain.gain.value = 187 * 0.0036; // baseFreq * 0.85
        wah2LP.Q.value = 1.18;
        wah2BP.Q.value = 3.4;
        wah2Pan.pan.value = 0.05;
        
        const sadBaseFreq2 = 187; // sadBaseFreq * 0.85
        const sadEndFreq2 = sadBaseFreq2 * 0.63; // fallRatio with softness
        
        wah2Tri.frequency.setValueAtTime(sadBaseFreq2, sadTime + 0.22);
        wah2Saw.frequency.setValueAtTime(sadBaseFreq2, sadTime + 0.22);
        wah2Tri.frequency.exponentialRampToValueAtTime(sadEndFreq2, sadTime + 0.7);
        wah2Saw.frequency.exponentialRampToValueAtTime(sadEndFreq2, sadTime + 0.7);
        
        wah2LP.frequency.setValueAtTime(1440, sadTime + 0.22);
        wah2LP.frequency.exponentialRampToValueAtTime(660, sadTime + 0.7);
        wah2BP.frequency.setValueAtTime(1140, sadTime + 0.22);
        wah2BP.frequency.exponentialRampToValueAtTime(370, sadTime + 0.7);
        
        wah2Gain.gain.setValueAtTime(0, sadTime + 0.22);
        wah2Gain.gain.exponentialRampToValueAtTime(0.36, sadTime + 0.23);
        wah2Gain.gain.exponentialRampToValueAtTime(0.28, sadTime + 0.33);
        wah2Gain.gain.exponentialRampToValueAtTime(0.001, sadTime + 0.84);
        
        wah2LFO.connect(wah2LFOGain);
        wah2LFOGain.connect(wah2Tri.frequency);
        wah2LFOGain.connect(wah2Saw.frequency);
        wah2Tri.connect(wah2MixT);
        wah2Saw.connect(wah2MixS);
        wah2MixT.connect(wah2Gain);
        wah2MixS.connect(wah2Gain);
        wah2Gain.connect(wah2LP);
        wah2LP.connect(wah2BP);
        wah2BP.connect(wah2Pan);
        wah2Pan.connect(audioContext.destination);
        
        wah2Tri.start(sadTime + 0.22);
        wah2Saw.start(sadTime + 0.22);
        wah2LFO.start(sadTime + 0.22);
        wah2Tri.stop(sadTime + 0.9);
        wah2Saw.stop(sadTime + 0.9);
        wah2LFO.stop(sadTime + 0.9);
        break;
        
      case 'wrong':
        // Wrong answer sound
        const oscillator3 = audioContext.createOscillator();
        const gainNode3 = audioContext.createGain();
        
        oscillator3.connect(gainNode3);
        gainNode3.connect(audioContext.destination);
        
        oscillator3.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator3.frequency.linearRampToValueAtTime(150, audioContext.currentTime + 0.2);
        oscillator3.type = 'square';
        
        gainNode3.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode3.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.01);
        gainNode3.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
        
        oscillator3.start(audioContext.currentTime);
        oscillator3.stop(audioContext.currentTime + 0.2);
        break;
        
      case 'ding':
        // Simple ding (keeping original)
        const oscillator4 = audioContext.createOscillator();
        const gainNode4 = audioContext.createGain();
        
        oscillator4.connect(gainNode4);
        gainNode4.connect(audioContext.destination);
        
        oscillator4.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator4.type = 'sine';
        
        gainNode4.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode4.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
        gainNode4.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
        
        oscillator4.start(audioContext.currentTime);
        oscillator4.stop(audioContext.currentTime + 0.2);
        break;
        
      case 'duolingo':
        // Duolingo-style celebration (simplified version)
        const duolingoTime = audioContext.currentTime;
        const root = 72; // C5 MIDI
        
        // Main bell arpeggio
        const notes = [
          { time: duolingoTime, midi: root, gain: 0.6 },
          { time: duolingoTime + 0.12, midi: root + 4, gain: 0.55 },
          { time: duolingoTime + 0.24, midi: root + 7, gain: 0.5 },
          { time: duolingoTime + 0.36, midi: root + 12, gain: 0.65 }
        ];
        
        notes.forEach(note => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(440 * Math.pow(2, (note.midi - 69) / 12), audioContext.currentTime);
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(note.gain * 0.1, audioContext.currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);
          
          oscillator.start(note.time);
          oscillator.stop(note.time + 0.4);
        });
        
        // Whoosh effect
        const whooshOsc = audioContext.createOscillator();
        const whooshGain = audioContext.createGain();
        const whooshFilter = audioContext.createBiquadFilter();
        
        whooshOsc.connect(whooshGain);
        whooshGain.connect(whooshFilter);
        whooshFilter.connect(audioContext.destination);
        
        whooshOsc.type = 'sawtooth';
        whooshOsc.frequency.setValueAtTime(240, duolingoTime);
        whooshOsc.frequency.exponentialRampToValueAtTime(880, duolingoTime + 0.35);
        
        whooshFilter.type = 'bandpass';
        whooshFilter.frequency.setValueAtTime(500, duolingoTime);
        whooshFilter.frequency.exponentialRampToValueAtTime(1400, duolingoTime + 0.35);
        whooshFilter.Q.value = 6;
        
        whooshGain.gain.setValueAtTime(0, duolingoTime);
        whooshGain.gain.linearRampToValueAtTime(0.15, duolingoTime + 0.01);
        whooshGain.gain.exponentialRampToValueAtTime(0.001, duolingoTime + 0.35);
        
        whooshOsc.start(duolingoTime);
        whooshOsc.stop(duolingoTime + 0.35);
        break;
    }
  };

  const handleAnswerSelect = useCallback((answerIndex) => {
    // Reset feedback when selecting a new answer
    setShowFeedback(false);
    setSelectedAnswer(answerIndex);
    setShowKeyboardHint(false); // Hide keyboard hint after first interaction
    const correct = quizQuestions[currentQuestion].choices[answerIndex].correct === true;
    setIsCorrect(correct);
    
    // Show feedback after a brief delay to allow animation
    setTimeout(() => {
    setShowFeedback(true);
    }, 50);
    
    if (correct) {
      setCanContinue(true);
      playGameSound('duolingo'); // Try: 'coin', 'powerup', 'levelup', 'ding', 'duolingo'
    } else {
      playGameSound('sad_trombone'); // Try: 'error', 'wrong', 'duolingo_wrong', 'cartoon_fail', 'sad_trombone'
    }
  }, [currentQuestion]);

  const handleCloseFeedback = useCallback(() => {
    setShowFeedback(false);
  }, []);

  const handleContinue = useCallback(() => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCorrect(false);
      setCanContinue(false);
      setShowKeyboardHint(false); // Keep hint hidden for subsequent questions
    } else {
      // Quiz completed - show transition animation first
      setShowTransitionAnimation(true);
      setCanContinue(false);
    }
  }, [currentQuestion]);

  // Handle keyboard input for quiz
  useEffect(() => {
    if (!showQuiz) return;

    const handleKeyPress = (e) => {
      const key = e.key.toLowerCase();
      if (['a', 'b', 'c', 'd'].includes(key)) {
        const answerIndex = key.charCodeAt(0) - 97; // Convert a,b,c,d to 0,1,2,3
        handleAnswerSelect(answerIndex);
      } else if (key === 'enter' && canContinue) {
        handleContinue();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showQuiz, canContinue, handleAnswerSelect, handleContinue]);

  // Show Calendly or Products after transition animation based on feature flag
  useEffect(() => {
    if (showTransitionAnimation) {
      const timer = setTimeout(() => {
        setShowTransitionAnimation(false);
        if (featureFlags.showCalendlyAfterQuiz) {
          setShowCalendly(true);
        } else {
          setShowProducts(true);
        }
      }, 3000); // Show animation for 3 seconds

      return () => clearTimeout(timer);
    }
  }, [showTransitionAnimation]);

  // Load Calendly script when widget is shown
  useEffect(() => {
    if (showCalendly) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.head.appendChild(script);

      return () => {
        // Cleanup script when component unmounts or Calendly is hidden
        const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
      };
    }
  }, [showCalendly]);

  // Handle profile image tilt on hover
  const handleProfileMouseMove = (e) => {
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Calculate distance from center
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;
    
    // Convert to rotation angles (subtle: max 15 degrees)
    const rotateY = (deltaX / (rect.width / 2)) * 15;
    const rotateX = -(deltaY / (rect.height / 2)) * 15;
    
    setProfileTilt({ rotateX, rotateY });
  };

  const handleProfileMouseLeave = () => {
    setProfileTilt({ rotateX: 0, rotateY: 0 });
  };

  return (
    <FirstLoadAnimation>
      <style jsx>{`
        @keyframes flash {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: 0.2; }
        }
      `}</style>
      <div className="min-h-screen flex flex-col">
      {/* Header with Profile Image */}
      <header className="w-full bg-white">
        <div className="flex justify-center px-6 pt-32 pb-6">
          <div className="flex items-start max-w-2xl w-full">
            <img 
              src="/profile.jpg" 
              alt="Matt Digel"
              className="w-28 h-28 rounded-3xl object-cover cursor-pointer"
              onMouseMove={handleProfileMouseMove}
              onMouseLeave={handleProfileMouseLeave}
              style={{
                transform: `perspective(1000px) rotateX(${profileTilt.rotateX}deg) rotateY(${profileTilt.rotateY}deg)`,
                transition: 'transform 0.2s ease-out'
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start px-6 pb-20">
        <div className="flex flex-col items-start max-w-2xl w-full">
          {!showQuiz ? (
            <>
              {/* Heading */}
              <h1 className="text-sm font-normal mb-4 tracking-tight">
                hi, I&apos;m Matt Digel
              </h1>
              
              {/* Subheading */}
              <p className="text-sm text-foreground mb-12 leading-relaxed">
                i build things on the internet for my W2 & for fun
              </p>

            
                
                {/* CTA Button */}
                <div className="relative inline-block group">
                  {/* Rainbow gradient background */}
                  <div 
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: 'linear-gradient(135deg, rgba(128, 0, 255, 0.4), rgba(0, 128, 255, 0.4), rgba(0, 255, 255, 0.4), rgba(0, 255, 128, 0.4), rgba(200, 255, 0, 0.4))',
                      filter: 'blur(20px)',
                      transform: 'scale(1.1)',
                      zIndex: -1,
                      opacity: 0.6
                    }}
                  />
                  <button 
                    onClick={() => setShowQuiz(true)}
                    className="relative px-8 py-3 border border-border rounded-lg text-foreground text-sm font-normal hover:bg-gray-50 hover:-translate-y-0.5 transition-all bg-white flex items-center gap-2 cursor-pointer"
                  >
                    <span>What You&apos;re Looking For</span>
                    <span className="relative inline-block w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1">
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 16 16" 
                        fill="none"
                      >
                        {/* Horizontal line that grows from the chevron on hover */}
                        <line
                          x1="3"
                          y1="8"
                          x2="9"
                          y2="8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          className="transition-all duration-300 ease-out scale-x-0 group-hover:scale-x-100"
                          style={{ transformOrigin: '9px 8px' }}
                        />
                        {/* Chevron head - always visible */}
                        <path 
                          d="M9 4L13 8L9 12" 
                          stroke="currentColor" 
                          strokeWidth="1.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>
                </div>
              </>
            ) : showTransitionAnimation ? (
            <>
              {/* Transition Animation */}
              <div className="w-full flex items-center justify-center" style={{ minHeight: '400px' }}>
                <div style={{ width: '300px', height: '300px' }}>
                  <DotLottieReact
                    src="/gift-morph.json"
                    loop={false}
                    autoplay
                  />
                </div>
              </div>
            </>
            ) : showCalendly ? (
            <>
              {/* Calendly Widget */}
              <div className="w-full">
                <h2 className="text-sm font-normal mb-6 leading-relaxed">
                  Thanks for playing! Let&apos;s chat.
                </h2>
                <div 
                  className="calendly-inline-widget rounded-lg overflow-hidden border border-gray-200" 
                  data-url="https://calendly.com/digel-matt/30min" 
                  style={{minWidth: '320px', height: '500px'}}
                />
              </div>
            </>
            ) : showProducts ? (
            <>
              {/* Products Section After Quiz */}
              <div className="w-full">
                <h2 className="text-sm font-normal mb-6 leading-relaxed">
                  Thanks for playing! Check out what I&apos;m building.
                </h2>
                
                {/* Products List */}
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 group">
                    <span className="text-gray-400 text-sm mt-0.5">•</span>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a 
                          href="https://howmuchhousecaniafford.ai" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-foreground hover:text-gray-600 transition-colors underline decoration-gray-300 hover:decoration-gray-500 underline-offset-2 inline-flex items-center gap-1"
                        >
                          How Much House Can I Afford.ai
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            className="inline-block"
                          >
                            <path
                              d="M3 9L9 3M9 3H4.5M9 3V7.5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </a>
                      </div>
                      <p className="text-sm text-gray-500">
                        An affordability calculator with an AI Assistant
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <span className="text-gray-400 text-sm mt-0.5">•</span>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-foreground">SwipeCardz</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-blue-600 bg-blue-100 border border-blue-200">
                          In Progress
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Simple flash card iOS app that integrates with Google Sheets
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 group">
                    <span className="text-gray-400 text-sm mt-0.5">•</span>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-foreground">ZaVault</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-blue-600 bg-blue-100 border border-blue-200">
                          In Progress
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Simple photo vault iOS app without a subscription fee
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </>
            ) : (
            <>
              {/* Quiz Content */}
              {/* Progress Bar */}
              <div className="w-full mb-2">
                <div className="flex justify-between text-xs text-gray-500 mb-0">
                  <span>question {currentQuestion + 1} of {quizQuestions.length}</span>
                </div>
                <div className="flex items-center gap-3" style={{ alignItems: 'center' }}>
                  <div className="relative flex-1 flex items-center">
                    <div className="bg-gray-200 rounded-full h-1 w-full">
                      <div 
                        className="h-1 rounded-full transition-all duration-300 ease-in-out"
                        style={{ 
                          width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%`,
                          background: 'linear-gradient(90deg, rgba(0, 128, 255, 0.8), rgba(0, 255, 255, 0.8), rgba(0, 255, 128, 0.8))'
                        }}
                      />
                    </div>
                  </div>
                  {/* Gift animation positioned at the end */}
                  <div 
                    className="flex items-center justify-center flex-shrink-0"
                    style={{ 
                      width: '48px',
                      height: '48px',
                      imageRendering: '-webkit-optimize-contrast'
                    }}
                  >
                    <DotLottieReact
                      src="/gift-animation.json"
                      loop
                      autoplay
                      speed={1}
                      style={{ 
                        width: '100%', 
                        height: '100%',
                        imageRendering: '-webkit-optimize-contrast',
                        transform: 'translateZ(0)',
                        backfaceVisibility: 'hidden',
                        WebkitFontSmoothing: 'antialiased'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Question */}
              <h2 className="text-sm font-normal mb-4 leading-relaxed">
                {quizQuestions[currentQuestion].question}
              </h2>

              {/* Answer Options */}
              <div className="space-y-3 mb-8 w-full">
                {quizQuestions[currentQuestion].choices.map((choice, index) => {
                  const letter = choice.option.toLowerCase();
                  const isSelected = selectedAnswer === index;
                  const isCorrectAnswer = choice.correct === true;
                  
                  let borderColor = 'border-gray-200';
                  let bgColor = 'bg-white';
                  
                  if (showFeedback && isSelected) {
                    if (isCorrect) {
                      borderColor = 'border-green-400';
                      bgColor = 'bg-green-50';
                    } else {
                      borderColor = 'border-red-400';
                      bgColor = 'bg-red-50';
                    }
                  }

                  return (
                    <div key={index}>
                      <div
                        className={`px-4 py-3 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 ${borderColor} ${bgColor} ${
                          isSelected ? 'animate-bounce' : ''
                        }`}
                        onClick={() => handleAnswerSelect(index)}
                        style={{
                          animation: isSelected ? 'flash 0.3s ease-in-out' : 'none'
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xs font-medium text-gray-400 w-6 pt-0.5">
                            {letter.toUpperCase()}
                          </span>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm">{choice.text}</span>
                            {choice.url && (
                              <span className="text-xs text-gray-400">{choice.url}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Show explanation directly under selected answer */}
                      {showFeedback && isSelected && (
                        <div className={`relative mt-3 px-4 py-3 ${!isCorrect ? 'pr-10' : ''} rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                          {!isCorrect && (
                            <button
                              onClick={handleCloseFeedback}
                              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                              aria-label="Close explanation"
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M4 4L12 12M12 4L4 12" />
                              </svg>
                            </button>
                          )}
                          <p className="text-sm text-foreground mb-3">
                            {choice.explanation}
                          </p>
                          {isCorrect && canContinue && (
                            <div className="flex items-center gap-2 text-xs text-gray-600 pt-2 border-t border-green-200">
                              <span>press</span>
                              <span className="font-medium">Enter</span>
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path 
                                  d="M10 3V8H3M3 8L5 6M3 8L5 10" 
                                  stroke="currentColor" 
                                  strokeWidth="1.5" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Keyboard hint - only show on desktop and first question */}
              {showKeyboardHint && currentQuestion === 0 && (
                <div className="mb-6 text-xs text-gray-500 flex items-center gap-2">
                  <span>💡</span>
                  <span>Tip: Use A, B, C, or D keys to select answers</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 w-full">
                {canContinue && (
                  <div className="relative inline-block group">
                    {/* Rainbow gradient background */}
                    <div 
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: 'linear-gradient(135deg, rgba(128, 0, 255, 0.4), rgba(0, 128, 255, 0.4), rgba(0, 255, 255, 0.4), rgba(0, 255, 128, 0.4), rgba(200, 255, 0, 0.4))',
                        filter: 'blur(20px)',
                        transform: 'scale(1.1)',
                        zIndex: -1,
                        opacity: 0.6
                      }}
                    />
                    <button
                      onClick={handleContinue}
                      className="relative px-6 py-2 border border-border rounded-lg text-foreground text-sm font-normal hover:bg-gray-50 hover:-translate-y-0.5 transition-all bg-white flex items-center gap-2 cursor-pointer"
                    >
                      <span>{currentQuestion < quizQuestions.length - 1 ? 'continue' : 'finish'}</span>
                      <span className="relative inline-block w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1">
                        <svg 
                          width="16" 
                          height="16" 
                          viewBox="0 0 16 16" 
                          fill="none"
                        >
                          <line
                            x1="3"
                            y1="8"
                            x2="9"
                            y2="8"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            className="transition-all duration-300 ease-out scale-x-0 group-hover:scale-x-100"
                            style={{ transformOrigin: '9px 8px' }}
                          />
                          <path 
                            d="M9 4L13 8L9 12" 
                            stroke="currentColor" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>
                  </div>
                )}
                
                {/* Enter key hint */}
                {canContinue && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>press</span>
                    <span className="font-medium">Enter</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path 
                        d="M10 3V8H3M3 8L5 6M3 8L5 10" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 h-[50px] flex items-center justify-center px-6 z-10 bg-[#F8F9FA]" style={{ backgroundColor: '#F8F9FA' }}>
        <div className="flex items-center justify-between text-[11px] w-full max-w-2xl">
          <p style={{ color: '#4A4A4A' }}>there is no spoon</p>
          <div className="flex items-center gap-2">
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="none"
              style={{ color: '#4A4A4A' }}
            >
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1"/>
              <path d="M8 4v4l3 2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
            </svg>
            <span style={{ color: '#4A4A4A' }}>{nycTime || '00:00:00'}</span>
            <span className="text-[9px]" style={{ color: '#AFB6BF' }}>Always building. Today in NYC</span>
          </div>
        </div>
      </footer>
      </div>
    </FirstLoadAnimation>
  );
}
