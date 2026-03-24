import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UserRole } from '../types/auth';
import type { AppDispatch, RootState } from '../store';
import { bulkUpdateTasks, bulkDeleteTasks, bulkAssignTasks } from '../store/slices/tasksSlice';
import './BulkActionBar.css';

interface BulkActionBarProps {
  selectedIds: number[];
  onClear: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({ selectedIds, onClear }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, items: tasks } = useSelector((state: RootState) => state.tasks);
  const currentUser = useSelector((state: RootState) => state.auth.user);

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
    dispatch(bulkUpdateTasks({ ids: idsToUpdate, data: { status: status as any } }));
    onClear();
  };

  const handleBulkPriority = (priority: string) => {
    const idsToUpdate = getAuthorizedIds();
    if (idsToUpdate.length === 0 && isManager) {
      alert('You can only update tasks you created.');
      return;
    }
    dispatch(bulkUpdateTasks({ ids: idsToUpdate, data: { priority: priority as any } }));
    onClear();
  };

  const handleBulkAssign = (userId: number) => {
    const idsToUpdate = getAuthorizedIds();
    if (idsToUpdate.length === 0 && isManager) {
      alert('You can only assign tasks you created.');
      return;
    }
    dispatch(bulkAssignTasks({ ids: idsToUpdate, userIds: [userId] }));
    onClear();
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
      <div className="selection-info">
        <span className="count">{selectedIds.length}</span> tasks selected
      </div>
      
      <div className="action-groups">
        <div className="action-group">
          <label>Status:</label>
          <select onChange={(e) => handleBulkStatus(e.target.value)} value="">
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
              <select onChange={(e) => handleBulkPriority(e.target.value)} value="">
                <option value="" disabled>Change Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div className="action-group">
              <label>Assignee:</label>
              <select onChange={(e) => handleBulkAssign(parseInt(e.target.value))} value="">
                <option value="" disabled>Assign To</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username || (user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email)}
                  </option>
                ))}
              </select>
            </div>

            <button className="btn-bulk-delete" onClick={handleBulkDelete}>Delete All</button>
          </>
        )}
        <button className="btn-clear" onClick={onClear}>Cancel</button>
      </div>
    </div>
  );
};
