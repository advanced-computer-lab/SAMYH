import './css/style.css'
import react, {useEffect,useState} from "react";
import { Route, Redirect, useLocation } from "react-router-dom";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import { css} from '@emotion/css'

import * as React from 'react';

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import DateMomentUtils from '@date-io/date-fns';
import {
  DatePicker,
  TimePicker,
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from '@mui/material/FormControl';
import Select , { SelectChangeEvent } from '@mui/material/Select';
import { flexbox } from '@mui/system';
import { alpha } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Box from '@mui/material/Box';
import ManIcon from '@mui/icons-material/Man';
import ChildCareIcon from '@mui/icons-material/ChildCare';

import NavBar from './Helper/NavBar';                     // rendering in return statement (responsible for session checking & returning of current user email)

function User(){      //for USER & GUEST

   /*  
const [from, setfrom] = useState();          // easiest way to accept input (no need to put name & value attributes to the input field)
function handleChange1(event){               // all you need: 
setfrom(event.target.value);                 // 1) make a useState variable (actual variable & setter) for each input 
}                                            // 2) Make a handelchange method that uses the setter of the usestate variable to set the variable with new value (that you get by event.target.value) 
                                             //     (call in the onChange attribute of the input field -> onChange={handlechange})
*/

const location = useLocation();
const history = useHistory();
axios.defaults.withCredentials = true;
    
//Inputs

const [from, setFrom] = useState();
function handleFrom(event,value){  setFrom(value);   }             // accepting input from material ui autocomplete (on change function has extra paramenter: value)

const [to, setTo] = useState();
function handleTo(event,value){  setTo(value);   }   
 
const [cabin, setCabin] = useState('');
function handleCabin(event){   setCabin(event.target.value);  }               

const [departureDate, setDeparture] = useState(new Date());

const [returnDate, setReturn] = useState(new Date());

//seats
var [adults,setAdults]=useState(0);
var [children,setChildren]=useState(0);

const seats=adults+children;

function handleAdultsPlus(event){
  if (adults+children<9)
  setAdults(adults+=1);
}
function handleAdultsMinus(event){
  if (adults>0)
  setAdults(adults-=1);
  }

function handleChildrenPlus(event){
  if (adults+children<9)
    setChildren(children+=1);
  }
function handleChildrenMinus(event){
  if (children>0)
    setChildren(children-=1);
   }   



function convertDate(date){
var dd = String(date.getDate()).padStart(2, '0');
var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = date.getFullYear();

var x = yyyy + '-' + mm + '-' +dd ;
return x;
}


function handleclick1(event){
    event.preventDefault();
  
 if (from=="" || to=="" || cabin =="" || adults+children ==0 )
 alert ("All search fields are required");
 else{   
var d= convertDate(departureDate);
var r= convertDate(returnDate);

var input= {from: from , to: to , departure: d , return: r, cabin: cabin , adultSeats: adults, childrenSeats: children };

//Getting departure flights, return flights, & price for each all at once (passed to other front end pages using history.push)
axios.post('http://localhost:8000/searchFlightUser', input).then(res =>{ 
    if (res.data == 1)
       alert("No results, Please Search again");
       else{
     console.log(res.data);
     history.push({
       pathname: '/FlightSelector',
       state: {matchedFlights: res.data, search: input}
     })
   
}
})

}
}


const options = [ "LAX (Los Angeles International Airport, California, USA)",  
  "JFK (John F. Kennedy International Airport, New York, USA)", 
  "LHR (Heathrow Airport, London, England)",  
  "CAI \n(Cairo International Airport, Cairo, Egypt)",
  "DXB (Dubai International Airport, Dubai, UAE)",  
  "CDG (Paris Charles de Gaulle Airport, Paris, France)",  
  "MUC (Munich International Airport, Munich, Germany)",  
  "RUH (King Khalid International Airport, Riyadh, Saudi Arabia)",  
  "YYZ (Toronto Pearson International Airport, Toronto, Canada)",  
  "FRA (Frankfurt Airport, Frankfurt, Germany)"  
];




var xxx=["x"];

return ( 
<div id='container2'  className={css` background-color:white; height: 1000px;' `} >
  
   <div name="content">
      <div id='container' className={css` color: white; position: absolute; width: 100%; height: 620px; `} style={{backgroundImage: 'url("/wall5.jpg")'}}>
          <NavBar state1="landingPage"/> 
          <div class="overlay">       <div class="text">Fly Safe.</div>     </div>
      </div>
     
<form className={css`
  box-shadow: 0px 0px 100px 1px lightGray; position: absolute; left: 12%; top:73%; background-color:white; border-radius: 20px; 
  width: 75%;  padding: 20px; font-family: 'Josefin Sans';  font-size: 10px;`} >  
  
&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

<div className={css`display:flex;`}>

<Autocomplete  inputValue={from} onInputChange={handleFrom} options={options} sx={{ width: 400 }}
renderInput={(params) => <TextField  {...params}  label="From" />}  />
 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   <img src="/rt2.png" alt="" /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

<Autocomplete  inputValue={to} onInputChange={handleTo} options={options} sx={{ width: 400 }} 
renderInput={(params) => <TextField  {...params}  label="To" />} />
 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 


<MuiPickersUtilsProvider utils={DateMomentUtils}>

<KeyboardDatePicker variant="inline" inputVariant="outlined"  label="Departure" value={departureDate} onChange={setDeparture} InputAdornmentProps={{ position: "start" }} />
&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
<KeyboardDatePicker variant="inline" inputVariant="outlined" label="Return" value={returnDate} onChange={setReturn} InputAdornmentProps={{ position: "start" }} />

</MuiPickersUtilsProvider>

</div>
        
 
 <br></br>
    <div style={{display:'flex'}}>
    <FormControl>
    <InputLabel >Cabin</InputLabel>
        <Select value={cabin} label="Cabin" sx={{width: 150}} onChange={handleCabin} >
         <MenuItem value="Economy">Economy</MenuItem>
          <MenuItem value="Business">Business</MenuItem>
          <MenuItem value="First">First</MenuItem>
        </Select> 
      </FormControl>


 &nbsp;&nbsp;&nbsp;


 <FormControl>
    <InputLabel> Seats<br></br><br></br>
    <label style={{color: "black", fontSize: '22px'}}>{adults} Adults, {children} Children</label>
    </InputLabel>
        <Select multiple value={xxx} label="Seats" sx={{width: 400}}>
        
      <div style={{padding:"15px"}}>  
        
      <ManIcon style={{ transform: 'scale(1.5)'}}/>&nbsp;&nbsp;<label>Adults (12+ years)</label> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <ButtonGroup variant="outlined" aria-label="outlined button group">
        <Button onClick={handleAdultsMinus}>-</Button>
        <Button>{adults}</Button>
        <Button onClick={handleAdultsPlus}>+</Button>
      </ButtonGroup>
      <br></br> <br></br>
      <ChildCareIcon /> &nbsp;<label>Children (2-11 years)</label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <ButtonGroup variant="outlined" aria-label="outlined button group">
        <Button onClick={handleChildrenMinus}>-</Button>
        <Button>{children}</Button>
        <Button onClick={handleChildrenPlus}>+</Button>
      </ButtonGroup>
      </div>

        </Select>
      </FormControl>

   
      

<input style={{position: "absolute", left: "75%", top: "60%"}} 
class="btn btn-primary btn-lg" type="submit" value='Search Flights' onClick={handleclick1} /> 
</div>
</form>  

</div>
   
</div>

)} 

export default User;
