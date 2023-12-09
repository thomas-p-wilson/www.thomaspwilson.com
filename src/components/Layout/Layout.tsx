import { Outlet } from 'react-router-dom';
import { Masthead } from '../Masthead/Masthead';
import { Suspense } from 'react';

export const Layout = () => (
  <>
    <Masthead />
    <main>
      <Suspense fallback={<div>Loading...</div>}>
        <Outlet />
      </Suspense>
    </main>
  </>
)
