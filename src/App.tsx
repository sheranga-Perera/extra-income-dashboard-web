import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import NavBar from './components/NavBar';
import Login from './pages/Login';
import Register from './pages/Register';
import AdsAdmin from './pages/AdsAdmin';
import AdminUsers from './pages/AdminUsers';
import DashboardConfig from './pages/DashboardConfig';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: (
        <div className="app-shell">
          <NavBar />
          <AdsAdmin />
          <footer className="footer">Extra Income Dashboard</footer>
        </div>
      )
    },
    {
      path: '/login',
      element: (
        <div className="app-shell">
          <NavBar />
          <Login />
          <footer className="footer">Extra Income Dashboard</footer>
        </div>
      )
    },
    {
      path: '/admins',
      element: (
        <div className="app-shell">
          <NavBar />
          <AdminUsers />
          <footer className="footer">Extra Income Dashboard</footer>
        </div>
      )
    },
    {
      path: '/config',
      element: (
        <div className="app-shell">
          <NavBar />
          <DashboardConfig />
          <footer className="footer">Extra Income Dashboard</footer>
        </div>
      )
    },
    {
      path: '/register',
      element: (
        <div className="app-shell">
          <NavBar />
          <Register />
          <footer className="footer">Extra Income Dashboard</footer>
        </div>
      )
    }
  ]
);

export default function App() {
  return <RouterProvider router={router} />;
}
