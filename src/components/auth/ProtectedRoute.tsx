import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';
import { LoadingSpinner } from '../shared';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, fetchUser, loading } = useAuthStore();
    const [checking, setChecking] = React.useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await fetchUser();
            } catch {
                // User not authenticated
            } finally {
                setChecking(false);
            }
        };

        checkAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // fetchUser is stable from zustand store

    if (checking || loading) {
        return (
            <div className="min-h-screen bg-ios-bg flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

