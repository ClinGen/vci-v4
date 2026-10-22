import { Routes, Route, NavLink } from 'react-router-dom';
import logo from './assets/ClinGen_NavbarLogo_White.svg';
import Home from './pages/Home';
import VariantSearch from './pages/VariantSearch';
import VariantCentral from './pages/VariantCentral';
import { TabProvider } from './contexts/TabProvider';

function App() {
  return (
    <TabProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-sky-600 px-5 py-2 flex items-center justify-between flex-none">
          <div className="flex items-center gap-3">
            <img src={logo} alt="ClinGen" className="h-7" />
          </div>
          <nav className="flex gap-1.5">
            <NavLink to="/" className={({ isActive }) =>
              isActive
                ? "bg-white text-sky-700 px-3 py-1.5 rounded text-sm font-medium"
                : "text-white px-3 py-1.5 text-sm font-medium hover:bg-sky-700 rounded"
            }>Home</NavLink>
            <NavLink to="/variant" className={({ isActive }) =>
              isActive
                ? "bg-white text-sky-700 px-3 py-1.5 rounded text-sm font-medium"
                : "text-white px-3 py-1.5 text-sm font-medium hover:bg-sky-700 rounded"
            }>Variant Search</NavLink>
          </nav>
        </header>
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/variant" element={<VariantSearch />} />
            <Route path="/classification" element={<VariantCentral />} />
          </Routes>
        </main>
      </div>
    </TabProvider>
  );
}

export default App;
