import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard.jsx";
import Contacts from "./pages/Contacts.jsx";
import ContactDetails from "./pages/ContactDetails.jsx";
import Deals from "./pages/Deals.jsx";
import WhatsApp from "./pages/WhatsApp.jsx";
import Settings from "./pages/Settings.jsx";
import Analytics from "./pages/Analytics.jsx";
import Automations from "./pages/Automations.jsx";
import Campaigns from "./pages/Campaigns.jsx";
import Layout from "./components/Layout.jsx";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/contacts/:id" element={<ContactDetails />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/whatsapp" element={<WhatsApp />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/automations" element={<Automations />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;