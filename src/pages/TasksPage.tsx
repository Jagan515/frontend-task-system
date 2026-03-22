import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchTasks, updateTask, fetchUsers, selectTask, type Task, fetchFilterPresets, saveFilterPreset, deleteFilterPreset, type FilterPreset } from '../store/slices/tasksSlice';
import { TaskModal } from '../components/TaskModal';
import { BulkActionBar } from '../components/BulkActionBar';
import { APP_ROUTES } from '../config/routes';
import './Dashboard.css';
import './TasksPage.css';

// SVG Icons
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const SortIcon = ({ direction }: { direction: 'asc' | 'desc' }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {direction === 'asc' ? (
      <>
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <polyline points="19 12 12 19 5 12"></polyline>
      </>
    ) : (
      <>
        <line x1="12" y1="19" x2="12" y2="5"></line>
        <polyline points="5 12 12 5 19 12"></polyline>
      </>
    )}
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

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

const SaveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

export const TasksPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: tasks, status, users, filterPresets, error: reduxError } = useSelector((state: RootState) => state.tasks);
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [presetName, setPresetName] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTasks());
    }
    if (users.length === 0) {
      dispatch(fetchUsers());
    }
    dispatch(fetchFilterPresets());
  }, [status, users.length, dispatch]);

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

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (task.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
        const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
        const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
        
        // Date range filter
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        const matchesStart = !dateRange.start || taskDate >= new Date(dateRange.start);
        const matchesEnd = !dateRange.end || taskDate <= new Date(dateRange.end);

        return matchesSearch && matchesStatus && matchesPriority && matchesStart && matchesEnd;
      })
      .sort((a, b) => {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      });
  }, [tasks, searchTerm, statusFilter, priorityFilter, dateRange, sortDirection]);

  const totalPages = Math.ceil(filteredTasks.length / pageSize);
  const pagedTasks = filteredTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSelect = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSavePreset = () => {
    if (!presetName) return;
    dispatch(saveFilterPreset({
      name: presetName,
      filter: { searchTerm, statusFilter, priorityFilter, dateRange }
    }));
    setPresetName('');
  };

  const handleApplyPreset = (preset: FilterPreset) => {
    setSearchTerm(preset.filter.searchTerm || '');
    setStatusFilter(preset.filter.statusFilter || 'ALL');
    setPriorityFilter(preset.filter.priorityFilter || 'ALL');
    setDateRange(preset.filter.dateRange || { start: '', end: '' });
  };

  const handleRemovePreset = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    dispatch(deleteFilterPreset(id));
  };

  return (
    <div className="tasks-page-container">
      {(reduxError || localError) && (
        <div 
          className="error-banner" 
          style={{
            background: '#fee2e2',
            color: '#b91c1c',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid #fecaca',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          <span>{reduxError || localError}</span>
          <button 
            onClick={() => setLocalError(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#b91c1c',
              fontSize: '20px',
              cursor: 'pointer',
              lineHeight: 1
            }}
          >
            &times;
          </button>
        </div>
      )}
      <BulkActionBar 
        selectedIds={selectedIds} 
        onClear={() => setSelectedIds([])} 
      />
      
      <div className="filters-bar">
        <div className="search-wrapper">
          <span className="search-icon"><SearchIcon /></span>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search tasks..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <select 
          className="filter-select" 
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <button 
          className={`advanced-toggle-btn ${isAdvancedOpen ? 'active' : ''}`}
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
        >
          <FilterIcon /> Filters
        </button>

        <button 
          className="sort-btn"
          onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
        >
          Due Date <SortIcon direction={sortDirection} />
        </button>

        {user && user.role !== 'CONSUMER' && (APP_ROUTES.find(r => r.path === '/tasks/create')?.permissions?.includes(user.role)) && (
          <button 
            className="primary-btn" 
            onClick={() => setIsModalOpen(true)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 16px', 
              background: 'var(--accent)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: 600, 
              cursor: 'pointer',
              marginLeft: 'auto'
            }}
          >
            <PlusIcon /> New Task
          </button>
        )}
      </div>

      {isAdvancedOpen && (
        <div className="advanced-filters-panel">
          <div className="advanced-filters-row">
            <div className="filter-group">
              <label>Priority</label>
              <select 
                className="filter-select" 
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Due Date Range</label>
              <div className="date-range-inputs">
                <input 
                  type="date" 
                  value={dateRange.start} 
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                />
                <span>to</span>
                <input 
                  type="date" 
                  value={dateRange.end} 
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                />
              </div>
            </div>

            <button className="clear-link" onClick={() => {
              setSearchTerm('');
              setStatusFilter('ALL');
              setPriorityFilter('ALL');
              setDateRange({ start: '', end: '' });
            }}>Reset All</button>
          </div>

          <div className="presets-section">
            <label>Saved Presets</label>
            <div className="presets-list">
              {filterPresets.map(preset => (
                <div key={preset.id} className="preset-chip" onClick={() => handleApplyPreset(preset)}>
                  {preset.name}
                  <button onClick={(e) => handleRemovePreset(e, preset.id!)} className="remove-preset">&times;</button>
                </div>
              ))}
              <div className="save-preset-form">
                <input 
                  placeholder="Preset name..." 
                  value={presetName}
                  onChange={e => setPresetName(e.target.value)}
                />
                <button onClick={handleSavePreset} disabled={!presetName}>
                  <SaveIcon /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="tasks-grid">
        {pagedTasks.length > 0 ? (
          pagedTasks.map((task, index) => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onComplete={handleComplete} 
              onSnooze={handleSnooze}
              onSelect={handleSelectTask}
              isSelected={selectedIds.includes(task.id)}
              onToggleSelect={(e) => toggleSelect(task.id, e)}
              index={index}
            />
          ))
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">🔍</span>
            <p>No tasks found matching your filters.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination-footer">
          <button 
            className="page-btn" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Previous
          </button>
          <span className="page-info">
            Page <strong>{currentPage}</strong> of {totalPages}
          </span>
          <button 
            className="page-btn" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </button>
        </div>
      )}
      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

interface TaskItemProps {
  task: Task;
  onComplete: (id: number) => void;
  onSnooze: (id: number, dueDate: string) => void;
  onSelect: (id: number) => void;
  isSelected: boolean;
  onToggleSelect: (e: React.MouseEvent) => void;
  index: number;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete, onSnooze, onSelect, isSelected, onToggleSelect, index }) => {
  const isOverdue = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    return date < today && task.status !== 'COMPLETED';
  };

  const type = isOverdue(task.dueDate) ? 'overdue' : (
    new Date(task.dueDate).toDateString() === new Date().toDateString() ? 'today' : 'upcoming'
  );

  return (
    <div 
      className={`task-item ${type} ${isSelected ? 'selected' : ''}`}
      style={{ animationDelay: `${index * 0.05}s`, cursor: 'pointer' }}
      onClick={() => onSelect(task.id)}
    >
      <div 
        className="task-selector"
        onClick={onToggleSelect}
      >
        <div className={`checkbox ${isSelected ? 'checked' : ''}`}>
          {isSelected && <CheckIcon />}
        </div>
      </div>
      <div className="task-content">
        <div className="task-title-row">
          <span className="task-title">{task.title}</span>
          <span className={`priority-pill priority-${task.priority.toLowerCase()}`}>
            {task.priority}
          </span>
          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: 'var(--social-bg)', color: 'var(--text)' }}>
            {task.status}
          </span>
        </div>
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
        <div className="task-meta">
          <div className="task-due-date">
            <CalendarIcon />
            <span>Due {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>
      <div className="task-actions">
        {task.status !== 'COMPLETED' && (
          <>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSnooze(task.id, task.dueDate);
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
                onComplete(task.id);
              }} 
              className="icon-btn btn-complete"
              aria-label="Complete"
            >
              <CheckIcon />
              <span className="tooltip">Mark as complete</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
