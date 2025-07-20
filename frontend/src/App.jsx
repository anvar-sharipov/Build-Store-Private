import {
  BrowserRouter as Router,

} from "react-router-dom";

import AppShell from "./AppShell.jsx";

// text-xs sm:text-sm md:text-base
function App() {
  return (
    <div className="flex flex-col min-h-screen p-4 text-sm sm:text-base md:text-lg text-gray-800 bg-gray-900 dark:text-gray-100 print:p-0">
      <Router>
        <AppShell />
      </Router>
    </div>
  );
}

export default App;
