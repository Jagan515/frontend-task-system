import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState, type AppDispatch } from '../store';
import { 
  selectTask, 
  fetchTaskComments, 
  fetchTaskHistory, 
  addTaskComment,
  updateTask,
  type Task
} from '../store/slices/tasksSlice';
import './TaskDetail.css';

export const TaskDetail: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedTaskId, items: tasks, comments, history, users } = useSelector((state: RootState) => state.tasks);
  
  const [commentText, setCommentText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Task>>({});

  const task = tasks.find(t => t.id === selectedTaskId);

  useEffect(() => {
    if (selectedTaskId) {
      dispatch(fetchTaskComments(selectedTaskId));
      dispatch(fetchTaskHistory(selectedTaskId));
      setIsEditing(false);
    }
  }, [selectedTaskId, dispatch]);

  if (!selectedTaskId || !task) return null;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    dispatch(addTaskComment({ taskId: selectedTaskId, content: commentText }));
    setCommentText('');
  };

  const startEditing = () => {
    setEditData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
    });
    setIsEditing(true);
  };

  const handleUpdate = () => {
    dispatch(updateTask({ id: task.id, data: editData }));
    setIsEditing(false);
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

        <div className="detail-content">
          <section className="info-section">
            {!isEditing ? (
              <>
                <h2 className="detail-title">{task.title}</h2>
                <p className="detail-description">{task.description || 'No description provided.'}</p>
              </>
            ) : (
              <div className="edit-form">
                <input 
                  className="edit-input title-input"
                  value={editData.title}
                  onChange={e => setEditData({...editData, title: e.target.value})}
                />
                <textarea 
                  className="edit-input desc-input"
                  value={editData.description}
                  onChange={e => setEditData({...editData, description: e.target.value})}
                />
              </div>
            )}

            <div className="meta-grid">
              <div className="meta-item">
                <label>Status</label>
                {!isEditing ? (
                  <span className={`status-badge status-${task.status?.toLowerCase()}`}>{task.status}</span>
                ) : (
                  <select 
                    value={editData.status} 
                    onChange={e => setEditData({...editData, status: e.target.value as any})}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                )}
              </div>
              <div className="meta-item">
                <label>Priority</label>
                {!isEditing ? (
                  <span className={`priority-pill priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                ) : (
                  <select 
                    value={editData.priority} 
                    onChange={e => setEditData({...editData, priority: e.target.value as any})}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                )}
              </div>
              <div className="meta-item">
                <label>Due Date</label>
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
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
                        {Object.entries(log.details).map(([key, value]: [string, any]) => (
                          <div key={key} className="history-diff">
                            <span className="diff-key">{key}:</span>
                            {value.old !== undefined ? (
                              <>
                                <span className="diff-old">{String(value.old)}</span>
                                <span className="diff-arrow">→</span>
                              </>
                            ) : null}
                            <span className="diff-new">{String(value.new)}</span>
                          </div>
                        ))}
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
