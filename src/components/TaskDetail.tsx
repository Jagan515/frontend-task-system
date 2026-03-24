import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState, type AppDispatch } from '../store';
import { 
  selectTask, 
  fetchTaskDetails, 
  addTaskComment,
  updateTask,
  type Task
} from '../store/slices/tasksSlice';
import { extractErrorMessage } from '../api/axios';
import './TaskDetail.css';

export const TaskDetail: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedTaskId, items: tasks, comments, history, users } = useSelector((state: RootState) => state.tasks);
  
  const [commentText, setCommentText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Task>>({});
  const [prevTaskId, setPrevTaskId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Synchronize state when selectedTaskId changes
  if (selectedTaskId !== prevTaskId) {
    setPrevTaskId(selectedTaskId);
    setIsEditing(false);
    setError(null);
  }

  const task = tasks.find(t => t.id === selectedTaskId);

  useEffect(() => {
    let promise: { abort: () => void } | undefined;
    if (selectedTaskId) {
      promise = dispatch(fetchTaskDetails(selectedTaskId));
    }
    
    return () => {
      if (promise && promise.abort) {
        promise.abort();
      }
    };
  }, [selectedTaskId, dispatch]);

  if (!selectedTaskId || !task) return null;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setError(null);
    try {
      await dispatch(addTaskComment({ taskId: selectedTaskId, content: commentText })).unwrap();
      setCommentText('');
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const startEditing = () => {
    setEditData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
    });
    setIsEditing(true);
    setError(null);
  };

  const handleUpdate = async () => {
    setError(null);
    
    // Validation: Due date cannot be in the past
    if (editData.dueDate) {
      const dueDate = new Date(editData.dueDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      if (dueDate < now) {
        setError('Due date cannot be in the past.');
        return;
      }
    }

    try {
      await dispatch(updateTask({ id: task.id, data: editData })).unwrap();
      setIsEditing(false);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? (user.username || (user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email)) : `User ${userId}`;
  };

  return (
    <div className={`task-detail-overlay ${selectedTaskId ? 'open' : ''}`} onClick={() => dispatch(selectTask(null))}>
      <div className="task-detail-panel" onClick={e => e.stopPropagation()}>
        <header className="detail-header">
          <button className="close-btn" onClick={() => dispatch(selectTask(null))}>×</button>
          <div className="header-actions">
            {!isEditing ? (
              <button className="edit-btn" onClick={startEditing}>Edit Task</button>
            ) : (
              <>
                <button className="save-btn" onClick={handleUpdate}>Save</button>
                <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
              </>
            )}
          </div>
        </header>

        {error && <div className="error-banner" style={{ margin: '16px', borderRadius: '4px' }}>{error}</div>}

        <div className="detail-content">
          <section className="info-section">
            {!isEditing ? (
              <>
                <h2 className="detail-title">{task.title}</h2>
                <p className="detail-description">{task.description || 'No description provided.'}</p>
              </>
            ) : (
              <div className="edit-form">
                <div className="form-group">
                  <label>Title</label>
                  <input 
                    className="edit-input title-input"
                    value={editData.title || ''}
                    onChange={e => setEditData({...editData, title: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    className="edit-input desc-input"
                    value={editData.description || ''}
                    onChange={e => setEditData({...editData, description: e.target.value})}
                  />
                </div>
                <div className="form-row" style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Due Date</label>
                    <input 
                      type="date"
                      className="edit-input"
                      value={editData.dueDate ? new Date(editData.dueDate).toISOString().split('T')[0] : ''}
                      onChange={e => setEditData({...editData, dueDate: e.target.value})}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Status</label>
                    <select 
                      className="edit-input"
                      value={editData.status} 
                      onChange={e => setEditData({...editData, status: e.target.value as Task['status']})}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="meta-grid">
              <div className="meta-item">
                <label>Priority</label>
                {!isEditing ? (
                  <span className={`priority-pill priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                ) : (
                  <select 
                    className="edit-input"
                    value={editData.priority} 
                    onChange={e => setEditData({...editData, priority: e.target.value as Task['priority']})}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                )}
              </div>
              {!isEditing && (
                <div className="meta-item">
                  <label>Due Date</label>
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              )}
              {!isEditing && (
                <div className="meta-item">
                  <label>Status</label>
                  <span className={`status-badge status-${task.status.toLowerCase().replace('_', '-')}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              )}
              <div className="meta-item">
                <label>Created By</label>
                <span>{getUserName(task.createdBy)}</span>
              </div>
            </div>
          </section>

          <section className="comments-section">
            <h3>Comments ({comments.length})</h3>
            <div className="comment-list">
              {comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-meta">
                    <strong>{getUserName(comment.userId)}</strong>
                    <span>{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                  <p>{comment.content}</p>
                </div>
              ))}
            </div>
            <form className="comment-form" onSubmit={handleAddComment}>
              <input 
                placeholder="Add a comment..." 
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
              />
              <button type="submit">Post</button>
            </form>
          </section>

          <section className="history-section">
            <h3>Activity Timeline</h3>
            <div className="history-list">
              {history.map(log => (
                <div key={log.id} className="history-item">
                  <div className="history-dot"></div>
                  <div className="history-info">
                    <div className="history-header">
                      <strong>{getUserName(log.performedBy)}</strong> {log.action.toLowerCase().replace('_', ' ')}
                      <span className="history-date">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="history-details">
                        {Object.entries(log.details as Record<string, unknown>).map(([key, value]) => {
                          const isObject = typeof value === 'object' && value !== null;
                          const hasDiff = isObject && ('old' in (value as object) || 'new' in (value as object));
                          
                          if (hasDiff) {
                            const diff = value as { old?: unknown; new: unknown };
                            return (
                              <div key={key} className="history-diff">
                                <span className="diff-key">{key}:</span>
                                {diff.old !== undefined ? (
                                  <>
                                    <span className="diff-old">{String(diff.old)}</span>
                                    <span className="diff-arrow">→</span>
                                  </>
                                ) : null}
                                <span className="diff-new">{String(diff.new)}</span>
                              </div>
                            );
                          }
                          
                          return (
                            <div key={key} className="history-diff">
                              <span className="diff-key">{key}:</span>
                              <span className="diff-new">{String(value)}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
