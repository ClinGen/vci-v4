import { Routes, Route, NavLink } from 'react-router-dom';
import logo from './assets/ClinGen_NavbarLogo_White.svg';
import Home from './pages/Home';
import VariantSearch from './pages/VariantSearch';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-sky-600 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="ClinGen" className="h-8" />
        </div>
        <nav className="flex gap-2">
          <NavLink to="/" className={({ isActive }) =>
            isActive ? "bg-white text-sky-700 px-4 py-2 rounded font-medium" : "text-white px-4 py-2 font-medium hover:bg-sky-800 rounded"
          }>Home</NavLink>
          <NavLink to="/variant" className={({ isActive }) =>
            isActive ? "bg-white text-sky-700 px-4 py-2 rounded font-medium" : "text-white px-4 py-2 font-medium hover:bg-sky-800 rounded"
          }>Variant Search</NavLink>
        </nav>
      </header>
      {/* Routes */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/variant" element={<VariantSearch />} />
        </Routes>
      </main>
      {/* Footer */}
      <footer className="text-sm text-center text-gray-500 py-3 border-t bg-white">
        © {new Date().getFullYear()} <a className="text-blue-600 hover:underline" href="https://clinicalgenome.org" target="_blank">ClinGen</a> – All rights reserved
      </footer>
    </div>
  );
}

export default App;
