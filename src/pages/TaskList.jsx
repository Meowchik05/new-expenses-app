import React from "react";
import { TaskItem } from "../components/TaskItem";
import { AddTask } from "../components/AddTask";

export const TaskList = ({ 
  tasks, 
  categories,
  onAdd, 
  onDelete,
  onAddCategory,
  selectedTaskId,
  onSelectTask
}) => {
  return (
    <div className="task-list-container">
      <AddTask 
        onAdd={onAdd} 
        categories={categories}
        onAddCategory={onAddCategory}
      />
      
      <ul className="task-list">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            item={task}
            isSelected={task.id === selectedTaskId}
            onSelect={() => onSelectTask(task.id)}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  );
};