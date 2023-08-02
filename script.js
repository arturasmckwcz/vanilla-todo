import { createState } from './state.js';

const JSON_STORAGE_URL = 'http://158.129.206.250:4000/api/v1';
const JSON_STORAGE_TOKEN =
  'dp:VjC,wp2sS1387u><A?Y~F+nk8haGDIBYQegTGnXxgrEYxLdSuuvjxHcNaRKEI';
const JSON_STORAGE_KEY = 'todos';

const TODOS_SESSION_STORAGE_KEY = 'todos';

const form = document.getElementById('form');
const input = document.getElementById('input');
const completed = document.getElementById('completed');
const left = document.getElementById('left');
const list = document.getElementById('list');
const filters = document.getElementById('filters');

const [todos, setTodos] = createState({
  initialState: [],
  key: TODOS_SESSION_STORAGE_KEY,
  render,
});

const [filter, setFilter] = createState({
  initialState: 'all',
  render,
});

document.querySelector(`input[value=${filter.payload}]`).checked = true;

render();

form.addEventListener('submit', e => {
  e.preventDefault();
  const title = input.value;
  input.value = null;
  if (title === '') return;

  todos.payload = [...todos.payload, { title, completed: false }];
  setTodos(todos);
});

completed.addEventListener('click', () => {
  const notCompletedTodos = todos.payload.filter(({ completed }) => !completed);
  setTodos({ payload: notCompletedTodos });
});

filters.querySelectorAll('input[name="filters"]').forEach(_filter => {
  _filter.addEventListener('change', () => {
    const selected = filters.querySelector('input[name=filters]:checked');
    if (selected) {
      filter.payload = selected.value;
      setFilter(filter);
    }
  });
});

document.getElementById('debug').addEventListener('click', () => {
  console.log('DEBUG:button:todos.payload:', todos.payload);
  console.log('DEBUG:button:filter.payload:', filter.payload);
  console.log('DEBUG:button:JSON_STORAGE_KEY:', JSON_STORAGE_KEY);
  console.log('DEBUG:button:sessionStorage:', sessionStorage);
});

function render() {
  if (!todos.payload || !Array.isArray(todos.payload)) return;
  list.innerHTML = todos.payload
    .filter(item =>
      filter.payload === 'all'
        ? true
        : filter.payload === 'completed'
        ? item.completed
        : !item.completed,
    )
    .map(item => {
      return `<li class="todo ${
        item.completed ? 'completed' : ''
      }"><input type="checkbox" ${item.completed ? 'checked' : ''}/> ${
        item.title
      }</li>`;
    })
    .join('');
  const checkBoxes = list.querySelectorAll('input[type="checkbox"]');
  checkBoxes.forEach((checkbox, index) => {
    checkbox.addEventListener('change', () => {
      todos.payload[index].completed = checkbox.checked;
      setTodos(todos);
    });
  });
  left.innerText = todos.payload.filter(({ completed }) => !completed).length;
}

window.addEventListener('load', () => {
  console.log('DEBUG:load:todos.payload:', todos.payload);
  if (todos.payload.length) return;
  const url = `${JSON_STORAGE_URL}/${JSON_STORAGE_KEY}`;
  fetch(url, {
    headers: { token: JSON_STORAGE_TOKEN },
  })
    .then(response => response.json())
    .then(data => {
      if (data[JSON_STORAGE_KEY]) {
        const todosList = data[JSON_STORAGE_KEY];
        if (Array.isArray(todosList)) {
          todos.payload = todosList;
          setTodos(todos);
        }
      }
    })
    .catch(console.error);
});

window.addEventListener('unload', () => {
  fetch(JSON_STORAGE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      token: JSON_STORAGE_TOKEN,
    },
    body: JSON.stringify({
      [JSON_STORAGE_KEY]: todos.payload,
    }),
  }).catch(console.error);
});
