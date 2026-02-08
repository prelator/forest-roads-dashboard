import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './layout';
import HomePage from './pages/home';
import DashboardPage from './pages/dashboard';
import ForestPage from './pages/forest';
import DistrictPage from './pages/district';

import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBhl6uL9iBhDghYteRvEPFGlYmYaRh95nE",
  authDomain: "forest-roads-dashboard.firebaseapp.com",
  projectId: "forest-roads-dashboard",
  storageBucket: "forest-roads-dashboard.firebasestorage.app",
  messagingSenderId: "1033417547355",
  appId: "1:1033417547355:web:b8a1e285b697080e02a97e",
  measurementId: "G-Y26MLDTYTN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

logEvent(analytics, 'page_view', {
  page_title: 'Forest Roads Dashboard',
  page_location: window.location.href,
  page_path: window.location.pathname,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      {index: true, Component: HomePage},
      {path: "/dashboard", Component: DashboardPage},
      {path: "/dashboard/:forestId", Component: ForestPage},
      {path: "/dashboard/:forestId/:districtId", Component: DistrictPage},
    ]
  },
]);

const root = document.getElementById('root');

createRoot(root!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
