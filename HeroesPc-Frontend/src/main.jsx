import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
    },
  },
});

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const hasValidGoogleId =
  googleClientId && !googleClientId.startsWith('TU_CLIENT_ID');

const AppTree = (
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {hasValidGoogleId ? (
      <GoogleOAuthProvider clientId={googleClientId}>
        {AppTree}
      </GoogleOAuthProvider>
    ) : (
      AppTree
    )}
  </React.StrictMode>
);