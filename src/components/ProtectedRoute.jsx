import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated()) {
        console.log('ProtectedRoute: User not authenticated, redirecting to /login');
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && !isAdmin()) {
        console.log('ProtectedRoute: User not admin, redirecting to /');
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
