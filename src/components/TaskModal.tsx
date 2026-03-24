import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { UserRole } from '../types/auth';
import { 
  createTask, 
  updateTask, 
  fetchTaskAssignees,
  type Task
} from '../store/slices/tasksSlice';
import { Modal } from './common/Modal';

import './TaskModal.css';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskToEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, selectedTaskAssignees } = useSelector((state: RootState) => state.tasks);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  const [formData, setFormData] = useState({
    title: taskToEdit?.title || '',
    description: taskToEdit?.description || '',
    dueDate: taskToEdit ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    priority: (taskToEdit?.priority || 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH',
    status: (taskToEdit?.status || 'PENDING') as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
    assignees: [] as number[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let promise: any;
    if (isOpen) {
      setError(null);
      if (taskToEdit) {
        // Sync formData if taskToEdit changes after mount
        setFormData({
          title: taskToEdit.title,
          description: taskToEdit.description || '',
          dueDate: new Date(taskToEdit.dueDate).toISOString().split('T')[0],
          priority: taskToEdit.priority,
          status: taskToEdit.status,
          assignees: selectedTaskAssignees,
        });
        promise = dispatch(fetchTaskAssignees(taskToEdit.id));
      }
    }

    return () => {
      if (promise) {
        promise.abort();
      }
    };
  }, [isOpen, taskToEdit, dispatch]);

  useEffect(() => {
    if (taskToEdit && selectedTaskAssignees.length > 0) {
      setFormData(prev => ({ ...prev, assignees: selectedTaskAssignees }));
    }
  }, [selectedTaskAssignees, taskToEdit]);

  const isOwner = taskToEdit?.createdBy === currentUser?.id;

  const isUser = currentUser?.role === UserRole.USER;
  const isManager = currentUser?.role === UserRole.MANAGER;

  // Can only edit non-status fields if Admin, or if Manager & Owner
  const canEditFull = currentUser?.role === UserRole.ADMIN || (isManager && isOwner) || (!taskToEdit && !isUser);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    let payload: any;
    if (taskToEdit && isUser) {
      // Users can only send status

      payload = { status: formData.status };
    } else {
      // Validation: Title cannot be empty
      if (!formData.title.trim()) {
        setError('Title is required.');
        setIsSubmitting(false);
        return;
      }

      // Validation: Due date cannot be in the past
      const dueDate = new Date(formData.dueDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      if (dueDate < now) {
        setError('Due date cannot be in the past.');
        setIsSubmitting(false);
        return;
      }

      payload = {
        title: formData.title,
        description: formData.description,
        dueDate: new Date(formData.dueDate).toISOString(),
        priority: formData.priority,
        assignees: formData.assignees,
      };
    }

    try {
      if (taskToEdit) {
        await dispatch(updateTask({ 
          id: taskToEdit.id, 
          data: { ...payload, lastUpdatedAt: taskToEdit.updatedAt } 
        })).unwrap();
      } else {
        await dispatch(createTask(payload)).unwrap();
      }
      onClose();

    } catch (err: any) {

      console.error('Failed to save task:', err);
      setError(err.response?.data?.error?.message || err.message || 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAssignee = (userId: number) => {
    if (!canEditFull) return;
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees.includes(userId)
        ? prev.assignees.filter(id => id !== userId)
        : [...prev.assignees, userId]
    }));
  };

  const modalFooter = (
    <>
      <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
      <button 
        type="submit" 
        form="task-form"
        className="btn-save" 
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : (taskToEdit ? 'Update Task' : 'Create Task')}
      </button>
    </>
  );

  return (

    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={taskToEdit ? 'Edit Task' : 'Create New Task'}
      footer={modalFooter}
    >
      {error && <div className="error-banner" style={{ 
        padding: '12px', 
        backgroundColor: '#fff2f0', 
        border: '1px solid #ffccc7', 
        borderRadius: '8px',
        color: '#ff4d4f',
        marginBottom: '20px',
        fontSize: '14px'
      }}>{error}</div>}
      <form id="task-form" onSubmit={handleSubmit} className="task-form" style={{ padding: 0 }}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input 
            id="title"
            required
            className="form-input"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            placeholder="What needs to be done?"
            disabled={!canEditFull}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea 
            id="description"
            className="form-input"
            rows={3}
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Add more details..."
            disabled={!canEditFull}
          />
        </div>

        <div className="form-row">

          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input 
              id="dueDate"
              type="date"
              required
              className="form-input"
              value={formData.dueDate}
              onChange={e => setFormData({...formData, dueDate: e.target.value})}
              disabled={!canEditFull}
            />
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select 
              id="priority"
              className="form-input"
              value={formData.priority}
              onChange={e => setFormData({...formData, priority: e.target.value as any})}
              disabled={!canEditFull}

            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>

          </div>
        </div>

        {taskToEdit && (
          <div className="form-group">

            <label htmlFor="status">Status</label>
            <select 
              id="status"
              className="form-input"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value as any})}
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

          </div>
        )}

        <div className="form-group">
          <label>Assignees</label>
          <div className="assignee-selector">
            {users.map(u => (
              <div 
                key={u.id} 
                className={`assignee-chip ${formData.assignees.includes(u.id) ? 'selected' : ''} ${!canEditFull ? 'disabled' : ''}`}
                onClick={() => toggleAssignee(u.id)}
              >
                {u.username || (u.firstName ? `${u.firstName} ${u.lastName || ''}` : u.email)}
              </div>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
};
