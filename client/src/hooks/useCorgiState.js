import { useReducer } from 'react'

const VALID_STATES = ['idle', 'listening', 'thinking', 'excited', 'serving', 'sleepy', 'reading']

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, corgiState: VALID_STATES.includes(action.payload) ? action.payload : 'idle' }
    case 'RESET':
      return { ...state, corgiState: 'idle' }
    default:
      return state
  }
}

export function useCorgiState(initial = 'idle') {
  const [state, dispatch] = useReducer(reducer, { corgiState: initial })

  const setState = (newState) => dispatch({ type: 'SET_STATE', payload: newState })
  const reset = () => dispatch({ type: 'RESET' })

  return { corgiState: state.corgiState, setState, reset }
}
