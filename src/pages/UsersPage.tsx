import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchUsers } from '../store/slices/tasksSlice';
import { UserRole } from '../types/auth';
import { UserModal } from '../components/UserModal';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import api from '../api/axios';
import './UsersPage.css';

// SVG Icons
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const UserCheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <polyline points="17 11 19 13 23 9"></polyline>
  </svg>
);

const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export const UsersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users } = useSelector((state: RootState) => state.tasks);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleToggleActive = async (userId: number, currentStatus: boolean) => {
    try {
      await api.patch(`/users/${userId}`, { isActive: !currentStatus });
      dispatch(fetchUsers()); 
    } catch (err) {
      console.error('Failed to update user status:', err);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                          (u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                          (u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const canAddMember = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.MANAGER;

  return (
    <div className="users-page-container">
      <div className="users-header-row">
        <div>
          <h1>Team Management</h1>
          <p>Control user access levels and account status across the organization.</p>
        </div>
        {canAddMember && (
          <button className="btn-add-member" onClick={() => setIsModalOpen(true)}>
            <PlusIcon /> Add New Member
          </button>
        )}
      </div>

      <div className="users-filters-bar">
        <div className="search-wrapper">
          <span className="search-icon"><SearchIcon /></span>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search team members..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          className="filter-select" 
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="ALL">All Roles</option>
          {currentUser?.role === UserRole.ADMIN ? (
            <>
              <option value={UserRole.ADMIN}>Administrators</option>
              <option value={UserRole.MANAGER}>Managers</option>
              <option value={UserRole.USER}>Standard Users</option>
            </>
          ) : (
            <option value={UserRole.USER}>Standard Users</option>
          )}
        </select>
      </div>

      <div className="users-grid">
        {filteredUsers.map((u, index) => (
          <div key={u.id} className="user-card" style={{ animationDelay: `${index * 0.05}s` }}>
            <div className="user-card-header">
              <div className="user-avatar-wrapper">
                <div className="user-avatar">
                  {(u.firstName?.[0] || u.username?.[0] || u.email[0]).toUpperCase()}
                </div>
                <div className={`user-status-dot ${u.isActive !== false ? 'status-active' : 'status-inactive'}`} />
              </div>
              <div className="user-info-main">
                <h3>
                  {u.firstName ? `${u.firstName} ${u.lastName || ''}` : u.username || u.email.split('@')[0]}
                  {u.role === UserRole.ADMIN && <ShieldIcon />}
                </h3>
                <div className="user-username">@{u.username || u.email.split('@')[0]}</div>
              </div>
              <Badge label={u.role} type={u.role} variant="role" />
            </div>
            
            <div className="user-stats-list">
              <div className="user-stat-item">
                <MailIcon />
                <span>{u.email}</span>
              </div>
              <div className="user-stat-item">
                <UserCheckIcon />
                <span>{u.isActive !== false ? 'Active Account' : 'Deactivated'}</span>
              </div>
            </div>

            <div className="user-card-actions">
              {u.id !== currentUser?.id && currentUser?.role !== UserRole.USER ? (
                <>
                  <button className="btn-user-action">
                    <EditIcon /> Edit Profile
                  </button>
                  <button 
                    className={`btn-user-toggle ${u.isActive !== false ? 'btn-user-deactivate' : 'btn-user-activate'}`}
                    onClick={() => handleToggleActive(u.id, u.isActive !== false)}
                  >
                    {u.isActive !== false ? 'Deactivate' : 'Activate'}
                  </button>
                </>
              ) : u.id === currentUser?.id ? (
                <div className="current-user-tag">
                  <UserCheckIcon />
                  Current User
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <EmptyState 
          icon="👥" 
          title="No members found" 
          message="No team members match your current search or filters." 
        />
      )}

      <UserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => dispatch(fetchUsers())}
      />
    </div>
  );
};
