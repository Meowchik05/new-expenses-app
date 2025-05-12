import React from "react";
import { TaskItem } from "./TaskItem";
import "../App.css";

export const TaskItemList = (props) => {
  const { items, onDelete, onMove } = props;

  return (
    <ul className="notes">
      {items.map((item, index) => (
        <TaskItem
          item={item}
          key={item.id} // Используем уникальный id вместо индекса
          index={index}
          onDelete={onDelete}
          onMove={onMove}
        />
      ))}
    </ul>
  );
};