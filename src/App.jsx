import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AuctionList from './pages/AuctionList';
import AuctionRoom from './pages/AuctionRoom';
import AdminDashboard from './pages/AdminDashboard';
import CreateAuction from './pages/CreateAuction';
import BiddersManagement from './pages/BiddersManagement';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes with MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auctions" element={<AuctionList />} />
          <Route path="/auction/:id" element={<AuctionRoom />} />
        </Route>

        {/* Protected Routes */}
        <Route
          path="/create-auction"
          element={
            <ProtectedRoute requireAdmin={true}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CreateAuction />} />
        </Route>

        {/* Admin Routes with AdminLayout */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="auctions" element={<AdminDashboard />} />
          <Route path="bidders/:auctionId" element={<BiddersManagement />} />
          <Route path="bidders" element={<div className="p-8"><h2 className="text-2xl font-black">Bidders Management</h2><p className="text-slate-500">Feature coming soon.</p></div>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
