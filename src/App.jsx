import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import AIWriter from "./pages/AIWriter.jsx";
import Analytics from "./pages/Analytics.jsx";
import Automations from "./pages/Automations.jsx";
import Campaigns from "./pages/Campaigns.jsx";
import Companies from "./pages/Companies.jsx";
import CompanyDetails from "./pages/CompanyDetails.jsx";
import ContactDetails from "./pages/ContactDetails.jsx";
import Contacts from "./pages/Contacts.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DealDetails from "./pages/DealDetails.jsx";
import Deals from "./pages/Deals.jsx";
import Settings from "./pages/Settings.jsx";
import Tasks from "./pages/Tasks.jsx";
import WhatsApp from "./pages/WhatsApp.jsx";

import Layout from "./components/Layout.jsx";
import { ToastProvider } from "./components/ToastProvider.jsx";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route
              path="/contacts"
              element={<Contacts />}
            />

            <Route
              path="/contacts/:id"
              element={<ContactDetails />}
            />

            <Route
              path="/companies"
              element={<Companies />}
            />

            <Route
              path="/companies/:id"
              element={<CompanyDetails />}
            />

            <Route
              path="/deals"
              element={<Deals />}
            />

            <Route
              path="/deals/:id"
              element={<DealDetails />}
            />

            <Route
              path="/tasks"
              element={<Tasks />}
            />

            <Route
              path="/whatsapp"
              element={<WhatsApp />}
            />

            <Route
              path="/campaigns"
              element={<Campaigns />}
            />

            <Route
              path="/automations"
              element={<Automations />}
            />

            <Route
              path="/analytics"
              element={<Analytics />}
            />

            <Route
              path="/ai-writer"
              element={<AIWriter />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />
          </Routes>
        </Layout>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;