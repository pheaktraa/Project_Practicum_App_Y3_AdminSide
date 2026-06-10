import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Deliveries from '../pages/Deliveries';
import UserManagement from '../pages/UserManagement';
import Sidebar from '../components/Sidebar';

interface RootRouterProps {
  isAuthenticated: boolean;
}

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex' }}>
    <Sidebar />
    <main style={{ flex: 1, overflow: 'auto' }}>
      {children}
    </main>
  </div>
);

const RootRouter = ({ isAuthenticated }: RootRouterProps) => {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route 
        path="/login" 
        element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
      />

      {/* PROTECTED ROUTES (Only for logged in Admins) */}
      <Route 
        path="/" 
        element={isAuthenticated ? <ProtectedLayout><Dashboard /></ProtectedLayout> : <Navigate to="/login" />} 
      />
      
      <Route 
        path="/dashboard" 
        element={isAuthenticated ? <ProtectedLayout><Dashboard /></ProtectedLayout> : <Navigate to="/login" />} 
      />

      <Route 
        path="/deliveries" 
        element={isAuthenticated ? <ProtectedLayout><Deliveries /></ProtectedLayout> : <Navigate to="/login" />} 
      />

      {/* Add more routes here as you build them */}
      <Route 
        path="/users" 
        element={isAuthenticated ? <ProtectedLayout><UserManagement /></ProtectedLayout> : <Navigate to="/login" />} 
      />

      {/* DEFAULT REDIRECT */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
    </Routes>
  );
};

export default RootRouter;