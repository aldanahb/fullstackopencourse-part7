import { createContext, useReducer } from 'react'

const userReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return action.payload 
    case 'CLEAR_USER':
      return null
    default:
      return state
  }
}

const UserContext = createContext()

export const UserContextProvider = (props) => {
  const [user, dispatch] = useReducer(userReducer, null)

  return (
    <UserContext.Provider value={[user, dispatch]}>
      {props.children}
    </UserContext.Provider>
  )
}

export default UserContext
