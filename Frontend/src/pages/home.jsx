import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button } from "@mui/material";
import "./Home.css"; // <-- Import the new CSS file

function Home() {
    const navigate = useNavigate();
    const [meetingcode, setMeetingcode] = useState("");
    const inputRef = useRef(null);

    // Auto focus input
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Generate random meeting code
    const createMeeting = () => {
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        navigate(`/${code}`);
    };

    // Join meeting
    const handleJoinVideoCall = () => {
        if (!meetingcode.trim()) return;
        navigate(`/${meetingcode.trim()}`);
    };

    // Enter key press
    const handleKey = (e) => {
        if (e.key === "Enter") {
            handleJoinVideoCall();
        }
    };

    const logout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "/";
    }

    return (
        <>
            {/* Re-using your landingPageContainer style */}
            <div className="homePageContainer">

                {/* Re-using your nav styles */}
                <nav>
                    <div className="navHeader">
                        <h2>Baat Chit</h2>
                    </div>
                    <div className="navlist">
                        <div role="button" onClick={logout}>
                            Logout
                        </div>
                    </div>
                </nav>

                {/* Re-using your landingMainContainer styles */}
                <div className="landingMainContainer">

                    {/* Re-using your bigHeading styles for the left panel */}
                    <div className="bigHeading">
                        <h1>
                            <span style={{ color: "rgb(235, 135, 14)" }}>Meet smarter. </span> Connect faster.
                        </h1>
                        <p style={{ marginTop: "1rem" }}>Meet without limits.</p>

                        {/* Input + Join Button */}
                        <div className="input-container">
                            <TextField
                                inputRef={inputRef}
                                label="Enter meeting code"
                                placeholder="Enter meeting code"
                                variant="outlined"
                                value={meetingcode}
                                onChange={(e) => setMeetingcode(e.target.value)}
                                onKeyDown={handleKey}
                                fullWidth
                                sx={{
                                    // Style the label
                                    '& label': {
                                        color: 'beige',
                                    },
                                    // Style the label when focused
                                    '& label.Mui-focused': {
                                        color: 'rgb(235, 135, 14)', // Your theme's orange
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        // Style the input text
                                        '& input': {
                                            color: 'beige',
                                        },
                                        // Style the placeholder
                                        '& input::placeholder': {
                                            color: 'beige',
                                            opacity: 0.7, // Placeholders are usually a bit faded
                                        },
                                        // Style the border
                                        '& fieldset': {
                                            borderColor: 'beige',
                                        },
                                        // Style border on hover
                                        '&:hover fieldset': {
                                            borderColor: 'white',
                                        },
                                        // Style border on focus
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'rgb(235, 135, 14)', // Your theme's orange
                                        },
                                    },
                                }}
                            />
                            <Button variant="contained" color="primary" onClick={handleJoinVideoCall}>
                                Join
                            </Button>
                        </div>

                        {/* Create new meeting */}
                        <div className="create-container">
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={createMeeting}
                            >
                                Create New Meeting
                            </Button>
                        </div>
                    </div>

                    {/* Adding the image back in to match the theme */}
                    <div>
                        <img src="/Iphone.png" alt="Mobile Image" />
                    </div>
                </div>
            </div>
        </>
    );
}

export default Home;