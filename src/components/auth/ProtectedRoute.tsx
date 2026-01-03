import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../../lib/store';
import { LoadingSpinner } from '../shared';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, fetchUser, loading } = useStore();
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
    }, [fetchUser]);

    if (checking || loading.auth) {
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

