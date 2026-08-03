import { useEffect, useState } from "react";
import "./Layout.css";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function Layout({ children }) {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("flowcrm-theme");

    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }

    return "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    localStorage.setItem("flowcrm-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "light" ? "dark" : "light"
    );
  };

  return (
    <div className="layout">
      <Sidebar />

      <div className="layout__workspace">
        <Topbar
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;