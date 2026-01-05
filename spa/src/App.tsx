import { Outlet, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import DamageWizard from "./pages/DamageWizard";
import BookingWizard from "./pages/BookingWizard";
import About from "./pages/About";
import Layout from "./components/Layout";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <Outlet />
          </Layout>
        }
      >
        <Route index element={<Home />} />
        <Route path="damage-report" element={<DamageWizard />} />
        <Route path="truck-rental" element={<BookingWizard />} />
        <Route path="about" element={<About />} />
        <Route path="admin" element={<Admin />} />
        <Route path="admin/login" element={<AdminLogin />} />
      </Route>
    </Routes>
  );
}

export default App;
