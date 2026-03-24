import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { UserRole } from '../types/auth';
import type { RootState } from '../store';
import { Modal } from './common/Modal';
import api from '../api/axios';
import './UserModal.css';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: UserRole.USER as string
  });

  // Ensure role is set correctly when modal opens based on current user's permissions
  useEffect(() => {
    if (isOpen && currentUser) {
      if (currentUser.role === UserRole.MANAGER) {
        setFormData(prev => ({ ...prev, role: UserRole.USER }));
      } else if (currentUser.role === UserRole.ADMIN) {
        setFormData(prev => ({ ...prev, role: UserRole.MANAGER }));
      }
    }
  }, [isOpen, currentUser]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Filter out empty optional fields to prevent backend validation issues
    const payload: any = {
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };
    if (formData.firstName) payload.firstName = formData.firstName;
    if (formData.lastName) payload.lastName = formData.lastName;

    try {
      await api.post('/users', payload);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: currentUser?.role === UserRole.MANAGER ? UserRole.USER : UserRole.MANAGER
      });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalFooter = (
    <>
      <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
      <button 
        type="submit" 
        form="user-form"
        className="btn-save" 
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating...' : 'Add Member'}
      </button>
    </>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Add New Member"
      footer={modalFooter}
    >
      {error && <div className="error-banner" style={{ marginBottom: '20px' }}>{error}</div>}

      <form id="user-form" onSubmit={handleSubmit} className="task-form" style={{ padding: 0 }}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input 
            id="email"
            type="email"
            required
            className="form-input"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            placeholder="member@company.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Temporary Password</label>
          <input 
            id="password"
            type="text"
            required
            className="form-input"
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
            placeholder="Assign a temporary password"
          />
          <p style={{ fontSize: '11px', color: 'var(--text)', opacity: 0.6, marginTop: '4px' }}>
            User will be notified via email and prompted to change this on login.
          </p>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input 
              id="firstName"
              className="form-input"
              value={formData.firstName}
              onChange={e => setFormData({...formData, firstName: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input 
              id="lastName"
              className="form-input"
              value={formData.lastName}
              onChange={e => setFormData({...formData, lastName: e.target.value})}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="role">System Role</label>
          <select 
            id="role"
            className="form-input"
            value={formData.role}
            onChange={e => setFormData({...formData, role: e.target.value})}
            disabled={currentUser?.role === UserRole.MANAGER}
          >
            {currentUser?.role === UserRole.ADMIN ? (
              <>
                <option value={UserRole.MANAGER}>Manager</option>
                <option value={UserRole.USER}>Standard User</option>
              </>
            ) : (
              <option value={UserRole.USER}>Standard User</option>
            )}
          </select>
          <p style={{ fontSize: '11px', color: 'var(--text)', opacity: 0.6, marginTop: '4px' }}>
            {currentUser?.role === UserRole.MANAGER 
              ? 'Managers can only create standard users.' 
              : 'Administrators manage the organizational hierarchy.'}
          </p>
        </div>
      </form>
    </Modal>
  );
};

