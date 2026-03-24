import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store';
import { UserRole } from '../types/auth';
import { fetchTasks, updateTask, fetchUsers, selectTask, type Task } from '../store/slices/tasksSlice';

import { APP_ROUTES } from '../config/routes';
import { TaskModal } from '../components/TaskModal';
import './Dashboard.css';

// SVG Icons
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

export const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: tasks } = useSelector((state: RootState) => state.tasks);
  const user = useSelector((state: RootState) => state.auth.user);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchInitialData());
  }, [dispatch]);

  const handleComplete = (id: number) => {
    dispatch(updateTask({ id, data: { status: 'COMPLETED' } }));
  };

  const handleSnooze = (id: number, currentDueDate: string) => {
    const nextDay = new Date(currentDueDate);
    nextDay.setDate(nextDay.getDate() + 1);
    dispatch(updateTask({ id, data: { dueDate: nextDay.toISOString() } }));
  };

  const handleSelectTask = (id: number) => {
    dispatch(selectTask(id));
  };

  const isToday = (dateStr: string) => {
    const today = new Date();
    const date = new Date(dateStr);
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isOverdue = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    return date < today;
  };

  const overdueTasks = tasks.filter(t => t.status !== 'COMPLETED' && isOverdue(t.dueDate));
  const todayTasks = tasks.filter(t => t.status !== 'COMPLETED' && isToday(t.dueDate));
  const upcomingTasks = tasks.filter(t => t.status !== 'COMPLETED' && !isToday(t.dueDate) && !isOverdue(t.dueDate));

  // Determine if user can create tasks (based on APP_ROUTES permissions for /tasks/create)
  const createTaskRoute = APP_ROUTES.find(r => r.path === '/tasks/create');
  const canCreateTask = user && user.role !== UserRole.USER && createTaskRoute?.permissions?.includes(user.role);

  // Fix duplication: Exclude the 'Dashboard' itself from the nav items loop
  return (
    <div className="dashboard-container">
      <div className="dashboard-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '32px', color: 'var(--text-h)' }}>Dashboard</h1>
        {canCreateTask && (
          <button 
            className="primary-btn" 
            onClick={() => setIsModalOpen(true)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 20px', 
              background: 'var(--accent)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: 600, 
              cursor: 'pointer' 
            }}
          >
            <PlusIcon /> New Task
          </button>
        )}
      </div>

      <div className="task-sections">
        <TaskSection 
          title="Overdue Tasks" 
          tasks={overdueTasks} 
          type="overdue" 
          onComplete={handleComplete} 
          onSnooze={handleSnooze}
          onSelect={handleSelectTask}
          emptyMessage="Great job! No overdue tasks."
          emptyIcon="🎉"
          canCreate={!!canCreateTask}
        />
        
        <TaskSection 
          title="Today's Tasks" 
          tasks={todayTasks} 
          type="today" 
          onComplete={handleComplete} 
          onSnooze={handleSnooze}
          onSelect={handleSelectTask}
          emptyMessage="No tasks for today. Time for a coffee?"
          emptyIcon="☕"
          canCreate={!!canCreateTask}
        />
        
        <TaskSection 
          title="Upcoming Tasks" 
          tasks={upcomingTasks} 
          type="upcoming" 
          onComplete={handleComplete} 
          onSnooze={handleSnooze}
          onSelect={handleSelectTask}
          emptyMessage="The horizon is clear. Relax!"
          emptyIcon="🌅"
          canCreate={!!canCreateTask}
        />
      </div>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

interface TaskSectionProps {
  title: string;
  tasks: Task[];
  type: 'overdue' | 'today' | 'upcoming';
  onComplete: (id: number) => void;
  onSnooze: (id: number, dueDate: string) => void;
  onSelect: (id: number) => void;
  emptyMessage: string;
  emptyIcon: string;
  canCreate?: boolean; // Added canCreate prop
}

const TaskSection: React.FC<TaskSectionProps> = ({ 
  title, 
  tasks, 
  type, 
  onComplete, 
  onSnooze, 
  onSelect,
  emptyMessage, 
  emptyIcon,
  canCreate = true // Default to true
}) => (
  <section className="task-section">
    <div className="task-section-header">
      <h3>{title}</h3>
      <span className="task-count-badge">{tasks.length}</span>
    </div>
    <div className="task-list">
      {tasks.length > 0 ? (
        tasks.map((task, index) => (
          <div 
            key={task.id} 
            className={`task-item ${type}`}
            style={{ animationDelay: `${index * 0.05}s`, cursor: 'pointer' }}
            onClick={() => onSelect(task.id!)}
          >
            <div className="task-content">
              <div className="task-title-row">
                <span className="task-title">{task.title}</span>
                <span className={`priority-pill priority-${task.priority.toLowerCase()}`}>
                  {task.priority}
                </span>
              </div>
              {task.description && (
                <p className="task-description">{task.description}</p>
              )}
              <div className="task-meta">
                <div className="task-due-date">
                  <CalendarIcon />
                  <span>Due {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
            <div className="task-actions">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSnooze(task.id!, task.dueDate);
                }} 
                className="icon-btn btn-snooze"
                aria-label="Snooze"
              >
                <ClockIcon />
                <span className="tooltip">Snooze to tomorrow</span>
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete(task.id!);
                }} 
                className="icon-btn btn-complete"
                aria-label="Complete"
              >
                <CheckIcon />
                <span className="tooltip">Mark as complete</span>
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="empty-state">
          <span className="empty-state-icon">{emptyIcon}</span>
          <p>{emptyMessage}</p>
          {canCreate && <Link to="/tasks/create" className="quick-add-link">+ Create a new task</Link>}
        </div>
      )}
    </div>
  </section>
);
