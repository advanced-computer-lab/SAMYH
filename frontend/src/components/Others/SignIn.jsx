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



function SignIn(){
    axios.defaults.withCredentials = true; // (write inside big function of component/page) instead of adding  {withCredentials: true} (beside url request) to each axios request
    // Like this ->  axios.post('http://localhost:8000/SignIn', user, {withCredentials: true})

    const history = useHistory();
    const [input, setInput] = useState({     //attribute names should be lowercase (for handle change to work & accept inputs) 
        email: "" , password: "" 
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
const [x,setUser]=useState();

function handleclick(event){
    event.preventDefault();
    
    if(input.email!="" && input.password!="") {
    const user= {Email : input.email , Password : input.password  }  ;
    
    axios.post('http://localhost:8000/SignIn', user)
    .then(res => {
        console.log(res.data);
        if (res.data==0)
        alert("Wrong Email or Password!");
        if (res.data==1)
        history.push({
        pathname: "/" });
        if (res.data==2)
        history.push({
        pathname: "/Admin" });
    }  )
}
else  alert("Please Enter Username & Password!");
} 

function handleclick2(event){
    event.preventDefault();
     history.push({pathname: "/SignUp" });
} 

return (
<div className={css` font-family: 'Josefin Sans'; `} > 

<div style={{display:"flex", height:"875px"}}>


<div name="SignIn" className={css` width: 70%; `}> 

<NavBar state1="Form"/>

<form className={css` box-shadow: 0px 0px 100px 1px lightGray; position: absolute; left: 28%; top:29%; 
background-color:white; border-radius: 20px; padding: 40px; font-family: 'Josefin Sans';  font-size: 10px; 
transform:scale(1.3); color:#2C85B8; `} >
<h1>Sign In</h1>    <br></br> <br></br> <br></br>  

<Input className={css` width: 300px; `} startAdornment={<InputAdornment position="start"> <AccountCircle  /> </InputAdornment> }
    onChange={handleChange} name="email" type="text" value={input.email} placeholder='Email'/> <br></br> <br></br> <br></br><br></br>
  
<Input className={css` width: 300px; `} startAdornment={<InputAdornment position="start"> <LockIcon /> </InputAdornment> }
    onChange={handleChange} name="password" type="password" value={input.password} placeholder='Password'/><br></br> <br></br> <br></br> <br></br> 
    
<br></br><br></br>
<input className="btn btn-primary btn-lg" style={{borderRadius: "40px",  width:"300px"}} type="submit" value="Sign In" onClick={handleclick} /> 

</form>

</div>

<div name="SignUp" class="c" >
<div style={{transform:'scale(1.3)', width:'400px'}}>
<h1>New Here?</h1> <br></br> <br></br> 
<button className="btn btn-light btn-lg" style={{borderRadius: "40px",  width:"300px"}}  onClick={handleclick2}> Sign Up </button> 
</div>
</div>


</div>

</div>
)
} 

export default SignIn;
