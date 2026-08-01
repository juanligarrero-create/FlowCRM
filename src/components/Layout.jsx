import "./Layout.css";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />

      <div className="layout__workspace">
        <Topbar />

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;