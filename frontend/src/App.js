import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useLocation } from "react-router-dom";


const App = () => {
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  return (
    
    <div className={isHomePage ? "home-screen" : ''}>
      <Header />
      <main className='py-3'>
        <Container>
          <Outlet />
        </Container>
      </main>
      <Footer />
      <ToastContainer />
    </div>
      
    
  );
};
export default App;
