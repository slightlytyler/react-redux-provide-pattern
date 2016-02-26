# react-redux-provide-pattern

A toolset for the pattern outlined by [react-redux-provide](https://github.com/loggur/react-redux-provide), designed to be used with vanilla redux.

## Usage

npm module coming soon! for now you'll have to clone this repo, build the module, and link it

## Example

A simple counter

Provider
```javascript
import { createProvider } from 'react-redux-provide-pattern';

const count = createProvider('count');

// Constants
const INCREMENT_COUNT = 'INCREMENT_COUNT';

counter.constants = { INCREMENT_COUNT };

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
      type: INCREMENT_COUNTER,
      increment: -magnitude
    };
  },

  doubleCountAsync() {
    return (dispatch, getState) => {
      dispatch({
        type: DOUBLE_COUNT,
        increment: getState().count * 2
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


Counter component
```javascript
import React, { PropTypes, Component } from 'react';

class Counter extends Component {
  static propTypes = {
    count: PropTypes.object.isRequired,
    incrementCount: PropTypes.func.isRequired,
    decrementCount: PropTypes.func.isRequired,
    doubleCountAsync: PropTypes.func.isRequired,
  };

  render() {
    const {
      count,
      incrementCount,
      decrementCount,
      doubleCountAsync,
    } = this.props;

    return (
      <div>
        <div>Current count: {count}</div>
        <button onClick={decrementCount}>-</button>
        <button onClick={incrementCount}>+</button>
        <button onClick={doubleCountAsync}>x2</button>
      </div>
    );
  }
}

import { provide } from 'react-redux-provide-pattern';
import countProvider from '../providers/count';

export default provide(countProvider)(Counter);
```

## Resource Provider

Here's a basic todo example

Provider:
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
  payload: { title },
});

export default lanes;
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
