import 'bootstrap/dist/css/bootstrap.min.css'
import react, {useEffect,useState} from "react";
import { Route, Redirect, useLocation } from "react-router-dom";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';                  // rendering in return statement (responsible for session checking & returning of current user email)
import { Modal} from 'react-bootstrap';
import { css} from '@emotion/css'
import NavBar from '../Helper/NavBar';   

import AccountCircle from '@mui/icons-material/AccountCircle';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import LockIcon from '@mui/icons-material/Lock';
// rendering in return statement (responsible for session checking & returning of current user email)
require("react-bootstrap/ModalHeader");


function EditProfile(){            
    const location = useLocation();
    const history = useHistory();
 
//Inputs
    const [input, setInput] = useState({ firstName: "", lastName: "" , email:"" , password:"" , oldPassword:"", password:"" });

    function handleChange(event){
        const {name,value}=event.target;
    
        setInput(prevInput => {
            return {
                ...prevInput,
                [name]:value
            }
        })
        
    }
  
//Accepting Inputs

    function handleclick(event){
        event.preventDefault();
         history.push({pathname: '/user'});    
    }

    function handleclick1(event){
        event.preventDefault();
        if (input.email!="" && input.password!="" && input.oldPassword!="" ){
            
            console.log(input);     
            axios.post('http://localhost:8000/Updateinfo', input).then(res =>{
            if (res.data==0)  alert("Email already used, use a different email")  // email already used
            
            else if (res.data.status==1){        // succesful update
           
            alert('Account Info Updated Successfully')
            var article2={oldEmail: res.data.oldEmail }
            axios.post('http://localhost:8000/UpdateBookingUser',article2).then(history.push({pathname: '/'}))  // post request nead old email (get from backend)
            }
            else if (res.data==2)  alert("Wrong Old Password");  // wrong old password
          
           });
      }
        else
        alert("Please fill all fields");
        }      
       
//------------------------------------------------------------


return (
    <div className={css` font-family: 'Josefin Sans'; `} > 
    
    <div style={{display:"flex", height:"875px"}}>
    
    
    <div name="SignIn" className={css` width: 100%; background-color:#2C85B8;`}> 
    
    <NavBar state1="Page"/>
    
    <form className={css`  position: absolute; left: 30%; top:30%; 
    background-color:white; border-radius: 20px; padding: 40px; font-family: 'Josefin Sans';  font-size: 10px; 
    transform:scale(1.2); color:#2C85B8; `} >
    <h1>Edit Profile</h1>    <br></br> <br></br>  
 
     <Input className={css` width: 300px; `} startAdornment={<InputAdornment position="start">  <AccountCircle  /></InputAdornment> }
       onChange={handleChange} name="email" type="text" value={input.email} placeholder="New Email" /> <br></br> <br></br> <br></br><br></br>
        
   
    <Input className={css` width: 300px; `} startAdornment={<InputAdornment position="start">  <LockIcon /> </InputAdornment> }
        onChange={handleChange} name="oldPassword" type="password" value={input.oldPassword} placeholder="Old Password"/>  &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;
      
    <Input className={css` width: 300px; `} startAdornment={<InputAdornment position="start"> <LockIcon /> </InputAdornment> }
       onChange={handleChange} name="password" type="password" value={input.password} placeholder="New Password" />  <br></br> <br></br> <br></br><br></br>
        
    <br></br>
    <div style={{textAlign: "center"}}>
    <input className="btn btn-primary btn-lg" style={{borderRadius: "40px",  width:"300px"}} type="submit" value="Update" onClick={handleclick1} /> 
    </div>
    </form>


  
    
    </div>
    
 
    
    
    </div>
    
    </div>
    )


} 

export default  EditProfile;
