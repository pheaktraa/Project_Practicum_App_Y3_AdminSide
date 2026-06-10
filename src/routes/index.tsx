import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
// Import future pages here
// import UserManagement from '../pages/UserManagement';

interface RootRouterProps {
  isAuthenticated: boolean;
}

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
        path="/dashboard" 
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
      />

      {/* Add more routes here as you build them */}
      {/* <Route path="/users" element={isAuthenticated ? <UserManagement /> : <Navigate to="/login" />} /> */}

      {/* DEFAULT REDIRECT */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
    </Routes>
  );
};

export default RootRouter;