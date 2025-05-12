import React from "react";
import "../App.css";

export class AddTask extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      note: "",
      amount: "",
      category: props.categories[0] || "",
      showCustomCategory: false,
      customCategory: ""
    };
  }

  handleAddCustomCategory = () => {
    if (this.props.onAddCategory(this.state.customCategory)) {
      this.setState({
        category: this.state.customCategory,
        customCategory: "",
        showCustomCategory: false
      });
    }
  };

  render() {
    const { onAdd, categories } = this.props;

    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onAdd(this.state.note, parseFloat(this.state.amount) || 0, this.state.category);
          this.setState({
            note: "",
            amount: ""
          });
        }}
        className="add-task-form"
      >
        <input
          className="add-task-input"
          type="text"
          placeholder="Название покупки"
          value={this.state.note}
          onChange={({ target: { value } }) =>
            this.setState({ note: value })
          }
          required
          autoFocus
        />

        <input
          className="add-task-input"
          type="number"
          placeholder="Сумма (₽)"
          value={this.state.amount}
          onChange={({ target: { value } }) =>
            this.setState({ amount: value })
          }
          required
          min="0"
          step="1"
        />

        {!this.state.showCustomCategory ? (
          <div className="category-select-container">
            <select
              className="category-select"
              value={this.state.category}
              onChange={({ target: { value } }) =>
                this.setState({ category: value })
              }
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <button 
              type="button" 
              className="add-category-btn"
              onClick={() => this.setState({ showCustomCategory: true })}
            >
              + Новая
            </button>
          </div>
        ) : (
          <div className="custom-category-container">
            <input
              className="add-task-input"
              type="text"
              placeholder="Новая категория"
              value={this.state.customCategory}
              onChange={({ target: { value } }) =>
                this.setState({ customCategory: value })
              }
            />
            <button
              type="button"
              className="confirm-category-btn"
              onClick={this.handleAddCustomCategory}
            >
              Добавить
            </button>
            <button
              type="button"
              className="cancel-category-btn"
              onClick={() => this.setState({ 
                showCustomCategory: false,
                customCategory: ""
              })}
            >
              Отмена
            </button>
          </div>
        )}

        <button type="submit" className="add-task-button">
          Добавить расход
        </button>
      </form>
    );
  }
}