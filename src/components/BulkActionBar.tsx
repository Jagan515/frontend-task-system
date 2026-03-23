import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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

  const isUser = currentUser?.role === 'user';
  const isManager = currentUser?.role === 'manager';

  const authorizedIds = isManager
    ? selectedIds.filter(id => tasks.find(t => t.id === id)?.createdBy === currentUser?.id)
    : (currentUser?.role === 'admin' ? selectedIds : []);

  
  const unauthorizedCount = selectedIds.length - authorizedIds.length;
  const hasAuthorizedTasks = authorizedIds.length > 0;

  const handleBulkStatus = async (status: string) => {
    if (!hasAuthorizedTasks) return;
    setLocalError(null);
    try {
      await dispatch(bulkUpdateTasks({ ids: authorizedIds, data: { status: status as any } })).unwrap();
      onClear();
    } catch (err) {
      setLocalError(extractErrorMessage(err));
    }
  };

  const handleBulkPriority = async (priority: string) => {
    if (!hasAuthorizedTasks) return;
    setLocalError(null);
    try {
      await dispatch(bulkUpdateTasks({ ids: authorizedIds, data: { priority: priority as any } })).unwrap();
      onClear();
    } catch (err) {
      setLocalError(extractErrorMessage(err));
    }
  };

  const handleBulkAssign = async (userId: number) => {
    if (!hasAuthorizedTasks) return;
    setLocalError(null);
    try {
      await dispatch(bulkAssignTasks({ ids: authorizedIds, userIds: [userId] })).unwrap();
      onClear();
    } catch (err) {
      setLocalError(extractErrorMessage(err));
    }
  };

  const handleBulkDelete = async () => {
    if (!hasAuthorizedTasks) return;
    if (window.confirm(`Are you sure you want to delete ${authorizedIds.length} tasks?`)) {
      setLocalError(null);
      try {
        await dispatch(bulkDeleteTasks(authorizedIds)).unwrap();
        onClear();
      } catch (err) {
        setLocalError(extractErrorMessage(err));
      }
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
                    {user.firstName} {user.lastName}
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
