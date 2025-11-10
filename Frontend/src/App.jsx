import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/Landing.jsx";
import Home from "./pages/home.jsx";
import Authentication from "./pages/Authentication.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import VideomeetComponent from "./pages/videomeet.jsx"

function App() {

  return (
    <>
      <Router>
        <AuthProvider>
        <Routes>
          {/* <Route path='/home' element/> */}
          <Route path='/' element={<LandingPage/>}/>
          <Route path='/auth' element={<Authentication/>}/>
          <Route path='/:url' element={<VideomeetComponent/>}/>
          <Route path='/home' element={<Home/>}/>

        </Routes>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App
