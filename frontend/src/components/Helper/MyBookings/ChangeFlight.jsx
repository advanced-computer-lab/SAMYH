import react, {useEffect,useState} from "react";
import { Route, Redirect, useLocation } from "react-router-dom";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";

import { css} from '@emotion/css'
import Checkbox from '@mui/material/Checkbox';
import NewFlightSeats from "./NewFlightSeats";

import Divider from '@mui/material/Divider';

import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LuggageIcon from '@mui/icons-material/Luggage';


function ChangeFlight(props){           //helperComponent of BookingDetails
console.log(props);
//Needed Inputs   (passed form BookingDetails page)
var passedVariable= props.state.passed;
var search= props.state.search; // search input sent from user.jsx page
var data1= props.state.matchedFlights; // array of objects {FlightDetails: x, TotalPrice: x} ->flights that meet the search criteria (FlightDetails & Price) sent from  bookingDetails (when change flight is pressed)


//-----------

//Derived Inputs
var oldFlightNo= passedVariable.Flight.Flight_No; 
var data=[];

for (var i=0; i<data1.length; i++){
    if (data1[i].FlightDetails.Flight_No!= oldFlightNo)
    data.push(data1[i]);
}

//Derived
var Flights=data;
var cabin= search.cabin;
var totalseats= search.adultSeats + search.childrenSeats;



const [selectedFlight,setSelectedFlight]=useState();

const [buttonID,setButtonID]=useState(-1);    // for div styling of departure flight selected


function handleclick2(event){    
    console.log(Flights);          // handle click of departure flight
    event.preventDefault();
    var id = event.target.id;             //contains the index of matched flights
                     
    setSelectedFlight(Flights[id]); // the whole flight object
    setButtonID(id);

    console.log(id + "D");
    console.log(selectedFlight +"D");//  
   }

 


	const [clicked,setClicked]= useState(false); 
	const [state1,setState1]= useState({});

function handleclick4(event){ // choose seats button
    event.preventDefault();

    if(selectedFlight!= undefined){

      var data4={ 
         selectedFlight: selectedFlight,
         search: search,
         searchResults: data,
         passed: passedVariable
     };			// state passed (as object) passed to location.state (previously)
    
    setHelperShow(true);
    setState1(data4);         // set data first to ensure redering wont occur with empty data
    setClicked(true);


/*  history.push({                          // remove & call in return & pass props to NewFlightSeats 
        pathname: '/BookingUpdate',
        state: { 
            selectedFlight: selectedFlight,
            search: search,
            searchResults: data,
            passed: passedVariable
        }
     });  */
     
   // console.log({selectedFlight: selectedFlight, search: search, searchResults: data});
   }
   else
   alert("Please select a flight");
   

}

function handleCancel(event){
  event.preventDefault();
  window.location.reload();
}

const [helperShow,setHelperShow]=useState(false);


return (
<div className={css`  text-align: center; color: #2C85B8;
 `}>

   { helperShow==false &&
   <div name="Similar Flights" >
    <h3>Similar Flights</h3> <br></br>
       
      
       
     {Flights.map((flight,i) =>
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
{cabin.First_Class_BaggageAllowance} 
{cabin.FlightDetails.First_Class_BaggageAllowance} 
{cabin.FlightDetails.First_Class_BaggageAllowance} 
</div>


</div>  

         
</div>
&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

<div name="price_selection" id={i}  style={{boxShadow: '0px 0px 10px 1px lightGray', borderRadius:'20px', padding:'10px', width:'20%', height:'120px', textAlign:'center' }}  
className= { (i == buttonID) && css`background-color: #2C85B8;` }
 > 
<a>{flight.TotalPrice} EGP </a> <br></br> <br></br>
<button class='btn btn-primary' style={{borderRadius:'20px', width:"150px"}} id={i} onClick={handleclick2}> Select </button>
</div>


</div>
        
               
        
        </label>
        <br></br> <br></br>
      
      
      </a>
       )}


	   <br></br>
      <button class="btn btn-primary" onClick={handleclick4}>Select Seat(s)</button>
      &nbsp; &nbsp;
      <button className="btn btn-danger" onClick={handleCancel}>Cancel</button>
   </div>
}
       { clicked  && 
        <div name="helperDialog" > 
       
        <div className={css` height:600px; overflow:auto; `}>
        <NewFlightSeats state={state1}/>
        </div>

        </div>
        }
	   
       </div> 
);
}
export default ChangeFlight;