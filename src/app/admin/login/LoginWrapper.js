'use client';

import React from 'react';
import { AdminAuthProvider } from '../../contexts/AdminAuthContext';

const LoginWrapper = ({ children }) => {
  return (
    <AdminAuthProvider>
      {children}
    </AdminAuthProvider>
  );
};

export default LoginWrapper;
