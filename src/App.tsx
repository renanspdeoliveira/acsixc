import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  return (
    <Router>
      <div className="relative min-h-screen w-full bg-brand-blue text-white overflow-hidden">
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700/20 via-transparent to-transparent"></div>
        
        {/* Decorative blurred circle */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          <main className="w-full flex-grow flex items-center justify-center">
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </main>
          <footer className="w-full text-center py-4">
            <p className="text-xs text-gray-400">
              © 2025 FuturaNet • Todos os direitos reservados
            </p>
          </footer>
        </div>
      </div>
    </Router>
  );
}

export default App;