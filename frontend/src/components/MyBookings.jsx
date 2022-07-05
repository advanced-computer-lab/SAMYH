import React from 'react';
import {useEffect,useState} from "react";
import { Route, Redirect, useLocation } from "react-router-dom";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import { css} from '@emotion/css'
import NavBar from './Helper/NavBar';   
import 'bootstrap/dist/css/bootstrap.min.css';                  // rendering in return statement (responsible for session checking & returning of current user email)
import { Modal} from 'react-bootstrap';

import BookingDetails from './Helper/MyBookings/BookingDetails';
import EventNoteIcon from '@mui/icons-material/EventNote';

require("react-bootstrap/ModalHeader");


function MyBookings() {

const location = useLocation();
const history = useHistory();
axios.defaults.withCredentials = true;

const [bookings, setbookings] = useState([]);       //bookings found for user
const [depFlights, setDepFlights] = useState([]);     // all flights

  
useEffect(() => {
    axios.get('http://localhost:8000/MyBookings').then(jsonRes => {
    console.log(jsonRes.data); setbookings(jsonRes.data); console.log(bookings)});

    fetch("/FlightsList").then(res => {              // gets all flights (& sets it to depFlights)
        if (res.ok) {
            return res.json();
        }
    }).then(jsonRes => setDepFlights(jsonRes));

}, [location]);
    

function GetFlight(FlightNumber) {             // get flights with flightNo from all flights (depFlights)
    var element = depFlights.find(({ Flight_No }) => Flight_No === FlightNumber);
    for (let i = 0; i < depFlights.length; i++) {
        if (depFlights[i].Flight_No == FlightNumber)
            return depFlights[i]
    }
    return [];
}

const [clicked,setClicked]= useState(false); 
const [state1,setState1]= useState({});

function handleShow(event){             // redirect to page to show  booking details of booking selected (gets it by bokking no passed by id)
   
    event.preventDefault();
    var bookingNumber= event.target.id;
    if (clicked==true && bookingNumber==state1.bookingNo){
        setClicked(false); 
    }
    else{
    
        var data4={bookingNo: bookingNumber, depFlights: depFlights} // state (as object) passed to location.state (previously)
        
    setState1(data4); console.log(data4);
    setClicked(true);
    }
}



 
 

     
return (
<div>

<NavBar state1="Page"/>

  <div name="content" className={css`
  position: absolute; left: 10%; top: 10%; border-radius: 20px; width: 75%;  padding: 20px; 
  font-family: 'Josefin Sans'; font-size: 15px; font-weight: bold; `
  }>
    
    <div className={css` text-align: center; color:#2C85B8; `}>  <br></br> <EventNoteIcon className={css` transform: scale(3); `}/> <br></br> <br></br> <br></br>  <h1>MY BOOKINGS</h1> </div>
   


   <br></br>  <br></br> 
    
         {bookings.length==0 &&  <h6> <br></br> No Bookings To Show! </h6>}
         
        {bookings[0] !=undefined && bookings.map(booking =>
           
        <div>
            <div name="BookingEntry" id={booking.BookingNo} onClick={handleShow} className={css`
           box-shadow: 0px 0px 10px 1px lightGray; border-radius: 20px; padding: 10px; 
            font-family: 'Josefin Sans'; font-size: 15px; font-weight: normal; text-align:center; color: #2C85B8; `}>
           <label>
            <div style={{display:'flex' , fontWeight:"bold", textAlign:"center"}} >

            <div name="From Label" className={css`  text-align:center ` }>
    <label className={css` font-size: 30px; font-weight: bold; ` }>{(""+ GetFlight(booking.DepartureFlightNo).From).substr(0,3)}</label> <br></br>
    <label className={css` font-size: 20px;`}> {( ""+ GetFlight(booking.DepartureFlightNo) .From ).substr(4)} </label>
    </div>
    

    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
    <div name="plane_date"> 
    <img src="/airplane.png"/> <br></br> <img src="/airplane2.png"/>   
       </div> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;

     <div name="To Label" className={css`  text-align:center ` }>
    <label className={css` font-size: 30px; font-weight: bold; ` }>{(""+ GetFlight(booking.ReturnFlightNo).From).substr(0,3)}</label> <br></br>
    <label className={css` font-size: 20px;`}>{( ""+ GetFlight(booking.ReturnFlightNo) .From ).substr(4)} </label>
    </div>      
            
            </div>
            <br></br>
            </label> 

            <br />
            <label className={css`color:gray;`}> 
            Booking No: {booking.BookingNo}   &nbsp;&nbsp;&nbsp;|  &nbsp;&nbsp;&nbsp; Departure Date: {(""+ GetFlight(booking.DepartureFlightNo).FlightDate).substr(0,10)}  &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; Return Date: {(""+ GetFlight(booking.ReturnFlightNo).FlightDate).substr(0,10)}
            </label>
            <br />
            <div className={css` padding-right:25px;` } > <br></br>
     <button class="btn btn-primary" id={booking.BookingNo} onClick={handleShow} >View Details</button>
     </div>

        </div><br></br> 
        
        
        { (clicked && booking.BookingNo==state1.bookingNo)  && 
        <div name="helperDialog"  style={{ boxShadow: "0px 0px 100px 1px lightGray", padding:'20px', borderRadius: '20px'}}> 
       
        <div className={css` height:900px; overflow:auto; `}>
        <BookingDetails  state={state1}/>
        </div>

        </div>
        } 
        <br></br> 
        </div>  

)}
          
     </div>
    

 </div> 


);
}
export default MyBookings;