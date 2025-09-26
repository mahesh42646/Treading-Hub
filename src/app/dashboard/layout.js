'use client';

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import RouteGuard from '../components/RouteGuard';
import Sidebar from '../user/components/Sidebar';
import DashboardHeader from '../user/components/DashboardHeader';

export default function DashboardLayout({ children }) {
  const { user } = useAuth();

  return (
    <RouteGuard requireAuth={true} requireProfile={false}>
      <div className="d-flex" style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #110A28 0%, #002260 100%)'
      }}>
        <Sidebar />
        
        <div className="flex-grow-1 d-flex flex-column main-content">
          <DashboardHeader />
          
          <main className="flex-grow-1" style={{
            background: 'linear-gradient(135deg, #110A28 0%, #002260 100%)',
            color: 'white'
          }}>
            <div className="container-fluid p-0 p-lg-4">
              <div className="row">
                <div className="col-12">
                  {children}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}
