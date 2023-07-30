import { createState } from './state.js';

const JSON_STORAGE_URL = 'http://158.129.206.250:4000/api/v1';
const JSON_STORAGE_TOKEN =
  'dp:VjC,wp2sS1387u><A?Y~F+nk8haGDIBYQegTGnXxgrEYxLdSuuvjxHcNaRKEI';
const JSON_STORAGE_KEY = 'todos';
const TODOS_KEY = 'todos';
const FILTER_KEY = 'filter';

const form = document.getElementById('form');
const input = document.getElementById('input');
const completed = document.getElementById('completed');
const left = document.getElementById('left');
const list = document.getElementById('list');
const filters = document.getElementById('filters');

const [todos, setTodos] = createState({
  key: TODOS_KEY,
  initialState: [],
  render,
});

const [filter, setFilter] = createState({
  key: FILTER_KEY,
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
  saveTodosToJSONStorage();
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

document.getElementById('clear').addEventListener('click', () => {
  if (confirm('Are you sure?')) {
    sessionStorage.clear(TODOS_KEY);
    sessionStorage.clear(FILTER_KEY);
    location.reload();
  }
});

document.getElementById('debug').addEventListener('click', () => {
  console.log('DEBUG:button:todos', todos);
  console.log('DEBUG:button:filter', filter);
  console.log('DEBUG:button:sessionStorage', sessionStorage);
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

function saveTodosToJSONStorage() {
  fetch(JSON_STORAGE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', token: JSON_STORAGE_TOKEN },
    body: JSON.stringify({
      [JSON_STORAGE_KEY]: sessionStorage.getItem(TODOS_KEY),
    }),
  }).catch(console.error);
}

window.addEventListener('load', () => {
  console.log('DEBUG:load:todos', todos);
  const url = `${JSON_STORAGE_URL}/${JSON_STORAGE_KEY}`;
  fetch(url, {
    headers: { token: JSON_STORAGE_TOKEN },
  })
    .then(response => response.json())
    .then(data => {
      if (data[JSON_STORAGE_KEY]) {
        const todosList = JSON.parse(data[JSON_STORAGE_KEY]);
        if (Array.isArray(todosList)) {
          todos.payload = todosList;
          setTodos(todos);
        }
      }
    })
    .catch(console.error);
});

window.addEventListener('unload', saveTodosToJSONStorage);
