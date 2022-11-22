import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack, TextField, InputAdornment } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import Box from "@mui/material/Box";
import { spacing } from "@mui/system";
import React from "react";
import { useHistory } from "react-router-dom";
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons }) => {
  let history=useHistory();
    return (
      <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        {
          children
        }
        { hasHiddenAuthButtons===undefined &&
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={()=>history.push("/")}
        >
          Back to explore
        </Button>}

          {
            hasHiddenAuthButtons===true &&
            <Stack
                direction={"row"}
                spacing={3}
            >
            
            <div><Avatar src="../../public/avatar.png" alt={localStorage.getItem("username")} /></div>
            <div className="username-text">{localStorage.getItem("username")}</div>
            <div><Button className="login-button" variant="contained" onClick={()=>{localStorage.clear();window.location.reload();history.push("/");}}>Logout</Button></div>
            </Stack>
            
          }
          {
            hasHiddenAuthButtons===false && 
            <Stack
              direction={"row"}
              spacing={3}
            >
              <div>
                <Button className="register-button" variant="contained" onClick={()=>{history.push("/register",{from:"/"})}}>Register</Button>  
              </div>
              <div>
                <Button className="login-button" variant="text" onClick={()=>{history.push("/login",{from:"/"})}}>Login</Button> 
              </div>
            </Stack>
          }
      </Box>
    );
};

export default Header;
