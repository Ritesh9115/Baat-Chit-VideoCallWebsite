import React, { useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

import "../auth.css";
import {
  Box,
  Button,
  Checkbox,
  CssBaseline,
  FormControlLabel,
  FormLabel,
  TextField,
  Typography,
  Stack,
  Card,
  Snackbar,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// DARK THEME
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "hsl(188, 91.10%, 44.10%)",
    },
  },
});

export default function Authentication() {
  const [formState, setFormState] = useState(0); // 0 = Sign In, 1 = Sign Up

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [message, setMessage] = useState("");
    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");
    const { handleRegister,handleLogin } = useContext(AuthContext);




  // SIMPLE VALIDATION
//   const validateInputs = () => {
//     let valid = true;

//     if (!password || password.length < 6) {
//       setPasswordError(true);
//       setPasswordErrorMessage("Min 6 characters");
//       valid = false;
//     } else {
//       setPasswordError(false);
//       setPasswordErrorMessage("");
//     }

//     return valid;
//   };
    const handleButton0 =()=>{
      setFormState(0);
      setName("");
      setUsername("");
      setPassword("");
      setError("");
    }
    const handleButton1 =()=>{
      setFormState(1);
      setName("");
      setUsername("");
      setPassword("");
      setError("");
    }
  const handleSubmit = async(e) => {
    e.preventDefault();
    // if (!validateInputs()) return;
    setUsername("");
    setPassword("");
    setName("");

    try{
        if (formState === 0) {
        let result = await handleLogin(username,password);
        console.log(result);
        console.log(username,password);
    } else {
      let result = await handleRegister(name,username,password);
      console.log(result);
      setError("");
      setMessage(result);
      setOpen(true);
      setFormState(0);

    }}catch(err){
        let message = (err.response.data.message);
        setError(message);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
          background:
            "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(https://images.unsplash.com/photo-1511467687858-23d96c32e4C8?auto=format&fit=crop&w=2070&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: "450px",
            p: 4,
            borderRadius: 4,
            backdropFilter: "blur(16px) saturate(180%)",
            backgroundColor: "rgba(12, 15, 19, 0.75)",
            border: "1px solid rgba(255, 255, 255, 0.125)",
          }}
        >
          {/* HEADER */}
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button
              fullWidth
              variant={formState === 0 ? "contained" : "outlined"}
              onClick={handleButton0}
              sx={{ py: 1.3, fontWeight: 700 }}
            >
              Sign In
            </Button>

            <Button
              fullWidth
              variant={formState === 1 ? "contained" : "outlined"}
              onClick={handleButton1}
              sx={{ py: 1.3, fontWeight: 700 }}
            >
              Sign Up
            </Button>
          </Stack>

          <Typography
            variant="h4"
            sx={{ textAlign: "center", mb: 3, fontWeight: 700 }}
          >
            {formState === 0 ? "Welcome Back" : "Create Account"}
          </Typography>

          {/* FORM */}
          <Box component="form" onSubmit={handleSubmit} autoComplete="off">
            <Stack spacing={2}>
              {/* SIGN UP ONLY: FULL NAME */}
              {formState === 1 && (
                <>
                  <FormLabel>Full Name</FormLabel>
                  <TextField
                    fullWidth
                    required
                    placeholder="Full Name *"
                    label="Full Name"
                    value={name}
                    autoFocus = {formState == 0 ? false : true}
                    onChange={(e) => setName(e.target.value)}
                  />
                </>
              )}

              {/* USERNAME */}
              <FormLabel>Username</FormLabel>
              <TextField
                fullWidth
                required
                placeholder="Username *"
                label="Username"
                autoFocus = {formState == 1 ? false : true}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              {/* PASSWORD */}
              <FormLabel>Password</FormLabel>
              <TextField
                fullWidth
                required
                placeholder="••••••"
                type="password"
                label="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={passwordError}
                helperText={passwordErrorMessage}
              />

              {/* REMEMBER ME */}
              {formState === 0 && (
                <FormControlLabel
                  control={<Checkbox />}
                  label="Remember me"
                />
              )}
              <p style={{color:"red"}}>{error}</p>

              {/* SUBMIT BUTTON */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ py: 1.4, fontWeight: 700, mt: 1 }}
                onClick={handleSubmit}
              >
                {formState === 0 ? "Sign In" : "Sign Up"}
              </Button>
            </Stack>
          </Box>
        </Card>
      </Box>
      <Snackbar
        open = {open}
        autoHideDuration={4000}
        message={message}
      />

    </ThemeProvider>
  );
}
