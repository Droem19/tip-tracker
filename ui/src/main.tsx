import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { HomePage } from './pages/home';
import { NotFoundPage } from './pages/not-found';

import './index.css';

const Page = window.location.pathname === '/' ? HomePage : NotFoundPage;

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
    <StrictMode>
        <Page />
    </StrictMode>
);
