// src/hooks/useAuth.js
// Chú thích: Hook quản lý auth state với React context pattern
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, setCurrentUser, logout as logoutApi, getMe, syncLocalDataToServer } from '../utils/api';
import { recordActivity } from '../utils/streakService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Load user từ localStorage on mount
    useEffect(() => {
        const savedUser = getCurrentUser();
        if (savedUser) {
            setUser(savedUser);
            // Ghi nhận streak khi user đã login trước đó và quay lại app
            recordActivity('session_resume');
            // Verify với server (optional, có thể bỏ nếu không cần)
            // eslint-disable-next-line react-hooks/exhaustive-deps
            getMe().then(data => {
                if (data.user) {
                    setUser(data.user);
                    setCurrentUser(data.user);
                }
            }).catch(() => {
                // Token invalid, clear
                logoutApi();
                setUser(null);
            });
        }
        setLoading(false);
    }, []);

    const login = useCallback((userData) => {
        setUser(userData);
        setCurrentUser(userData);
        setShowAuthModal(false);
        // Ghi nhận streak khi login thành công
        recordActivity('login');

        // Auto sync local data sau khi login
        syncLocalDataToServer().then(result => {
            if (result.synced) {
                console.log('[Auth] Synced local data:', result.imported);
            }
        });
    }, []);

    const logout = useCallback(() => {
        logoutApi();
        setUser(null);
    }, []);

    const openAuthModal = useCallback(() => {
        setShowAuthModal(true);
    }, []);

    const closeAuthModal = useCallback(() => {
        setShowAuthModal(false);
    }, []);

    const value = {
        user,
        isLoggedIn: !!user,
        loading,
        login,
        logout,
        showAuthModal,
        openAuthModal,
        closeAuthModal,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

export default useAuth;
