import React from 'react'
import "../App.css"
import { Link } from "react-router-dom";


function LandingPage() {
    const guest = ()=>{
        window.location.href = "/home";
    }
    return (
        <>
        <div className="landingPageContainer">
            <nav>
                <div className="navHeader">
                    <h2>Baat Chit</h2>
                </div>
                <div className="navlist">
                    <p role='button' onClick={guest}>Join as Guest</p>
                    <div role='button'>
                        <Link style={{textDecoration: "none", color:"beige"}} to={"/auth"}>Login</Link>
                    </div>
                </div>
            </nav>

        <div className="landingMainContainer">
            <div className='bigHeading'>
                <h1 >
                    <span style={{color: "rgb(235, 135, 14)"}}>Feel closer</span>, even miles apart
                </h1>
                <p style={{marginTop: "1rem"}}>Do <span style={{color: "rgb(235, 135, 14)"}}>Baat Chit</span> face-to-face, heart-to-heart</p>
                <div className='linkStart'>
                    <Link style={{textDecoration: "none", color:"rgb(0, 0, 0)"}} to={"/auth"}>Get Started</Link>
                </div>
            </div>
            <div>
                <img src="/Iphone.png" alt="Mobile Image" />
            </div>
        </div>

        </div>
        </>
    )
}

export default LandingPage
