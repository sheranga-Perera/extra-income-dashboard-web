import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import NavBar from './components/NavBar';
import Login from './pages/Login';
import Register from './pages/Register';
import AdsAdmin from './pages/AdsAdmin';

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
      path: '/register',
      element: (
        <div className="app-shell">
          <NavBar />
          <Register />
          <footer className="footer">Extra Income Dashboard</footer>
        </div>
      )
    }
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

export default function App() {
  return <RouterProvider router={router} />;
}
