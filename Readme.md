# react-redux-provide-pattern

A toolset for the pattern outlined by [react-redux-provide](https://github.com/loggur/react-redux-provide), designed to be used with vanilla redux.

## Usage

npm module coming soon! for now you'll have to clone this repo, build the module, and link it

## Example

Here's a basic todo example

Provider:
```javascript
// Constants
const CREATE_TODO = 'CREATE_TODO';
const UPDATE_TODO = 'UPDATE_TODO';
const REMOVE_TODO = 'REMOVE_TODO';
const TOGGLE_TODO = 'TOGGLE_TODO';

export const constants = {
  CREATE_LANE,
  UPDATE_TODO,
  REMOVE_TODO,
  TOGGLE_TODO
};

// Actions
import generateId from 'shortid';

export const actions = {
  createTodo(title) {
    return {
      type: CREATE_TODO,
      id: generateId(),
      title,
    };
  },

  updateTodo(id, payload) {
    return {
      type: UPDATE_TODO,
      id,
      payload
    };
  },

  removeTodo(id) {
    return {
      type: REMOVE_TODO,
      id
    };
  },

  toggleTodo(id) {
    return {
      type: TOGGLE_TODO,
      id
    };
  }
};

// Reducers
import { combineReducers } from 'redux';

export const reducers = combineReducers({
  records(state = [], action) {
    switch (action.type) {
      case CREATE_TODO:
        return [...state, action.id];

      case REMOVE_TODO:
        return state.splice(state.indexOf(action.id), 1);

      default:
        return state;
    }
  },

  recordsById(state = {}, action) {
    switch (action.type) {
      case CREATE_TODO: {
        const { id, title } = action;
        return Object.assign({}, state, {
          [id]: {
            id,
            title,
          },
        });
      }

      case UPDATE_TODO: {
        const { id, payload } = action;
        return Object.assign({}, state, {
          [id]: {
            id,
            ...payload
          }
        });
      }

      case REMOVE_TODO: {
        const newState = Object.assign({}, state);
        delete newState[action.id];
        return newState;
      }

      case TOGGLE_TODO:
        return Object.assign({}, state, {
          [action.id]: Object.assign({}, state[action.id], {
            completed: !state[action.id].completed
          }),
        });

      default:
        return state;
    }
  },
});


// Provider
import { createProvider } from 'react-redux-provide-pattern';

const todos = createProvider('todos', 'todo', 'todoKey');

todos.constants = constants;
todos.actions = actions;
todos.reducers = reducers;

export default todos;
```

TodoList component:
```javascript
import React, { PropTypes, Component } from 'react';

import TodoItem from './TodoItem';
import TodoCreator from './TodoCreator';

class TodoList extends Component {
  static propTypes = {
    todos: PropTypes.array.isRequired,
  };

  render() {
    const { todos } = this.props;

    return (
      <div>
        {
          todos.map(id => (
            <TodoItem
              key={id}
              todoKey={id}
            />
          ))
        }
        <TodoCreator />
      </div>
    );
  }
}


import { provide } from 'react-redux-provide-pattern';
import todosProvider from '../providers/todos';

export default provide(todosProvider)(TodoList);
```

TodoItem component:
```javascript
import React, { PropTypes, Component } from 'react';

class LaneItem extends Component {
  static propTypes = {
    todo: PropTypes.object.isRequired,
    toggleTodo: PropTypes.func.isRequired,
  };

  toggle = () => this.props.toggleTodo(this.props.todo.id);

  render() {
    const { title, completed } = this.props.todo;

    return (
      <div>
        <div>{title}</div>
        <input type="checkbox" value={completed} onClick={this.toggle} />
      </div>
    );
  }
}

import { provide } from 'react-redux-provide-pattern';
import todosProvider from '../providers/todos';

export default provide(todosProvider)(TodoItem);
```

TodoCreator component:
```javascript
import React, { PropTypes, Component } from 'react';

class TodoCreator extends Component {
  static propTypes = {
    createTodo: PropTypes.func.isRequired,
  };

  state = {
    title: '',
  };

  submit = () => {
    const { title } = this.state;

    if (!title) {
      return;
    }

    this.props.createTodo(title);
    this.clear();
  }

  clear = () => {
    this.setState({
      title: '',
    });
  };

  render() {
    return (
      <div>
        <input
          value={this.state.title}
          onChange={(e) => this.setState({
            title: e.target.value,
          })}
        />
        <button onClick={this.submit}>Add</button>
      </div>
    );
  }
}

import { provide } from 'react-redux-provide-pattern';
import todosProvider from '../providers/todos';

export default provide(todosProvider)(TodoCreator);
```
