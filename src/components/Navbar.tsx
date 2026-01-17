import './navbar.css'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'


import { useToast } from '../context/ToastContext'

interface NavbarProps {
  page: string
}

const Navbar: React.FC<NavbarProps> = ({ page }) => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  function handleLogout() {
    logout()
    showToast("Logged out successfully", "success")
    navigate('/')
  }
  if (page === "home") {
    return (
      <>
        <div className="navbar">
          <div className='logo'>
            <img src='/logo.png' width={150} />
          </div>
          <div className='btnLink'>
            <ul>
              <li className='active'>
                Home
              </li>
              <li onClick={() => navigate('/tickets')}>
                My Ticket
              </li>
            </ul>
          </div>
          <div className='logoutBtn'>
            <button type='submit' onClick={() => handleLogout()}>Logout</button>
          </div>
        </div>
      </>
    )
  }
  else {
    return (
      <>
        <div className="navbar">
          <div className='logo'>
            <img src='/logo.png' width={150} />
          </div>
          <div className='btnLink'>
            <ul>
              <li onClick={() => navigate('/home')}>
                Home
              </li>
              <li className='active'>
                My Ticket
              </li>
            </ul>
          </div>
          <div className='logoutBtn'>
            <button type='submit' onClick={() => handleLogout()}>Logout</button>
          </div>
        </div>
      </>
    )
  }

}

export default Navbar