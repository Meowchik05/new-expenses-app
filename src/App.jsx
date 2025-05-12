import React from 'react';
import { createAssistant, createSmartappDebugger } from '@salutejs/client';
import { TaskList } from './pages/TaskList';
import './App.css';
import axios from 'axios';

const initializeAssistant = (getState /*: any*/, getRecoveryState) => {
  if (process.env.NODE_ENV === 'development') {
    return createSmartappDebugger({
      token: process.env.REACT_APP_TOKEN ?? '',
      initPhrase: `Запусти ${process.env.REACT_APP_SMARTAPP}`,
      getState,
      nativePanel: {
        defaultText: 'Что вы хотите сделать?',
        screenshotMode: false,
        tabIndex: -1,
      },
    });
  }
  return createAssistant({ getState });
};

const getOrCreateUserId = () => {
  let userId = localStorage.getItem('expenseTrackerUserId');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    localStorage.setItem('expenseTrackerUserId', userId);
  }
  return userId;
};

export class App extends React.Component {
  constructor(props) {
    super(props);
    console.log('constructor');
    this.userId = getOrCreateUserId();
    this.state = {
      tasks: [],
      categories: ["продукты", "транспорт", "жкх", "развлечения", "одежда"],
      newCategory: "",
      selectedTaskId: null,
      assistantError: null,
      isLoading: true,
      assistant: null,
      isMounted: false 
    };

  }

  componentDidMount() {
    this.setState({ isMounted: true }); 
    const assistant = initializeAssistant(() => this.getStateForAssistant());
    this.setState({ assistant }, () => {
      this.setupAssistantHandlers(assistant);
    });
    axios.get('https://servachello.onrender.com/api/expenses', {
      params: { userId: this.userId },
      headers: { 'Cache-Control': 'no-cache' }
    })
      .then(response => {
        if (this.state.isMounted) {
          this.setState({ 
            tasks: response.data || [],
            isLoading: false 
          });
        }
      })
      .catch(error => {
        console.error('Load Error:', error.response?.data || error.message);
        if (this.state.isMounted) {
          this.setState({ 
            assistantError: 'Ошибка загрузки данных',
            isLoading: false
          });
        }
      });
  }

  setupAssistantHandlers = (assistant) => {
    assistant.on('data', (event /*: any*/) => {
      console.log('assistant.on(data)', event);
      if (event.type === 'character') {
        console.log(`assistant.on(data): character: "${event?.character?.id}"`);
      } else if (event.type === 'insets') {
        console.log('assistant.on(data): insets');
      } else {
        const { action } = event;
        this.dispatchAssistantAction(action);
      }
    });

    assistant.on('start', (event) => {
      console.log('assistant.on(start)', event, assistant.getInitialData());
    });

    assistant.on('error', (error) => {
      console.error('assistant.on(error)', error);
      this.setState({ assistantError: 'Ошибка в работе ассистента' });
    });
  };

  getStateForAssistant = () => {
    console.log('getStateForAssistant: this.state:', this.state);
    return {
      item_selector: {
        items: this.state.tasks.map((task, index) => ({
          number: index + 1,
          id: task.id,
          title: `${task.title} - ${task.amount} руб.`,
          category: task.category
        })),
        ignored_words: [
          'добавить', 'установить', 'запиши', 'поставь', 'закинь',
          'удалить', 'удали', 'выбери', 'выбрать', 'покажи','прибавь'
        ],
      },
      current_selected: this.state.selectedTaskId,
      categories: this.state.categories
    };
  };

  dispatchAssistantAction = (action) => {
    console.log('dispatchAssistantAction', action);
    if (action) {

    switch (action.type) {
      case 'add_note':
        this.handleAddTask(action.note, action.summ, action.category || 'Другое');
        break;
      case 'delete_note':
        case 'remove_note':
          this.handleDeleteTask(action.id || this.state.selectedTaskId);
          break;
      case 'update_note':
        this.handleUpdateAmount(action.id, action.newsumm);
        break;
      default:
        console.warn('Неизвестное действие:', action);
    }}
  };

  handleAddTask = (title, amount, category) => {
    
    const newTask = {
      id: Date.now(),
      title,
      amount,
      category,
      userId: this.userId
    };

    this.setState({ isLoading: true });

    axios.post('https://servachello.onrender.com/api/expenses', newTask)
      .then(response => {
        if (this.state.isMounted) {
          this.setState(prevState => ({
            tasks: [...prevState.tasks, response.data],
            isLoading: false
          }));
        }
      })
      .catch(error => {
        console.error('Ошибка при добавлении задачи:', error);
        if (this.state.isMounted) {
          this.setState({ 
            assistantError: 'Не удалось добавить задачу',
            isLoading: false
          });
        }
      });
  };

  handleUpdateAmount = (taskId, value) => {
  if (!taskId || taskId === 'undefined' || !value) {
    alert('Ошибка: некорректные данные для обновления');
    return;
  }

  this.setState({ isLoading: true });

  axios.patch(
    `https://servachello.onrender.com/api/expenses/${taskId}/amount`,
    { 
      userId: this.userId,
      value: Number(value) 
    }
  )
    .then(response => {
      if (this.state.isMounted && response.data?.success) {
        this.setState(prevState => ({
          tasks: prevState.tasks.map(task => 
            task.id === taskId 
              ? { ...task, amount: response.data.updatedExpense.amount } 
              : task
          ),
          isLoading: false
        }));
      }
    })
    .catch(error => {
      console.error('Update Amount Error:', error.response?.data || error.message);
      if (this.state.isMounted) {
        this.setState({ isLoading: false });
        alert(`Ошибка обновления суммы: ${error.response?.data?.error || 'Unknown error'}`);
      }
    });
};

  handleDeleteTask = (taskId) => {
    if (!taskId || taskId === 'undefined') {
      alert('Ошибка: некорректный ID задачи');
      return;
    }

    this.setState({ isLoading: true });

    axios.delete(
      `https://servachello.onrender.com/api/expenses/${taskId}`,
      { params: { userId: this.userId } }
    )
      .then(response => {
        if (this.state.isMounted && response.data?.success) {
          this.setState(prevState => ({
            tasks: prevState.tasks.filter(task => task.id !== taskId),
            selectedTaskId: null,
            isLoading: false
          }));
        }
      })
      .catch(error => {
        console.error('Delete Error:', error.response?.data || error.message);
        if (this.state.isMounted) {
          this.setState({ isLoading: false });
          alert(`Ошибка удаления: ${error.response?.data?.error || 'Unknown error'}`);
        }
      });
  };

  handleSelectTask = (taskId) => {
    this.setState({ selectedTaskId: taskId });
  };

  handleAddCategory = (category) => {
    if (category.trim() && !this.state.categories.includes(category)) {
      this.setState(prevState => ({
        categories: [...prevState.categories, category]
      }));
      return true;
    }
    return false;
  };

  componentWillUnmount() {
    this.setState({ isMounted: false });
  }

  render() {
    const { tasks, categories, selectedTaskId, assistantError, isLoading } = this.state;

    if (isLoading) {
      return (
        <div className="app-container">
          <div className="loading-indicator">Загрузка данных...</div>
        </div>
      );
    }

    return (
      <div className="app-container">
        <h1>Управление расходами</h1>
        {assistantError && (
          <div className="assistant-error">
            {assistantError}
            <button onClick={() => this.setState({ assistantError: null })}>
              ×
            </button>
          </div>
        )}
        <TaskList
          tasks={tasks}
          categories={categories}
          onAdd={this.handleAddTask}
          onDelete={this.handleDeleteTask}
          onAddCategory={this.handleAddCategory}
          selectedTaskId={selectedTaskId}
          onSelectTask={this.handleSelectTask}
        />
      </div>
    );
  }
}

export default App;