import React from "react";
import "../App.css";

export const TaskItem = ({ 
  item, 
  isSelected,
  onSelect,
  onDelete
}) => {
  return (
    <li 
      className={`task-item ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className="task-content">
        <div className="task-header">
          <span className="task-title">{item.title}</span>
          <span className="task-category">{item.category}</span>
        </div>
        <span className="task-amount">{item.amount} ₽</span>
        
        <div className="task-controls">
          <button 
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
          >
            Удалить
          </button>
        </div>
      </div>
    </li>
  );
};