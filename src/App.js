import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import DashboardHome from './components/common/DashboardHome';
import InvoiceModule from './components/invoice/InvoiceModule';
import LetterPadModule from './components/letterpad/LetterPadModule';
import ChallanModule from './components/challan/ChallanModule';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/variables.css';
import './styles/modules.css';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path="invoice" element={<InvoiceModule />} />
          <Route path="letterpad" element={<LetterPadModule />} />
          <Route path="challan" element={<ChallanModule />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;