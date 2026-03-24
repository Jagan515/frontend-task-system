import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState, type AppDispatch } from '../store';
import { fetchAuditLogs } from '../store/slices/tasksSlice';
import { extractErrorMessage } from '../api/axios';
import './AuditLogPage.css';

// SVG Icons
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

export const AuditLogPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { history: logs, status, users } = useSelector((state: RootState) => state.tasks);
  const [error, setError] = useState<string | null>(null);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');

  useEffect(() => {
    const promise = dispatch(fetchAuditLogs());
    
    const loadLogs = async () => {
      try {
        await promise.unwrap();
      } catch (err) {
        setError(extractErrorMessage(err));
      }
    };

    loadLogs();

    return () => {
      promise.abort();
    };
  }, [dispatch]);

  const getUserName = useCallback((userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? (user.username || (user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email)) : `User ${userId}`;
  }, [users]);

  const getActionStyles = (action: string) => {
    if (action.includes('CREATE')) return { bg: '#05966920', color: '#059669' };
    if (action.includes('DELETE')) return { bg: '#dc262620', color: '#dc2626' };
    if (action.includes('UPDATE') || action.includes('PATCH')) return { bg: '#2563eb20', color: '#2563eb' };
    if (action.includes('LOGIN') || action.includes('SIGNUP')) return { bg: '#7c3aed20', color: '#7c3aed' };
    return { bg: '#4b556320', color: '#4b5563' };
  };

  const filteredLogs = useMemo(() => {
    return [...logs]
      .filter(log => {
        const matchesSearch = 
          log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) || 
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getUserName(log.performedBy).toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesAction = actionFilter === 'ALL' || log.action.includes(actionFilter);
        const matchesEntity = entityFilter === 'ALL' || log.entityType === entityFilter;

        return matchesSearch && matchesAction && matchesEntity;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [logs, searchTerm, actionFilter, entityFilter, getUserName]);

  const entities = useMemo(() => Array.from(new Set(logs.map(l => l.entityType))), [logs]);

  return (
    <div className="audit-page-container">
      <header className="audit-header">
        <h1>System Audit Logs</h1>
        <p>Monitor system activities and track changes across the application</p>
      </header>

      {error && (
        <div className="error-banner" style={{ margin: '0 0 24px 0' }}>
          {error}
        </div>
      )}

      <div className="audit-filters">
        <div className="search-wrapper" style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
            <SearchIcon />
          </span>
          <input 
            type="text" 
            placeholder="Search logs by action, user, or entity..." 
            className="search-input"
            style={{ width: '100%', paddingLeft: '40px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          className="filter-select"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        >
          <option value="ALL">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="BULK">Bulk Actions</option>
        </select>

        <select 
          className="filter-select"
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
        >
          <option value="ALL">All Entities</option>
          {entities.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      <div className="audit-card">
        <div className="audit-table-wrapper">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Entity</th>
                <th>Performed By</th>
                <th>Date & Time</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {status === 'loading' && logs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '80px 0', textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                    <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Fetching audit records...</p>
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map(log => {
                  const styles = getActionStyles(log.action);
                  return (
                    <tr key={log.id}>
                      <td>
                        <span className="action-badge" style={{ background: styles.bg, color: styles.color }}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        <div className="entity-info">
                          <span className="entity-type">{log.entityType}</span>
                          <span className="entity-id">ID: {log.entityId}</span>
                        </div>
                      </td>
                      <td>
                        <span className="performed-by">{getUserName(log.performedBy)}</span>
                      </td>
                      <td>
                        <div className="timestamp">
                          <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                          <div style={{ fontSize: '11px', opacity: 0.8 }}>{new Date(log.createdAt).toLocaleTimeString()}</div>
                        </div>
                      </td>
                      <td className="details-cell">
                        {log.details && Object.keys(log.details).length > 0 ? (
                          <div className="details-preview">
                            {Object.entries(log.details).slice(0, 2).map(([key, val]) => (
                              <div key={key} className="detail-item">
                                <span className="detail-key">{key}:</span> {
                                  typeof val === 'object' && val !== null 
                                    ? ((val as Record<string, unknown>).new !== undefined ? String((val as Record<string, unknown>).new) : JSON.stringify(val))
                                    : String(val)
                                }
                              </div>
                            ))}
                            {Object.keys(log.details).length > 2 && (
                              <span className="more-changes">
                                +{Object.keys(log.details).length - 2} more changes
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No details</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '80px 0', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-h)' }}>No records found</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Try adjusting your filters or search terms.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
