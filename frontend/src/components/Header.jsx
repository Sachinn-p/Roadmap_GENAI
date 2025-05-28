import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Header = () => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const email = localStorage.getItem("userEmail");

    if (isLoggedIn) {
      navigate(`/dashboard?email=${email}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div>
        <div className="header-container">
            <div className="left">
              <img src={logo} alt="" />
            </div>
            <div className="right">
                <p><Link to='/' className='link'>Home</Link></p>
                <p><Link to='/form' className='link'>Learning</Link></p>
                <p><Link to='/resume-upload' className='link'>MockInterview</Link></p>
                <p onClick={handleProfileClick}>Profile</p>
            </div>
        </div>
    </div>
  );
};

export default Header;