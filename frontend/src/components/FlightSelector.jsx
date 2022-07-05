import react, {useEffect,useState} from "react";
import { Route, Redirect, useLocation } from "react-router-dom";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";

import { css} from '@emotion/css'
import Checkbox from '@mui/material/Checkbox';


import NavBar from './Helper/NavBar';                    // rendering in return statement (responsible for session checking & returning of current user email)
import SeatSelector from './Helper/SeatSelector';
import Divider from '@mui/material/Divider';

import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LuggageIcon from '@mui/icons-material/Luggage';

function FlightSelector(){           //for USER & GUEST

    const location = useLocation();
    const history = useHistory();
    axios.defaults.withCredentials = true;
    
    var flag=false;
 
    if (location.state!=null){           //checking if user searched for a flight & variables were passed, //passed state variable (search criteria)
        flag=true;   
     }
   else{
   alert("Please search for a flight to book first");
   history.push({ pathname: '/' });
   window.location.reload();
   }


// --------------------------------------------------------------------------------------------------

var search= location.state.search // search input sent from user.jsx page
var data= location.state.matchedFlights; // flights (departure & return) that meet the search criteria (respone of post request on user.jsx) sent from  user.jsx
var departureFlights=data.departureFlightsAndPrices;
var returnFlights=data.returnFlightsAndPrices;

//Derived Inputs
var from= search.from; var fromCode= from.substr(0,3); var fromFull= from.substr(5,from.length-6);
var to= search.to; var toCode= to.substr(0,3); var toFull= to.substr(5,to.length-6);

var cabin= search.cabin;
var totalseats= search.adultSeats + search.childrenSeats;


const [selectedDepartureFlight,setSelectedDepartureFlight]=useState();
const [selectedReturnFlight,setSelectedReturnFlight]=useState();

const [depButtonID,setDepButtonID]=useState(-1);    // for div styling of departure flight selected
const [retButtonID,setRetButtonID]=useState(-1);    // for div styling of departure flight selected

function handleclick2(event){    
    console.log(departureFlights);          // handle click of departure flight
    event.preventDefault();
    var id = event.target.id;             //contains the index of matched flights
                     
    setSelectedDepartureFlight(departureFlights[id]); // the whole flight object
    setDepButtonID(id);

    console.log(id + "D");
    console.log(selectedDepartureFlight +"D");//  
   }
 
   function handleclick3(event){              // handle click of return flight
    event.preventDefault();
    var id = event.target.id;              //contains the index of matched flights
                     
    setSelectedReturnFlight(returnFlights[id]); // the whole flight object
    setRetButtonID(id);  

    console.log(id + "R");
    console.log(selectedReturnFlight + "R");
   }

//---------------------------------------------------------

//--Choose Seat button functionality

  const [clicked,setClicked]= useState(false); 
  const [state1,setState1]= useState({});

function handleclick4(event){
    event.preventDefault();

    if(selectedDepartureFlight== undefined || selectedReturnFlight== undefined ){
        alert("Please Select a Departure Flight & a Return Flight");
        }
    else {
    console.log({selectedDepartureFlight: selectedDepartureFlight,  selectedReturnFlight: selectedReturnFlight });
   var object1= { 
    booking: {selectedDepartureFlight: selectedDepartureFlight,  selectedReturnFlight: selectedReturnFlight },
    search: search,
    searchResults: data
}

    setState1(object1);
    setClicked(true);  // for show seats dialog

    /* history.push({
    
        pathname: '/Booking',
        state: { 
            booking: {selectedDepartureFlight: selectedDepartureFlight,  selectedReturnFlight: selectedReturnFlight },
            search: search,
            searchResults: data
        }}); */
        
     
     console.log({ 
        booking: {selectedDepartureFlight: selectedDepartureFlight,  selectedReturnFlight: selectedReturnFlight },
        search: search,
        searchResults: data
    })
   }
 
}





return (
<div>
    <NavBar state1="Page"/>

    <div  name="content" className={css`
    position: absolute; left: 7%; top: 15%; border-radius: 20px; 
    font-family: 'Josefin Sans'; font-size: 15px; width:1500px;  text-align:center;  ` }>
    
    <div name="departureFlightGeneralInfo" className={css`color:	#2C85B8;` }>
    
    <label>
    <div name="from->to" style={{display:"flex"}}>
    
    <div name="From Label">
    <label className={css` font-size: 30px; font-weight: bold; ` }>{fromCode}</label> <br></br>
    <label className={css` width:450px; ` }> {fromFull} </label>
    </div>
    
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
    <div name="plane_date" style={{color:'grey'}}> 
    
    <img src="/airplane.png"/>  <br></br><br></br>
    <label>Departure Flight</label> <br></br>
    <label>{  (new Date(search.departure)+"").substr(0,15) }</label>
       
     </div>
     &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
    
    <div name="To Label">
    <label className={css` font-size: 30px; font-weight: bold; ` }>{toCode}</label> <br></br>
    <label className={css` width:450px; ` }> {toFull} </label>
    </div>
     
    
     </div>
     </label>
     
     </div> <br></br>

     {departureFlights.map((flight,i) =>
       <a>

<label name="everyFlight"  className={css`  border-radius: 20px; padding: 20px; font-size: 20px; font-weight: normal;  
       box-shadow: 0px 0px 10px 1px lightGray; text-align:left; width:900px; height:150px;
 `}>
<div className={css`  display:flex;`}> 

<div className={css`  width:77%;`}> 

<div className={css`  display:flex; padding:10px; `}> 

<div className={css`   width: 24%;`}> <FlightTakeoffIcon className={css`  color:#2C85B8; transform: scale(2.5);`}/> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<a className={css` font-size: 30px;`} >{flight.FlightDetails.Departure}</a> </div>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

<div className={css`  text-align:center; color:gray; width: 33%; `}> <AccessTimeIcon/> <br></br>
{flight.FlightDetails.Duration}  </div>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

<div> <FlightLandIcon className={css` color:#2C85B8; transform: scale(2.5);`}/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
 <a className={css` font-size: 30px;`} >{flight.FlightDetails.Arrival} </a> </div>

</div>

 
<div className={css`  display:flex; color:gray; text-align:center;`}> 

<div className={css`   width: 60%;  `}> # {flight.FlightDetails.Flight_No} </div>
<div> 
<LuggageIcon className={css`  transform: scale(1.3);`}/> 
{cabin=="First" && flight.FlightDetails.First_Class_BaggageAllowance}
{cabin=="Business" && flight.FlightDetails.Business_Class_BaggageAllowance} 
{cabin=="Economy" && flight.FlightDetails.Economy_Class_BaggageAllowance}  
</div>


</div>  

         
</div>
&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

<div name="price_selection" id={i}  style={{boxShadow: '0px 0px 10px 1px lightGray', borderRadius:'20px', padding:'10px', width:'20%', height:'120px', textAlign:'center' }}  
className= { (i == depButtonID) && css`background-color: #2C85B8;` }
 > 
<a>{flight.TotalPrice} EGP </a> <br></br> <br></br>
<button class='btn btn-primary' style={{borderRadius:'20px', width:"150px"}} id={i} onClick={handleclick2}> Select </button>
</div>


</div>
        
               
        
        </label>
        <br></br> <br></br>
      
      
      </a>
       )}


	 <Divider/> <br></br>


<div name="returnFlightGeneralInfo" className={css` text-align:center; color:	#2C85B8;` }>
 
   <label>
   <div name="from->to" style={{display:"flex"}}>
   
   <div name="From Label">
   <label className={css` font-size: 30px; font-weight: bold; ` }>{toCode}</label> <br></br>
   <label className={css` width:450px; ` }> {toFull} </label>
   </div>
   
  
   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
    <div name="plane_date" style={{color:'grey'}}> 
    
    <img src="/airplane.png"/>  <br></br><br></br>
    <label>Return Flight</label> <br></br>
    <label>{  (new Date(search.return)+"").substr(0,15) }</label>
       
     </div>
     &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
   
   <div name="To Label">
   <label className={css` font-size: 30px; font-weight: bold; ` }>{fromCode}</label> <br></br>
   <label className={css` width:450px; ` }> {fromFull} </label>
   </div>
    
   
    </div>
    </label>
      </div> <br></br>

      {returnFlights.map((flight,i) =>
       <a>

<label name="everyFlight"  className={css`  border-radius: 20px; padding: 20px; font-size: 20px; font-weight: normal;  
       box-shadow: 0px 0px 10px 1px lightGray; text-align:left; width:900px; height:150px;
 `}>
<div className={css`  display:flex;`}> 

<div className={css`  width:77%;`}> 

<div className={css`  display:flex; padding:10px; `}> 

<div className={css`   width: 24%;`}> <FlightTakeoffIcon className={css`  color:#2C85B8; transform: scale(2.5);`}/> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<a className={css` font-size: 30px;`} >{flight.FlightDetails.Departure}</a> </div>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

<div className={css`  text-align:center; color:gray; width: 33%; `}> <AccessTimeIcon/> <br></br>
{flight.FlightDetails.Duration}  </div>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

<div> <FlightLandIcon className={css` color:#2C85B8; transform: scale(2.5);`}/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
 <a className={css` font-size: 30px;`} >{flight.FlightDetails.Arrival} </a> </div>

</div>

 
<div className={css`  display:flex; color:gray; text-align:center;`}> 

<div className={css`   width: 60%;  `}> # {flight.FlightDetails.Flight_No} </div>
<div> 
<LuggageIcon className={css`  transform: scale(1.3);`}/> 
{cabin=="First" && flight.FlightDetails.First_Class_BaggageAllowance}
{cabin=="Business" && flight.FlightDetails.Business_Class_BaggageAllowance} 
{cabin=="Economy" && flight.FlightDetails.Economy_Class_BaggageAllowance}  
</div>


</div>  

         
</div>
&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

<div name="price_selection" id={i}  style={{boxShadow: '0px 0px 10px 1px lightGray', borderRadius:'20px', padding:'10px', width:'20%', height:'120px', textAlign:'center' }}  
className= { (i == retButtonID) && css`background-color: #2C85B8;` }
 > 
<a>{flight.TotalPrice} EGP </a> <br></br> <br></br>
<button class='btn btn-primary' style={{borderRadius:'20px', width:"150px"}} id={i} onClick={handleclick3}> Select </button>
</div>


</div>
        
               
        
        </label>
        <br></br> <br></br>
      
      
      </a>
       )}
       
    


<button class="btn btn-primary" onClick={handleclick4}>Select Seat(s)</button> <br></br> <br></br><br></br>
{clicked && <SeatSelector state1={state1}/>} 
    

    </div> 
</div>

);
}
export default FlightSelector;