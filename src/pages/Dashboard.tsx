import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { fetchTasks } from '../store/slices/tasksSlice';
import { logout } from '../store/slices/authSlice';
import { APP_ROUTES } from '../config/routes';

export const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: tasks, status, error } = useSelector((state: RootState) => state.tasks);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTasks());
    }
  }, [status, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  // Filter routes for navigation menu
  const navItems = APP_ROUTES.filter(route => 
    route.label && 
    route.isProtected && 
    (!route.permissions || (user && route.permissions.includes(user.role)))
  );

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
        <h2>Task Dashboard</h2>
        <nav style={{ display: 'flex', gap: '20px' }}>
          {navItems.map(item => (
            <Link key={item.path} to={item.path} style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div>
          <span style={{ marginRight: '15px' }}>{user?.email} <strong>({user?.role})</strong></span>
          <button onClick={handleLogout} style={{ padding: '5px 10px', cursor: 'pointer' }}>Logout</button>
        </div>
      </header>

      <div style={{ marginTop: '20px' }}>
        <h3>Tasks</h3>
        {status === 'loading' && <p>Loading tasks...</p>}
        {status === 'failed' && <p style={{ color: 'red' }}>{error}</p>}
        
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ background: '#f4f4f4', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Title</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Due Date</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Priority</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length > 0 ? tasks.map(task => (
              <tr key={task.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px' }}>{task.title}</td>
                <td style={{ padding: '12px' }}>{new Date(task.dueDate).toLocaleDateString()}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#e9ecef', fontSize: '12px' }}>
                    {task.status}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{task.priority}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No tasks found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
