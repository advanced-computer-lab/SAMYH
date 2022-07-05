import react, {useEffect,useState} from "react";
import { Route, Redirect, useLocation } from "react-router-dom";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";

import { css} from '@emotion/css'
                 // rendering in return statement (responsible for session checking & returning of current user email)
import Checkbox from '@mui/material/Checkbox';


function Booking(props){           //for USER & GUEST
 const location = useLocation();
   const history = useHistory();
   axios.defaults.withCredentials = true;

   var flag=false;
   var confirmbookingclicked=false;
 /*    
    if (location.state!=null){           //checking if user searched for a flight & selected a departure flight & variables were passed, no url
    flag=true;   
    
   }
   else{
   alert("Please search for a flight to book first!");
   history.push({
       pathname: '/user' 
       });
   }
*/
   //-------------------------------------------
   
   //Needed Inputs
   var returnFlight= props.state1.booking.selectedReturnFlight; 
   var departureFlight= props.state1.booking.selectedDepartureFlight; 
   var search= props.state1.search 


   //Derived
   var cabin= search.cabin;
   var totalseats= search.adultSeats + search.childrenSeats;


//---------------------------------------------------
var departureCabinSeatsArray; // cabin seats format array (that has indexes up to the max seats available on that cabin of all flights) (array of constant size, seats array gets aplied on it becuase to display cabin -> format should be the same for all flights)
var returnCabinSeatsArray;

var departureFlightSeatsArray; // seats array in every flight (that dictates the free (0) & occupied (1) seats) //Based on cabin (departureCabinSeatsArray & departureFlightSeatsArray {First,Business, or Economy})
var returnFlightSeatsArray; 

var departureChosenSeats=[];  // array of indexes of the chosen seats (checkboxes selected)
var returnChosenSeats=[]; 

switch (cabin){
    case ("First"):{
    departureCabinSeatsArray=new Array(16+1).fill(0); 
    returnCabinSeatsArray =new Array(16+1).fill(0);              // 16 seats max on First Class Cabin on any flight
    departureFlightSeatsArray= departureFlight.FlightDetails.First_Class_Seats;        //(first seats array of flight)
    returnFlightSeatsArray= returnFlight.FlightDetails.First_Class_Seats;
    } break;
    
    case ("Business"):{
    departureCabinSeatsArray=new Array(30+1).fill(0); 
    returnCabinSeatsArray =new Array(30+1).fill(0);              // 16 seats max on First Class Cabin on any flight
    departureFlightSeatsArray= departureFlight.FlightDetails.Business_Class_Seats;        //(first seats array of flight)
    returnFlightSeatsArray= returnFlight.FlightDetails.Business_Class_Seats;
    } break;
    
    case ("Economy"):{
    departureCabinSeatsArray=new Array(60+1).fill(0); 
    returnCabinSeatsArray =new Array(60+1).fill(0);              // 16 seats max on First Class Cabin on any flight
    departureFlightSeatsArray= departureFlight.FlightDetails.Economy_Class_Seats;        //(first seats array of flight)
    returnFlightSeatsArray= returnFlight.FlightDetails.Economy_Class_Seats;
    } break;

        
}

// Constructing cabin seats array (0-> free , 1-> occupied/not available) according to the flight seats array
  
for(var i=1; i < departureCabinSeatsArray.length; i++){  
    if (departureFlightSeatsArray[i]==0)
    departureCabinSeatsArray[i]=0;
    else if (departureFlightSeatsArray[i]==1) departureCabinSeatsArray[i]=1;
    else if (departureFlightSeatsArray[i]==undefined) departureCabinSeatsArray[i]=1;
}

for(var i=1; i < returnCabinSeatsArray.length; i++){  
    if (returnFlightSeatsArray[i]==0)
    returnCabinSeatsArray[i]=0;
    else if (returnFlightSeatsArray[i]==1) returnCabinSeatsArray[i]=1;
    else if (returnFlightSeatsArray[i]==undefined) returnCabinSeatsArray[i]=1;
}


function checkChange(event){ //(departure flight) returns an array of all indexes of seats that were chosen (checkboxes)
var id= event.target.id 
var checked=event.target.checked; 

if (checked==true) {
    departureChosenSeats.push(id);
} 
if (checked==false){
    for (var i=0; i<departureChosenSeats.length; i++)
    if (departureChosenSeats[i]==id)     departureChosenSeats.splice(i, 1);
}
console.log(departureChosenSeats);
return departureChosenSeats; //console.log(departureChosenSeats);
}

function checkChange2(event){ // (return flight) returns an array of all indexes of seats that were chosen (checkboxes)
    var id= event.target.id 
    var checked=event.target.checked; 
    
    if (checked==true) {
        returnChosenSeats.push(id);
    } 
    if (checked==false){
        for (var i=0; i<returnChosenSeats.length; i++)
        if (returnChosenSeats[i]==id)     returnChosenSeats.splice(i, 1);
    }
    console.log(returnChosenSeats);
    return returnChosenSeats; //console.log(departureChosenSeats);
    }

function handleClick(){   // confirm button of choosing seats --> make booking
    console.log(search);
    if (departureChosenSeats.length!=totalseats || returnChosenSeats.length!=totalseats )
    alert ("Make sure no. of chosen seats aren't exceeding or not equal to no. of seats required (on both flights)");
    else{ // make booking post request
    alert ("Booking Done Successfully");
    //console.log("Departure Chosen Seats: " + departureChosenSeats +"\nReturn Chosen Seats " + returnChosenSeats);
    
    var article= {
    dFlightNo: departureFlight.FlightDetails.Flight_No,
    rFlightNo: returnFlight.FlightDetails.Flight_No,
    cabin: cabin,
    adults: search.adultSeats,
    children: search.childrenSeats,
    price: departureFlight.TotalPrice + returnFlight.TotalPrice,
    departureChosenSeats: departureChosenSeats,
    returnChosenSeats: returnChosenSeats,
};
  axios.post('http://localhost:8000/confirmBooking', article).then(
      history.push({pathname:"/"})
  );
}
}


//---------------------------------------------------

/*
function handleclick3(event){
    if (confirmbookingclicked==false){  //to avoid registering the boooking more than once if the user clicked on booking button more than once
        confirmbookingclicked=true;
    var article5= {departureFlightNo: dflightNo, returnFlightNo: rflightNo, cabin: input.cabin,  
        adults: input.adults, children: input.children, price: price};
    
        axios.post('http://localhost:8000/confirmBooking',article5)
       .then(res =>{ 
        if (res.data==1){
        alert("Booking Done Successfully");
        history.push({
        pathname: '/myFlights'
         });   
        }
        
         })

 }
}
*/
 

   return( 


<div name="SeatSelector" style={{ boxShadow: "0px 0px 100px 1px lightGray", textAlign:'center', padding:'20px', borderRadius: '20px'}}>
     
      
      {cabin=="First" &&
      <div  name="First Class Format Seat Selector" >
         
       <img src="/F.jpg" /> <br></br> <br></br> <h3 >First Class</h3> <br></br> 
      
           <div style={{display:'flex', textAlign:'center',  width:'100%'}}>
        
            <div name="departureFlight" style={{ width:'50%'}}>
            <label>Departure Flight</label> <br></br>
                
                {departureCabinSeatsArray.map((seat, i) => //Conditional Rendering with map function (used to iterate over arrays) | 
                                        //seat-> each entry of array that the function is applied on | i-> index of departureCabinSeatsArray array | function performed to every entry is what's between the curly braces after the '=>' operator
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
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp; 
            <div className= {css`border-left: 6px solid #2C85B8;; height: 100%px;`}></div>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp; 

            <div name="returnFlight" style={{ width:'50%'}}>
            <label>Return Flight</label> <br></br> 
            
            {returnCabinSeatsArray.map((seat, i) => //Conditional Rendering with map function (used to iterate over arrays) | 
                                        //seat-> each entry of array that the function is applied on | i-> index of departureCabinSeatsArray array | function performed to every entry is what's between the curly braces after the '=>' operator
                { 
                if (i==0) return (""); // index -> 0  (seatArray starts from 1 so do nothing)   
                else if (i%4==0)   // index -> 4/8/12/16  (end of row)
                return (<a><Checkbox id={i} onChange={checkChange2} disabled={seat==1}/> <img src="/window.png" /><br></br></a>)
                else if (i%2==0 && i%4!=0)   // index -> 2/6/10/14  (middle seat of row)
                return (<a><Checkbox id={i} onChange={checkChange2} disabled={seat==1}/> &nbsp; &nbsp;&nbsp; &nbsp;  </a>)
                else if (i%4==1)   // index -> 1/5/9/13  (first seat of row)
                return (<a><img src="/window.png" /><Checkbox id={i} onChange={checkChange2} disabled={seat==1}/>  </a>)
                else // (seat in same row) 
                return (<a><Checkbox id={i} onChange={checkChange2} disabled={seat==1}/> </a>)
                }
        )} 
            </div>

            </div >
   
      </div>
      }

      

{cabin=="Business" &&
      <div  name="Business Class Format Seat Selector" >
       
       <img src="/B.jpg" /> <br></br> <br></br> <h3 >Business Class</h3> <br></br> 
      
    
      <div style={{display:'flex', textAlign:'center',  width:'100%'}}>
       
        <div name="departureFlight"  style={{ width:'50%'}}>
        <label>Departure Flight</label> <br></br>
            
            {departureCabinSeatsArray.map((seat, i) => //Conditional Rendering with map function (used to iterate over arrays) | 
                                    //seat-> each entry of array that the function is applied on | i-> index of departureCabinSeatsArray array | function performed to every entry is what's between the curly braces after the '=>' operator
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

        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp; 
        <div className= {css`border-left: 6px solid #2C85B8;; height: 100%px;`}></div>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;           

        <div name="returnFlight" style={{ width:'50%'}}>
        <label>Return Flight</label> <br></br> 
        
         {returnCabinSeatsArray.map((seat, i) => //Conditional Rendering with map function (used to iterate over arrays) | 
                                    //seat-> each entry of array that the function is applied on | i-> index of departureCabinSeatsArray array | function performed to every entry is what's between the curly braces after the '=>' operator
                                    { 
                                        if (i==0) return (""); // index -> 0  (seatArray starts from 1 so do nothing)   
                                        
                                        else if (i%6==0)   // index -> 4/8/12/16  (end of row)
                                        return (<a><Checkbox id={i} onChange={checkChange2} disabled={seat==1}/> <img src="/window.png" /><br></br></a>)
                                        
                                        else if ( (i%2==0 || i%4==0 )&& i%6!=0)   // index -> 2/6/10/14  (middle seat of row)
                                        return (<a><Checkbox id={i} onChange={checkChange2} disabled={seat==1}/> &nbsp; &nbsp;&nbsp; &nbsp;  </a>)
                                        
                                        else if (i%6==1)   // index -> 1/5/9/13  (first seat of row)
                                        return (<a><img src="/window.png" /><Checkbox id={i} onChange={checkChange2} disabled={seat==1}/>  </a>)
                                        
                                        else // (seat in same row) 
                                        return (<a><Checkbox id={i} onChange={checkChange2} disabled={seat==1}/> </a>)
                                        }
      )} 
        </div>


      </div>

      </div>
}

{cabin=="Economy" &&
      <div  name="Economy Class Format Seat Selector" >
       
       <img src="/E.jpg" /> <br></br> <br></br> <h3 >Economy Class</h3> <br></br> 
      
    
      <div style={{display:'flex', textAlign:'center', }}>
       
        <div name="departureFlight"  style={{ width:'50%'}}>
        <label>Departure Flight</label> <br></br>
            
            {departureCabinSeatsArray.map((seat, i) => //Conditional Rendering with map function (used to iterate over arrays) | 
                                    //seat-> each entry of array that the function is applied on | i-> index of departureCabinSeatsArray array | function performed to every entry is what's between the curly braces after the '=>' operator
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

        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp; 
        <div className= {css`border-left: 6px solid #2C85B8;; height: 100%px;`}></div>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;           

        <div name="returnFlight" style={{ width:'50%'}}>
        <label>Return Flight</label> <br></br> 
        
         {returnCabinSeatsArray.map((seat, i) => //Conditional Rendering with map function (used to iterate over arrays) | 
                                    //seat-> each entry of array that the function is applied on | i-> index of departureCabinSeatsArray array | function performed to every entry is what's between the curly braces after the '=>' operator
                                    { var m= i%10;
                                        if (i==0) return (""); // index -> 0  (seatArray starts from 1 so do nothing)   
                                        
                                        else if (m%10==0)   // index -> 4/8/12/16  (end of row)
                                        return (<a><Checkbox id={i} onChange={checkChange2} disabled={seat==1}/> <img src="/window.png" /><br></br></a>)
                                        
                                        else if ( ((m%3==0 && m%6!=0 && m%9!=0) || m%7==0)&& m%10!=0)   // index -> 2/6/10/14  (middle seat of row)
                                        return (<a><Checkbox id={i} onChange={checkChange2} disabled={seat==1}/> &nbsp; &nbsp;&nbsp; &nbsp;  </a>)
                                        
                                        else if (m%10==1)   // index -> 1/5/9/13  (first seat of row)
                                        return (<a><img src="/window.png" /><Checkbox id={i} onChange={checkChange2} disabled={seat==1}/>  </a>)
                                        
                                        else // (seat in same row) 
                                        return (<a><Checkbox id={i} onChange={checkChange2} disabled={seat==1}/> </a>)
                                        }
      )} 
        </div>


      </div>

      </div>
}

       <br></br> <br></br>
      <label style={{color: 'red'}}>*Number of seats to  be chosen (per flight): {totalseats}</label> <br></br>
      <button className="btn btn-primary" onClick={handleClick}>Confirm</button>
      </div>
       
       
 

   




   
  



       

   
   );
}
export default Booking;