// src/contexts/SoundContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const SOUND_URLS = {
    click: 'https://assets.mixkit.co/sfx/preview/mixkit-modern-click-box-check-1120.mp3',
    hover: 'https://assets.mixkit.co/sfx/preview/mixkit-simple-game-countdown-921.mp3', // Just a short blip
    success: 'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3',
    pop: 'https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3',
    switch: 'https://assets.mixkit.co/sfx/preview/mixkit-on-off-light-switch-tap-2585.mp3',
    error: 'https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3',
    notification: 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3',
    // Interactions
    drop: 'https://assets.mixkit.co/sfx/preview/mixkit-quick-jump-arcade-game-239.mp3', // Fun drop sound
    pageFlip: 'https://assets.mixkit.co/sfx/preview/mixkit-paper-slide-1530.mp3',
    win: 'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3',
    lose: 'https://assets.mixkit.co/sfx/preview/mixkit-retro-arcade-game-over-470.mp3',
    // Ambient
    nature: 'https://actions.google.com/sounds/v1/nature/forest_wind.ogg',
    rain: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
};

const SoundContext = createContext();

export function SoundProvider({ children }) {
    const [sfxEnabled, setSfxEnabled] = useState(true);
    const [bgmEnabled, setBgmEnabled] = useState(false); // Default off for BGM
    const [volume, setVolume] = useState(0.5);

    const audioCache = useRef({});
    const bgmRef = useRef(null);

    // Load settings
    useEffect(() => {
        try {
            const savedSfx = localStorage.getItem('sound_sfx');
            const savedBgm = localStorage.getItem('sound_bgm');
            const savedVol = localStorage.getItem('sound_volume');
            if (savedSfx !== null) setSfxEnabled(JSON.parse(savedSfx));
            if (savedBgm !== null) setBgmEnabled(JSON.parse(savedBgm));
            if (savedVol !== null) setVolume(parseFloat(savedVol));
        } catch (_) { }
    }, []);

    // Save settings
    useEffect(() => {
        localStorage.setItem('sound_sfx', JSON.stringify(sfxEnabled));
        localStorage.setItem('sound_bgm', JSON.stringify(bgmEnabled));
        localStorage.setItem('sound_volume', volume);

        // Update BGM volume if playing
        if (bgmRef.current) {
            bgmRef.current.volume = volume * 0.5; // BGM usually quieter
            if (!bgmEnabled) bgmRef.current.pause();
            else if (bgmRef.current.paused && bgmEnabled) bgmRef.current.play().catch(() => { });
        }
    }, [sfxEnabled, bgmEnabled, volume]);

    const playSound = useCallback((type) => {
        if (!sfxEnabled) return;

        const url = SOUND_URLS[type];
        if (!url) return;

        // Use simple Audio object
        const audio = new Audio(url);
        audio.volume = volume;
        audio.play().catch(err => console.debug('Sound play failed', err));
    }, [sfxEnabled, volume]);

    const playBgm = useCallback((type) => {
        if (bgmRef.current) {
            bgmRef.current.pause();
            bgmRef.current = null;
        }

        if (!type || !SOUND_URLS[type]) return;

        const audio = new Audio(SOUND_URLS[type]);
        audio.loop = true;
        audio.volume = volume * 0.5;
        bgmRef.current = audio;

        if (bgmEnabled) {
            audio.play().catch(e => console.debug('BGM play failed', e));
        }
    }, [bgmEnabled, volume]);

    const stopBgm = useCallback(() => {
        if (bgmRef.current) {
            bgmRef.current.pause();
            bgmRef.current = null;
        }
    }, []);

    return (
        <SoundContext.Provider value={{
            sfxEnabled, setSfxEnabled,
            bgmEnabled, setBgmEnabled,
            volume, setVolume,
            playSound, playBgm, stopBgm
        }}>
            {children}
        </SoundContext.Provider>
    );
}

export function useSound() {
    return useContext(SoundContext);
}
