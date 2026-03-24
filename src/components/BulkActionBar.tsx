import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UserRole } from '../types/auth';
import type { AppDispatch, RootState } from '../store';
import { bulkUpdateTasks, bulkDeleteTasks, bulkAssignTasks } from '../store/slices/tasksSlice';
import { extractErrorMessage } from '../api/axios';
import './BulkActionBar.css';

interface BulkActionBarProps {
  selectedIds: number[];
  onClear: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({ selectedIds, onClear }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, items: tasks } = useSelector((state: RootState) => state.tasks);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [localError, setLocalError] = useState<string | null>(null);

  if (selectedIds.length === 0) return null;
  const isUser = currentUser?.role === UserRole.USER;
  const isManager = currentUser?.role === UserRole.MANAGER;

  const getAuthorizedIds = () => {
    if (currentUser?.role === UserRole.ADMIN) return selectedIds;
    if (isManager) {
      return selectedIds.filter(id => {
        const task = tasks.find(t => t.id === id);
        return task?.createdBy === currentUser.id;
      });
    }
    return selectedIds; // USER check handled per task in backend
  };

  const handleBulkStatus = (status: string) => {
    const idsToUpdate = getAuthorizedIds();
    if (idsToUpdate.length === 0 && isManager) {
      alert('You can only update tasks you created.');
      return;

    }
  };
  const handleBulkPriority = (priority: string) => {
    const idsToUpdate = getAuthorizedIds();
    if (idsToUpdate.length === 0 && isManager) {
      alert('You can only update tasks you created.');
      return;

    }
  };

  const handleBulkAssign = (userId: number) => {
    const idsToUpdate = getAuthorizedIds();
    if (idsToUpdate.length === 0 && isManager) {
      alert('You can only assign tasks you created.');
      return;

    }
  };


  const handleBulkDelete = () => {
    const idsToDelete = getAuthorizedIds();
    if (idsToDelete.length === 0 && isManager) {
      alert('You can only delete tasks you created.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${idsToDelete.length} tasks?`)) {
      dispatch(bulkDeleteTasks(idsToDelete));
      onClear();

    }
  };

  return (
    <div className="bulk-action-bar">
      {localError && <div className="error-banner" style={{ position: 'absolute', top: '-60px', width: '100%', left: 0 }}>{localError}</div>}
      <div className="selection-info" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div><span className="count">{selectedIds.length}</span> tasks selected</div>
        {isManager && unauthorizedCount > 0 && (
          <div style={{ fontSize: '11px', color: '#6b7280' }}>
            ({authorizedIds.length} editable by you, {unauthorizedCount} read-only)
          </div>
        )}
      </div>
      
      <div className="action-groups">
        <div className="action-group">
          <label>Status:</label>
          <select 
            onChange={(e) => handleBulkStatus(e.target.value)} 
            value="" 
            disabled={!hasAuthorizedTasks}
          >
            <option value="" disabled>Change Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {!isUser && (
          <>
            <div className="action-group">
              <label>Priority:</label>
              <select 
                onChange={(e) => handleBulkPriority(e.target.value)} 
                value="" 
                disabled={!hasAuthorizedTasks}
              >
                <option value="" disabled>Change Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div className="action-group">
              <label>Assignee:</label>
              <select 
                onChange={(e) => handleBulkAssign(parseInt(e.target.value))} 
                value="" 
                disabled={!hasAuthorizedTasks}
              >
                <option value="" disabled>Assign To</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username || (user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email)}
                  </option>
                ))}
              </select>
            </div>

            <button 
              className="btn-bulk-delete" 
              onClick={handleBulkDelete}
              disabled={!hasAuthorizedTasks}
            >
              Delete Selected
            </button>
          </>
        )}
        <button className="btn-clear" onClick={onClear}>Cancel</button>
      </div>
    </div>
  );
};
