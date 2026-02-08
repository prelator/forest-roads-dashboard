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

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './index.css'

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
