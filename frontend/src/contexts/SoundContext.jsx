// src/contexts/SoundContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const SOUND_URLS = {
    // UI Sounds (Short, clean sounds)
    click: 'https://actions.google.com/sounds/v1/cartoon/pop.ogg',
    hover: 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg',
    success: 'https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg',
    pop: 'https://actions.google.com/sounds/v1/cartoon/pop.ogg',
    switch: 'https://actions.google.com/sounds/v1/tools/switch_click.ogg',
    error: 'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg',
    notification: 'https://actions.google.com/sounds/v1/cartoon/cartoon_cowbell.ogg',

    // Interactions
    drop: 'https://actions.google.com/sounds/v1/water/air_woosh_underwater.ogg',
    pageFlip: 'https://actions.google.com/sounds/v1/foley/paper_shuffle.ogg',
    win: 'https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg',
    lose: 'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg',

    // Ambient (Loopable preferred)
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
