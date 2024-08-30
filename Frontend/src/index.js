import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Route, RouterProvider, createBrowserRouter,createRoutesFromElements} from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import ProposedPage from './components/ProposedPage';
import DetailsPage from './components/DetailsPage';
import EDADashboard from './components/EDAComponent';
import { FileProvider } from './context/FileContext'; 


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="/home" element={<Home />} />
      <Route path ="/details" element={<DetailsPage/>}/>"
      <Route path="/proposed" element={<ProposedPage />} />
      <Route path="/proposed/eda-dashboard" element={<EDADashboard />} />
      <Route path="/proposed/home" element={<Home />} />
    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <FileProvider>  {/* Wrap the Router with FileProvider */}
      <RouterProvider router={router} />
    </FileProvider>
  </React.StrictMode>
);