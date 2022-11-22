import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Register.css";
import { useHistory, Link } from "react-router-dom";

const Register = () => {
  const { enqueueSnackbar } = useSnackbar();

  let  history=useHistory();
  /**
   * Definition for register handler
   * - Function to be called when the user clicks on the register button or submits the register form
   *
   * @param {{ username: string, password: string, confirmPassword: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/register"
   *
   * Example for successful response from backend for the API call:
   * HTTP 201
   * {
   *      "success": true,
   * }
   *
   * Example for failed response from backend for the API call:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Username is already taken"
   * }
   * 
   */
  let [start,setStart]=useState("Register Now");
  const getdata= ()=>{
    let name=document.getElementById('username').value;
    let password=document.getElementById('password').value;
    let confirmPassword=document.getElementById('confirmPassword').value;
  

    
    register({"username":name,"password":password,"confirmPassword":confirmPassword});
    if(register.success===false) enqueueSnackbar(register.message,{variant: 'error',persist:false});
    else if(register.success===true) enqueueSnackbar("Registered successfully",{variant: 'success'}); 
    
  }


  const register = async (formData) => {

    setStart(start=<CircularProgress/>);

    if(validateInput(formData))
    axios.post(config.endpoint +'/auth/register',{
      "username":formData.username,
      "password":formData.password
    }).then((res)=>{
      enqueueSnackbar("Registered Successfully",{variant: 'success',persist:false});
      history.push("/login",{from:"login"});
    }).catch(error=>{
      if(error.response)
      enqueueSnackbar(`${error.response.data.message}`,{variant: 'error',persist:false});
    });

    setStart(start="Register Now");
    return "null";
  };

  // TODO: CRIO_TASK_MODULE_REGISTER - Implement user input validation logic
  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string, confirmPassword: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that username field is not less than 6 characters in length - "Username must be at least 6 characters"
   * -    Check that password field is not an empty value - "Password is a required field"
   * -    Check that password field is not less than 6 characters in length - "Password must be at least 6 characters"
   * -    Check that confirmPassword field has the same value as password field - Passwords do not match
   */
   
  const validateInput = (data) => {
    let name=data.username;
    let pass=data.password;
    let conform=data.confirmPassword;

    if(name.length===0){
      enqueueSnackbar("Username is a required field",{variant: 'error',persist:false});
      return false;
    }
    if(name.length<6){
      enqueueSnackbar("Username must be at least 6 characters",{variant: 'error',persist:false});
      return false;
    }
    if(pass.length===0){
      enqueueSnackbar("Password is a required field",{variant: 'error',persist:false});
      return false;
    }
    if(pass.length<6){
      enqueueSnackbar("Password must be at least 6 characters",{variant: 'error',persist:false});
      return false;
    }
    if(pass!==conform){
      enqueueSnackbar("Passwords do not match",{variant: 'error',persist:false});
      return false;
    }
    return true;
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons={undefined} />
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Register</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Enter Username"
            fullWidth
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
          />
          <TextField
            id="confirmPassword"
            variant="outlined"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
          />
            <Button className="button" variant="contained" onClick={getdata}>
            {start}
           </Button>
           
          <p className="secondary-action">
            Already have an account?{" "}
             <a className="link" href="#">
              Login here
             </a>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Register;
