import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState, type AppDispatch } from '../store';
import { fetchUsers } from '../store/slices/tasksSlice';
import api, { extractErrorMessage } from '../api/axios';
import { UserRole, UserRoleLabels } from '../types/auth';
import './UsersPage.css';

// SVG Icons
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

export const UsersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, status } = useSelector((state: RootState) => state.tasks);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: UserRole.USER as UserRole,
  });

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (u.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (u.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post('/users', formData);
      setIsModalOpen(false);
      setFormData({ email: '', password: '', firstName: '', lastName: '', role: UserRole.USER });
      dispatch(fetchUsers());
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleUserActive = async (id: number, currentStatus: boolean) => {
    try {
      await api.patch(`/users/${id}`, { isActive: !currentStatus });
      dispatch(fetchUsers());
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div className="users-page-container">
      <header className="users-header">
        <h1>User Management</h1>
        <button className="primary-btn" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PlusIcon /> Add {currentUser?.role === UserRole.ADMIN ? 'Manager/User' : 'User'}
        </button>
      </header>

      {error && <div className="error-banner" style={{ marginBottom: '20px' }}>{error}</div>}

      <div className="filters-bar" style={{ position: 'relative', marginBottom: '24px', border: 'none', top: 0, padding: 0 }}>
        <div className="search-wrapper" style={{ maxWidth: '400px' }}>
          <span className="search-icon"><SearchIcon /></span>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="users-card">
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {status === 'loading' && users.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>Loading users...</td></tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-h)' }}>
                          {u.username || (u.firstName ? `${u.firstName} ${u.lastName || ''}` : u.email.split('@')[0])}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {u.email} {u.firstName && `(${u.firstName} ${u.lastName || ''})`}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge role-${u.role}`}>
                        {UserRoleLabels[u.role]}
                      </span>
                    </td>
                    <td>
                      <div className="status-indicator">
                        <span className={`dot ${u.isActive !== false ? 'dot-active' : 'dot-inactive'}`}></span>
                        {u.isActive !== false ? 'Active' : 'Deactivated'}
                      </div>
                    </td>
                    <td>
                      <button 
                        onClick={() => toggleUserActive(u.id, u.isActive !== false)}
                        className="clear-link"
                        style={{ fontSize: '12px', color: u.isActive !== false ? '#dc2626' : '#059669' }}
                      >
                        {u.isActive !== false ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="user-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="user-modal" onClick={e => e.stopPropagation()}>
            <h2>Create New {currentUser?.role === UserRole.ADMIN ? 'Member' : 'User'}</h2>
            <form onSubmit={handleCreateUser} className="user-form">
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  required 
                  className="form-input"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="form-row" style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>First Name</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Temporary Password</label>
                <input 
                  type="password" 
                  required 
                  className="form-input"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select 
                  className="form-input"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                  disabled={currentUser?.role !== UserRole.ADMIN}
                >
                  <option value={UserRole.USER}>User</option>
                  {currentUser?.role === UserRole.ADMIN && <option value={UserRole.MANAGER}>Manager</option>}
                  {currentUser?.role === UserRole.ADMIN && <option value={UserRole.ADMIN}>Admin</option>}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn-cancel" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="primary-btn" style={{ flex: 1 }} disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
