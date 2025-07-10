import {
  BrowserRouter as Router,

} from "react-router-dom";

import AppShell from "./AppShell.jsx";


function App() {
  return (
    <div className="flex flex-col min-h-screen p-4 text-xs sm:text-sm md:text-base print:min-h-0 text-gray-800 bg-gray-900 dark:text-gray-100">
      <Router>
        <AppShell />
      </Router>
    </div>
  );
}

export default App;
