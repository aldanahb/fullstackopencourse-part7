import { Link } from 'react-router-dom'

const Menu = () => {
  const padding = {
    paddingRight: 5
  }
  return (
    <div>
      <div>
        <Link to='/' style={padding}>anecdotes</Link>
        <Link to='/create' style={padding}>create new</Link>
        <Link to='/about' style={padding}>about</Link>
      </div>
    </div>
  )
}

export default Menu