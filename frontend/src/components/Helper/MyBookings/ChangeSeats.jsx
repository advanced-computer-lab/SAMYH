import react, {useEffect,useState} from "react";
import { Route, Redirect, useLocation } from "react-router-dom";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import { css} from '@emotion/css'
import Checkbox from '@mui/material/Checkbox';


function ChangeSeats(props){           //helper component of booking details (which is a helper of MyBookings) (called for departure & return flight)
   const location = useLocation();
   const history = useHistory();
   axios.defaults.withCredentials = true;

   var flag=false;
   var confirmbookingclicked=false;

//-------------------------------------------

//Needed Inputs (pass in props)     // from BookingDetailsPage
var booking= props.state.Booking;
var Flight=props.state.Flight;   //needs flight  (as flight object only not with price)
var flightDirection= props.state.FlightDirection;

//Derived Inputs
var cabin= booking.Cabin;                                     // needs cabin
var totalseats= booking.AdultSeats + booking.ChildrenSeats;  //needs total seats

   
//---------------------------------------------------
var CabinSeatsArray; // cabin seats format array (that has indexes up to the max seats available on that cabin of all flights) (array of constant size, seats array gets aplied on it becuase to display cabin -> format should be the same for all flights)
var FlightSeatsArray; // seats array in every flight (that dictates the free (0) & occupied (1) seats) //Based on cabin (departureCabinSeatsArray & departureFlightSeatsArray {First,Business, or Economy})
var ChosenSeats=[];  // array of indexes of the chosen seats (checkboxes selected) (that will be chosen in this page)



if ( flightDirection=="DepartureFlight")  oldChosenSeats=booking.DepartureChosenSeats;
if ( flightDirection=="ReturnFlight")     oldChosenSeats=booking.ReturnChosenSeats;
var oldChosenSeats; 
var FirstSeats = Flight.First_Class_Seats;                     // seats array (with old seats of flight)
var BusinessSeats =Flight.Business_Class_Seats;
var EconomySeats =Flight.Economy_Class_Seats;

switch (cabin){
    case ("First"):{
        for (var i=1;i<FirstSeats.length; i++){
            for (var j=0; j<oldChosenSeats.length; j++)
                 if (i== oldChosenSeats[j])   FirstSeats[i]= 0  //-> seat available
          }
    CabinSeatsArray =new Array(16+1).fill(0);              // 16 seats max on First Class Cabin on any flight
    FlightSeatsArray= FirstSeats;                       //(first seats array of flight & removing old seats chosen , but not doing anything the database yet)

    } break;
    
    case ("Business"):{
        for (var i=1;i<BusinessSeats.length; i++){
            for (var j=0; j<oldChosenSeats.length; j++)
                 if (i== oldChosenSeats[j])   BusinessSeats[i]= 0  //-> seat available
          }
 
        CabinSeatsArray =new Array(30+1).fill(0);         
      FlightSeatsArray= BusinessSeats;        
        }break;
    case ("Economy"):{
        for (var i=1;i<EconomySeats.length; i++){
            for (var j=0; j<oldChosenSeats.length; j++)
                 if (i== oldChosenSeats[j])   EconomySeats[i]= 0  //-> seat available
          }
        CabinSeatsArray =new Array(60+1).fill(0);            
        FlightSeatsArray= EconomySeats;       
        }break;
        
}

// Constructing cabin seats array (0-> free , 1-> occupied/not available) according to the flight seats array
  
for(var i=1; i < CabinSeatsArray.length; i++){  
    if (FlightSeatsArray[i]==0)
    CabinSeatsArray[i]=0;
    else if (FlightSeatsArray[i]==1) CabinSeatsArray[i]=1;
    else if (FlightSeatsArray[i]==undefined) CabinSeatsArray[i]=1;
}


//---------------------------chosenSeats array updating as boxes are checked and unchecked
function checkChange(event){ //( flight) returns an array of all indexes of seats that were chosen (checkboxes)
var id= event.target.id 
var checked=event.target.checked; 

if (checked==true) {
    ChosenSeats.push(id);
} 
if (checked==false){
    for (var i=0; i<ChosenSeats.length; i++)
    if (ChosenSeats[i]==id)     ChosenSeats.splice(i, 1);
}
console.log(ChosenSeats);
return ChosenSeats; //console.log(ChosenSeats);
}

//-------------------------------------------------


function handleClick(){   // confirm button of choosing seats --> make change
                // (update seat array in flight according to cabin & update booking with new chosen seats array)
  console.log(FlightSeatsArray); 
    if (ChosenSeats.length!=totalseats )
    alert ("Make sure no. of chosen seats aren't exceeding or not equal to no. of seats required");
    else{ // make changeSeats post request
    
        //new seats array here after chosing seats (on click) & send to packend to update with it right away
    for (var i=1;i<FlightSeatsArray.length; i++){
    for (var j=0; j<ChosenSeats.length; j++)
            if (i== ChosenSeats[j])   FlightSeatsArray[i]= 1  //-> seat became occupied
    }
          
    var article= {
    FlightNo: Flight.Flight_No,Cabin: cabin, NewSeatsArray: FlightSeatsArray, // for updating flight collection with new seats array based on cabin & flightNo 
    BookingNo: booking.BookingNo, FlightDirection: flightDirection, NewChosenSeats: ChosenSeats  // for updating booking collection with new chosen seats arrau based on booking no & flightdirection (departure/return)
};
console.log(article);
axios.post('http://localhost:8000/changeSeats',article).then( res=> {
  if (res.data==1) { alert ("Seat Change Done Successfully"); window.location.reload();} 
})
  // after seats change action (remove & handle in bookingDetails)
  
}

}

function handleCancel(event){
  event.preventDefault();
  window.location.reload();
}

//---------------------------------------------------

return( 

<div name="SeatSelector" style={{ textAlign:'center', padding:'20px'}}>
   
      
{cabin=="First" &&
<div  name="First Class Format Seat Selector" >

<img src="/F.jpg" /> <br></br> <br></br> <h3 >First Class</h3> <br></br> 

<div name="Flight" style={{ width:'100%'}}>
<br></br>
    
    {CabinSeatsArray.map((seat, i) => //Conditional Rendering with map function (used to iterate over arrays) | 
                            //seat-> each entry of array that the function is applied on | i-> index of CabinSeatsArray array | function performed to every entry is what's between the curly braces after the '=>' operator
    { 
    if (i==0) return (""); // index -> 0  (seatArray starts from 1 so do nothing)   
    else if (i%4==0)   // index -> 4/8/12/16  (end of row)
    return (<a><Checkbox id={i} onChange={checkChange} disabled={seat==1}/> <img src="/window.png" /><br></br></a>)
    else if (i%2==0 && i%4!=0)   // index -> 2/6/10/14  (middle seat of row)
    return (<a><Checkbox id={i} onChange={checkChange} disabled={seat==1}/> &nbsp; &nbsp;&nbsp; &nbsp;  </a>)
    else if (i%4==1)   // index -> 1/5/9/13  (first seat of row)
    return (<a><img src="/window.png" /><Checkbox id={i} onChange={checkChange} disabled={seat==1}/>  </a>)
    else // (seat in same row) 
    return (<a><Checkbox id={i} onChange={checkChange} disabled={seat==1}/> </a>)
    }
)} 

</div>

</div>
}

{cabin=="Business" &&
      <div  name="Business Class Format Seat Selector" >
       
       <img src="/B.jpg" /> <br></br> <br></br> <h3 >Business Class</h3> <br></br> 
            
        <div name="Flight"  style={{ width:'100%'}}>
      
        <br></br>
            {CabinSeatsArray.map((seat, i) => //Conditional Rendering with map function (used to iterate over arrays) | 
                                    //seat-> each entry of array that the function is applied on | i-> index of CabinSeatsArray array | function performed to every entry is what's between the curly braces after the '=>' operator
            { 
            if (i==0) return (""); // index -> 0  (seatArray starts from 1 so do nothing)   
            
            else if (i%6==0)   // index -> 4/8/12/16  (end of row)
            return (<a><Checkbox id={i} onChange={checkChange} disabled={seat==1}/> <img src="/window.png" /><br></br></a>)
            
            else if ( (i%2==0 || i%4==0 )&& i%6!=0)   // index -> 2/6/10/14  (middle seat of row)
            return (<a><Checkbox id={i} onChange={checkChange} disabled={seat==1}/> &nbsp; &nbsp;&nbsp; &nbsp;  </a>)
            
            else if (i%6==1)   // index -> 1/5/9/13  (first seat of row)
            return (<a><img src="/window.png" /><Checkbox id={i} onChange={checkChange} disabled={seat==1}/>  </a>)
            
            else // (seat in same row) 
            return (<a><Checkbox id={i} onChange={checkChange} disabled={seat==1}/> </a>)
            }
      )} 

        </div>
    
      </div>
}

{cabin=="Economy" &&
      <div  name="Economy Class Format Seat Selector" >
       
       <img src="/E.jpg" /> <br></br> <br></br> <h3 >Economy Class</h3> <br></br> 
        
        <div name="Flight"  style={{ width:'100%'}}>
         <br></br>
            
            {CabinSeatsArray.map((seat, i) => //Conditional Rendering with map function (used to iterate over arrays) | 
                                    //seat-> each entry of array that the function is applied on | i-> index of CabinSeatsArray array | function performed to every entry is what's between the curly braces after the '=>' operator
            { var m= i%10;
            if (i==0) return (""); // index -> 0  (seatArray starts from 1 so do nothing)   
            
            else if (m%10==0)   // index -> 4/8/12/16  (end of row)
            return (<a><Checkbox id={i} onChange={checkChange} disabled={seat==1}/> <img src="/window.png" /><br></br></a>)
            
            else if ( ((m%3==0 && m%6!=0 && m%9!=0) || m%7==0)&& m%10!=0)   // index -> 2/6/10/14  (middle seat of row)
            return (<a><Checkbox id={i} onChange={checkChange} disabled={seat==1}/> &nbsp; &nbsp;&nbsp; &nbsp;  </a>)
            
            else if (m%10==1)   // index -> 1/5/9/13  (first seat of row)
            return (<a><img src="/window.png" /><Checkbox id={i} onChange={checkChange} disabled={seat==1}/>  </a>)
            
            else // (seat in same row) 
            return (<a><Checkbox id={i} onChange={checkChange} disabled={seat==1}/> </a>)
            }
      )} 

        </div>

      </div>
}


<br></br> <br></br>
      <label style={{color: 'red'}}>*Number of seats to  be chosen (per flight): {totalseats}</label> <br></br>
      <button className="btn btn-primary" onClick={handleClick}>Confirm</button> &nbsp; &nbsp;
      <button className="btn btn-danger" onClick={handleCancel}>Cancel</button>
      
       
        </div>
   


   

       

   
)

}
export default ChangeSeats;