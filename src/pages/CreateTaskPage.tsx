import React from 'react';
import { useNavigate } from 'react-router-dom';

export const CreateTaskPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '20px' }}>
      <h2>Create New Task</h2>
      <p>Task creation form will be implemented here.</p>
      <button onClick={() => navigate('/')}>Back to Dashboard</button>
    </div>
  );
};
