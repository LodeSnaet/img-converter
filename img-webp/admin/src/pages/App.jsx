import { Page } from '@strapi/strapi/admin';
import { Routes, Route } from 'react-router-dom';
import { Index } from "./Settings/Index";

import { HomePage } from './HomePage';

const App = () => {
  return (
    <Routes>
      <Route index element={<Index />} />
      <Route path="*" element={<Page.Error />} />
    </Routes>
  );
};

export { App };
