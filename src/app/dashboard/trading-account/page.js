'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardTradingAccount() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const tradingData = {
    accountBalance: 0.00,
    totalPnl: 0.00,
    totalTrades: 0,
    winRate: 0,
    openPositions: 0,
    closedPositions: 0,
    trades: []
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1">Trading Account</h2>
              <p className="text-muted mb-0">Monitor your trading performance and manage positions</p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-primary">
                <i className="bi bi-plus-circle me-2"></i>
                New Trade
              </button>
              <button className="btn btn-outline-primary">
                <i className="bi bi-graph-up me-2"></i>
                View Charts
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trading Overview Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-wallet2 text-primary fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Account Balance</h6>
                  <h4 className="fw-bold mb-0">₹{tradingData.accountBalance.toFixed(2)}</h4>
                  <small className="text-success">+₹0.00 today</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-success bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-graph-up text-success fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Total P&L</h6>
                  <h4 className={`fw-bold mb-0 ${tradingData.totalPnl >= 0 ? 'text-success' : 'text-danger'}`}>
                    {tradingData.totalPnl >= 0 ? '+' : ''}₹{tradingData.totalPnl.toFixed(2)}
                  </h4>
                  <small className="text-muted">All time</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-info bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-bar-chart text-info fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Total Trades</h6>
                  <h4 className="fw-bold mb-0">{tradingData.totalTrades}</h4>
                  <small className="text-muted">{tradingData.winRate}% win rate</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-clock text-warning fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Open Positions</h6>
                  <h4 className="fw-bold mb-0">{tradingData.openPositions}</h4>
                  <small className="text-muted">Active trades</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <ul className="nav nav-tabs card-header-tabs" id="tradingTabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    Overview
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'positions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('positions')}
                  >
                    Positions
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                  >
                    Trade History
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                  >
                    Analytics
                  </button>
                </li>
              </ul>
            </div>
            <div className="card-body">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="row">
                  <div className="col-lg-8">
                    <h5 className="mb-3">Performance Chart</h5>
                    <div className="bg-light rounded p-5 text-center">
                      <i className="bi bi-graph-up text-muted" style={{ fontSize: '4rem' }}></i>
                      <p className="text-muted mt-3">Performance chart will be displayed here</p>
                      <p className="text-muted small">Start trading to see your performance metrics</p>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <h5 className="mb-3">Quick Stats</h5>
                    <div className="row g-3">
                      <div className="col-6">
                        <div className="card bg-light">
                          <div className="card-body text-center">
                            <h6 className="text-muted mb-1">Win Rate</h6>
                            <h4 className="fw-bold text-success">{tradingData.winRate}%</h4>
                          </div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="card bg-light">
                          <div className="card-body text-center">
                            <h6 className="text-muted mb-1">Avg Trade</h6>
                            <h4 className="fw-bold">₹0.00</h4>
                          </div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="card bg-light">
                          <div className="card-body text-center">
                            <h6 className="text-muted mb-1">Best Trade</h6>
                            <h4 className="fw-bold text-success">₹0.00</h4>
                          </div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="card bg-light">
                          <div className="card-body text-center">
                            <h6 className="text-muted mb-1">Worst Trade</h6>
                            <h4 className="fw-bold text-danger">₹0.00</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Positions Tab */}
              {activeTab === 'positions' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Open Positions</h5>
                    <button className="btn btn-primary btn-sm">
                      <i className="bi bi-plus-circle me-1"></i>
                      New Position
                    </button>
                  </div>
                  
                  <div className="text-center py-5">
                    <i className="bi bi-clock text-muted" style={{ fontSize: '3rem' }}></i>
                    <p className="text-muted mt-3">No open positions</p>
                    <p className="text-muted small">Your active trades will appear here</p>
                    <button className="btn btn-primary">Start Trading</button>
                  </div>
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Trade History</h5>
                    <div className="d-flex gap-2">
                      <select className="form-select form-select-sm" style={{ width: 'auto' }}>
                        <option>All Trades</option>
                        <option>Winning Trades</option>
                        <option>Losing Trades</option>
                      </select>
                      <button className="btn btn-outline-secondary btn-sm">
                        <i className="bi bi-download me-1"></i>
                        Export
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center py-5">
                    <i className="bi bi-receipt text-muted" style={{ fontSize: '3rem' }}></i>
                    <p className="text-muted mt-3">No trade history</p>
                    <p className="text-muted small">Your completed trades will appear here</p>
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="row">
                  <div className="col-lg-8">
                    <h5 className="mb-3">Trading Analytics</h5>
                    <div className="bg-light rounded p-5 text-center">
                      <i className="bi bi-bar-chart text-muted" style={{ fontSize: '4rem' }}></i>
                      <p className="text-muted mt-3">Advanced analytics will be displayed here</p>
                      <p className="text-muted small">Start trading to see detailed analytics</p>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <h5 className="mb-3">Risk Metrics</h5>
                    <div className="card bg-light mb-3">
                      <div className="card-body">
                        <h6 className="text-muted mb-2">Sharpe Ratio</h6>
                        <h4 className="fw-bold">0.00</h4>
                        <small className="text-muted">Risk-adjusted returns</small>
                      </div>
                    </div>
                    <div className="card bg-light mb-3">
                      <div className="card-body">
                        <h6 className="text-muted mb-2">Max Drawdown</h6>
                        <h4 className="fw-bold text-danger">0.00%</h4>
                        <small className="text-muted">Largest peak-to-trough decline</small>
                      </div>
                    </div>
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="text-muted mb-2">Profit Factor</h6>
                        <h4 className="fw-bold">0.00</h4>
                        <small className="text-muted">Gross profit / Gross loss</small>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
