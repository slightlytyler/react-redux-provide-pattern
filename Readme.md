# react-redux-provide-pattern

A toolset for the pattern outlined by [react-redux-provide](https://github.com/loggur/react-redux-provide), designed to be used with vanilla redux.

## Usage

npm module coming soon! for now you'll have to clone this repo, build the module, and link it

### API

What is a provider? It is an object that contains the constants, actions, reducers, and selectors for a particular slice of redux state. By following
some convention we can have the needed state and action creators passed to the component without manually writing `mapStateToProps` or `mapDispatchToProps`.

`createProvider` function: creates a provider object. Attach constants, actions, and reducers to it.

`createResourceProvider` function: creates a provider object with basic actions and reducers for handling a *resource*. A resource is slice of state that represents
a collection of elements of the same type.

`provide` decorator: creates a HOC connected to the store with state and actions automatically bound based on the source components propTypes.

## Basic Example

A simple [counter](https://github.com/slightlytyler/react-redux-provide-pattern-counter)

**Count provider**:
```javascript
import { createProvider } from 'react-redux-provide-pattern';

const count = createProvider('count');

// Constants
const INCREMENT_COUNT = 'INCREMENT_COUNT';

count.constants = { INCREMENT_COUNT };

// Actions
count.actions = {
  incrementCount(magnitude = 1) {
    return {
      type: INCREMENT_COUNT,
      increment: magnitude
    };
  },

  decrementCount(magnitude = 1) {
    return {
      type: INCREMENT_COUNT,
      increment: -magnitude
    };
  },

  doubleCountAsync() {
    return (dispatch, getState) => {
      dispatch({
        type: INCREMENT_COUNT,
        increment: getState().count
      });
    };
  },
};

// Reducers
count.reducers = (state = 0, action) => {
  switch (action.type) {
    case INCREMENT_COUNT:
      return state + action.increment;

    default:
      return state;
  }
};

export default count;
```

**Counter component**:
```javascript
import React, { PropTypes, Component } from 'react';

class Counter extends Component {
  static propTypes = {
    count: PropTypes.number.isRequired,
    incrementCount: PropTypes.func.isRequired,
    decrementCount: PropTypes.func.isRequired,
    doubleCountAsync: PropTypes.func.isRequired,
  };

  increment = () => this.props.incrementCount();

  decrement = () => this.props.decrementCount();

  double = () => this.props.doubleCountAsync();

  render() {
    return (
      <div>
        <div>Current count: {this.props.count}</div>
        <button onClick={this.decrement}>-</button>
        <button onClick={this.increment}>+</button>
        <button onClick={this.double}>x2</button>
      </div>
    );
  }
}

import { provide } from 'react-redux-provide-pattern';
import countProvider from '../providers/count';

export default provide(countProvider)(Counter);
```

## Todo example using Resource Provider

**Todos provider**:
```javascript
// Provider
import { createResourceProvider } from 'react-redux-provide-pattern';

const todos = createResourceProvider('todos', 'todo', 'todoKey');
const { SET_TODO, UPDATE_TODO, DELETE_TODO } = lanes.constants;

// Constants
const TOGGLE_TODO = 'TOGGLE_TODO';

todos.constants.TOGGLE_TODO = TOGGLE_TODO;

// Actions
import generateId from 'shortid';

todos.actions.createTodo = title => ({
  type: SET_TODO,
  id: generateId(),
  payload: {
    title,
    completed: false
  },
});

todos.actions.toggleTodo = id => (dispatch, getState) => {
  dispatch({
    type: UPDATE_TODO,
    id,
    payload: {
      completed: !getState().todos.recordsById[id].completed
    }
  });
};

todos.actions.clearCompleted = () => (dispatch, getState) => {
  const { records, recordsById } = getState().todos;
  const { deleteTodo } = todos.actions;

  records.forEach(id => {
    if (recordsById[id].completed) {
      dispatch(deleteTodo(id));
    }
  });
};

export default todos;
```

**TodoList component**:
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

**TodoItem component**:
```javascript
import React, { PropTypes, Component } from 'react';

class TodoItem extends Component {
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

**TodoCreator component**:
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
    this.reset();
  }

  reset = () => {
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
