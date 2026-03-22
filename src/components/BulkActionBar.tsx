import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { bulkUpdateTasks, bulkDeleteTasks, bulkAssignTasks } from '../store/slices/tasksSlice';
import './BulkActionBar.css';

interface BulkActionBarProps {
  selectedIds: number[];
  onClear: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({ selectedIds, onClear }) => {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector((state: RootState) => state.tasks.users);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  if (selectedIds.length === 0) return null;

  const isConsumer = currentUser?.role === 'CONSUMER';

  const handleBulkStatus = (status: string) => {
    dispatch(bulkUpdateTasks({ ids: selectedIds, data: { status: status as any } }));
    onClear();
  };

  const handleBulkPriority = (priority: string) => {
    dispatch(bulkUpdateTasks({ ids: selectedIds, data: { priority: priority as any } }));
    onClear();
  };

  const handleBulkAssign = (userId: number) => {
    dispatch(bulkAssignTasks({ ids: selectedIds, userIds: [userId] }));
    onClear();
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} tasks?`)) {
      dispatch(bulkDeleteTasks(selectedIds));
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

        {!isConsumer && (
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
                    {user.firstName} {user.lastName}
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
