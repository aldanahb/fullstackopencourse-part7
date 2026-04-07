import { useContext } from 'react'
import NotificationContext from '../NotificationContext'

const Notification = () => {
  const [notification] = useContext(NotificationContext)

  if (!notification || !notification.content) return null

  const { content, type } = notification

  let style

  if (type === 'error') {
    style = {
      color: 'red',
      background: 'lightgrey',
      fontSize: 20,
      borderStyle: 'solid',
      borderRadius: 5,
      padding: 10,
      marginBottom: 10,
      borderWidth: 3,
      borderColor: 'red',
    }
  } else {
    style = {
      color: 'green',
      background: 'lightgrey',
      fontSize: 20,
      borderStyle: 'solid',
      borderRadius: 5,
      padding: 10,
      marginBottom: 10,
      borderWidth: 3,
      borderColor: 'green',
    }
  }

  return <div style={style}>{content}</div>
}

export default Notification
