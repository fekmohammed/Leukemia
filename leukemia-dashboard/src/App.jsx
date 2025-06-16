import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
  useNavigate,
} from "react-router-dom";
import useUser from "@/hooks/useUser";
import Dashboard from "./component/home.jsx";
import Patients from "./component/patients.jsx";
import Profile from "./component/profile.jsx";
import Detection from "./component/detection.jsx";
import NotFound from "./component/notfound.jsx";
import ViewProfile from "./component/viewprofile.jsx";
import AddPatient from "./component/AddPatient.jsx";
import SignIn from "./Authentification/sign-in.jsx";
import SignUp from "./Authentification/sign-up.jsx";
import ForgetPassword from "./Authentification/forget-password.jsx";
import { Home, Users, Microscope, Settings, LogOut } from "lucide-react";

import "./App.css";

const NavLink = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center gap-3 hover:text-primary font-medium px-3 py-2 rounded-md hover:bg-[#F7F7F7] transition-all duration-500"
  >
    {icon}
    <span>{label}</span>
  </Link>
);


const Sidebar = ({ setAuthenticated }) => {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    setAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("token");
    navigate("/auth");
  };

  if (loading) {
    return <div className="w-64 p-6">Loading...</div>;
  }

  const baseURL = "http://localhost:8000";
  const logoUrl = user?.organization_logo
    ? user.organization_logo.startsWith("http")
      ? user.organization_logo
      : `${baseURL}${user.organization_logo}`
    : "/profile.jpg";


  return (
    <aside className="w-64 bg-white shadow-xl p-6 flex flex-col justify-between fixed h-full">
      <div>
        <div className="text-xl font-bold text-primary mb-10">
          <span className="text-gray-500">Leukemia</span> Detection
        </div>
        <nav className="flex flex-col gap-4">
          <NavLink to="/" icon={<Home className="w-5 h-5" />} label="Dashboard" />
          <NavLink to="/patients" icon={<Users className="w-5 h-5" />} label="Patients" />
          <NavLink to="/detect" icon={<Microscope className="w-5 h-5" />} label="Detection" />
          <div className="pt-10 mt-10">
            <NavLink to="/settings" icon={<Settings className="w-5 h-5" />} label="Settings" />
          </div>
        </nav>
      </div>
      <div className="pt-4 mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={logoUrl} // fallback if no logo
            alt="Organization Logo"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="text-sm">
            <p className="font-medium text-gray-800 text-center capitalize">{user.username}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
        <button title="Logout" onClick={handleLogout} className="hover:text-red-600">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};

const Layout = ({ setAuthenticated }) => (
  <div className="flex h-screen overflow-hidden">
    <Sidebar setAuthenticated={setAuthenticated} />
    <main className="ml-64 flex-1 p-8 overflow-y-auto h-screen bg-[#F7F7F7]">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/detect" element={<Detection />} />
        <Route path="/detect/:id?" element={<Detection />} />
        <Route path="/add" element={<AddPatient />} />
        <Route path="/edit/:id" element={<ViewProfile />} />
        <Route path="/patients/:id/profile" element={<ViewProfile />} />
        <Route path="*" element={<NotFound />} />

      </Routes>
    </main>
  </div>
);

// ✅ This is now inside the Router
const AppRoutes = ({ isAuthenticated, setAuthenticated }) => {
  const location = useLocation();

  if (
    !isAuthenticated &&
    !["/auth", "/register", "/forgot-password"].includes(location.pathname)
  ) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Routes>
      <Route path="/auth" element={<SignIn setAuthenticated={setAuthenticated} />} />
      <Route path="/register" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgetPassword />} />
      <Route path="*" element={<Layout setAuthenticated={setAuthenticated} />} />
    </Routes>
  );
};

const App = () => {
  const [isAuthenticated, setAuthenticated] = useState(
    () => localStorage.getItem("isAuthenticated") === "true"
  );

  const handleSetAuthenticated = (value) => {
    setAuthenticated(value);
    localStorage.setItem("isAuthenticated", value);
  };

  return (
    <Router>
      <AppRoutes
        isAuthenticated={isAuthenticated}
        setAuthenticated={handleSetAuthenticated}
      />
    </Router>
  );
};

export default App;
