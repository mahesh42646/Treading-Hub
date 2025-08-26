'use client';

import React from 'react';
import { AdminAuthProvider } from '../contexts/AdminAuthContext';
import AdminLayout from './layout';

const AdminWrapper = ({ children }) => {
  return (
    <AdminAuthProvider>
      <AdminLayout>
        {children}
      </AdminLayout>
    </AdminAuthProvider>
  );
};

export default AdminWrapper;
