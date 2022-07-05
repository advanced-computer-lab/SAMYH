import '../css/style2.css';
import React, {useState} from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import NavBar from '../Helper/NavBar';
import { css} from '@emotion/css'


import AccountCircle from '@mui/icons-material/AccountCircle';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import LockIcon from '@mui/icons-material/Lock';
import NumbersRoundedIcon from '@mui/icons-material/NumbersRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';


function SignUp(){
    const history = useHistory();
    const [input, setInput] = useState({     //attribute names should be lowercase that will be use in the return statement {input.attributename} (for handle change to work & accept inputs) 
        firstname:"", lastname:"", email: "", password: "", countryCode:"", phoneNo:"", passportNo:"", address:"" 
    })




function handleChange(event){
    const {name,value}=event.target;

    setInput(prevInput => {
        return {
            ...prevInput,
            [name]:value
        }
    })
    
}

function handleclick(event){
    event.preventDefault();
console.log(input);
    if (input.firstname!="" && input.lastname!="" && input.email!= "" && input.password!= "" && input.countryCode!="" && 
    input.phoneNo!="" && input.passportNo!="" && input.address!="" ) { 
    axios.post('http://localhost:8000/addUser', input).then( res => {
        if (res.data==1){
        alert("E-Mail Address Already Exists!  \nPlease use another E-Mail address");  // alert message with line break
        history.push({
        pathname: '/SignUp' 
        });
        
        }
        if (res.data==0){
        alert("Registration Successfully Done!");
        history.push({
            pathname: '/SignIn' 
            });
        }
        });
    }
    else
    alert("All fields are required")
}

function handleclick2(event){
    event.preventDefault();
     history.push({pathname: "/SignIn" });
} 

return (
    <div className={css` font-family: 'Josefin Sans'; `} > 
    
    <div style={{display:"flex", height:"875px"}}>
    
    
    <div name="SignUp" className={css` width: 70%; `}> 
    
    <NavBar state1="Form"/>
    
    
    <form className={css` box-shadow: 0px 0px 100px 1px lightGray; position: absolute; left: 20%; top:22%; 
    background-color:white; border-radius: 20px; padding: 40px; font-family: 'Josefin Sans';  font-size: 10px; 
    transform:scale(1.3); color:#2C85B8; `} >
    <h1>Sign Up</h1>    <br></br> <br></br> <br></br>  
    
    <div style={{display:"flex"}}>

    <div>
    <Input className={css` width: 300px; `} startAdornment={<InputAdornment position="start"> <AccountCircle  /> </InputAdornment> }
       onChange={handleChange} name="firstname" type="text" value={input.firstname} placeholder='First Name'/> 
       <br></br> <br></br> <br></br><br></br>
       <Input className={css` width: 300px; `} startAdornment={<InputAdornment position="start"> <HomeRoundedIcon/> </InputAdornment> }
     onChange={handleChange} name="address" type="text" value={input.address} placeholder='Address' />  
        <br></br> <br></br> <br></br> <br></br> 
     
        <Input className={css` width: 300px; `} startAdornment={<InputAdornment position="start"> <NumbersRoundedIcon /> </InputAdornment> }
     onChange={handleChange} name="countryCode" type="number" value={input.countryCode} placeholder='Country Code' />   
       <br></br> <br></br> <br></br><br></br>
    <Input className={css` width: 300px; `} startAdornment={<InputAdornment position="start"> <AccountCircle  /> </InputAdornment> }
        onChange={handleChange} name="email" type="text" value={input.email} placeholder='Email' />
       <br></br> <br></br> <br></br><br></br>
   
        </div>
           
    &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <div>
      <Input className={css` width: 300px; `} startAdornment={<InputAdornment position="start"> <AccountCircle /> </InputAdornment> }
        onChange={handleChange} name="lastname" type="text" value={input.lastname} placeholder='Last Name' />
        <br></br> <br></br> <br></br> <br></br> 
 
        <Input className={css` width: 300px; `} startAdornment={<InputAdornment position="start"> <NumbersRoundedIcon  /> </InputAdornment> }
     onChange={handleChange} name="passportNo" type="text" value={input.passportNo} placeholder='Passport No'/> 
       <br></br> <br></br> <br></br><br></br>
      
    
    
      
    <Input className={css` width: 300px; `} startAdornment={<InputAdornment position="start"> <NumbersRoundedIcon /> </InputAdornment> }
       onChange={handleChange} name="phoneNo" type="number" value={input.phoneNo} placeholder='Phone Number'/>  
        <br></br> <br></br> <br></br> <br></br> 
           
    <Input className={css` width: 300px; `} startAdornment={<InputAdornment position="start"> <LockIcon /> </InputAdornment> }
        onChange={handleChange} name="password" type="password" value={input.password} placeholder='Password'/>
        <br></br> <br></br> <br></br> <br></br> 


    </div> 
    </div>
    <br></br>
    
    
    <div style={{textAlign:"center"}}>
    <input className="btn btn-primary btn-lg" style={{borderRadius: "40px",  width:"300px"}} type="submit" value="Sign Up" onClick={handleclick} /> 
    </div>

   
    </form>
    
    </div>
    
    <div name="SignIn" class="c" >
    <div style={{transform:'scale(1.3)', width:'400px'}}>
    <h1>Already Have An Acount?</h1> <br></br> <br></br> 
    <button className="btn btn-light btn-lg" style={{borderRadius: "40px",  width:"300px"}}  onClick={handleclick2} > Sign In </button>  
    </div>
    </div>
    
    
    </div>
    
    </div>
    )

} 

export default SignUp;
