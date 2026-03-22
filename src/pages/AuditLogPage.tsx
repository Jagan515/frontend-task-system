import React from 'react';
import { useNavigate } from 'react-router-dom';

export const AuditLogPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '20px' }}>
      <h2>System Audit Logs</h2>
      <p>Audit log history will be displayed here for Power Users.</p>
      <button onClick={() => navigate('/')}>Back to Dashboard</button>
    </div>
  );
};
