export function createState({ node, key, initialState, render }) {
  const savedInSessionStorage = key
    ? JSON.parse(sessionStorage.getItem(key))
    : undefined;
  const state = {
    payload: savedInSessionStorage ? savedInSessionStorage : initialState || [],
  };

  function setState(newState) {
    state.payload = newState.payload;
    if (key) sessionStorage.setItem(key, JSON.stringify(state.payload));
    _render();
  }

  function _render() {
    if (typeof render === 'function') {
      render();
      return;
    }
    if (node instanceof HTMLElement) {
      if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
        node.value = state.payload;
      } else {
        node.innerText = state.payload;
      }
    }
  }

  return [state, setState];
}
