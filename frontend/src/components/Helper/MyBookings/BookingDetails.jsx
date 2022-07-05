import React from 'react';
import {useEffect,useState} from "react";
import { Route, Redirect, useLocation } from "react-router-dom";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import { css} from '@emotion/css'

import 'bootstrap/dist/css/bootstrap.min.css';                  // rendering in return statement (responsible for session checking & returning of current user email)
import html2canvas from 'html2canvas';     //  save html into an image
import { jsPDF } from 'jspdf';            // for generating pdf files (of elements in a fontend/react page/component)

// helper components of this page (BookingDetails)
import ChangeSeats from './ChangeSeats';   
import ChangeFlight from './ChangeFlight';
import Divider from '@mui/material/Divider';

import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LuggageIcon from '@mui/icons-material/Luggage';
import AirlineSeatLegroomExtraIcon from '@mui/icons-material/AirlineSeatLegroomExtra';
//-------
//import { Modal} from 'react-bootstrap';
//require("react-bootstrap/ModalHeader");

function BookingDetails(props) {   //helper of MyBookings

//Needed Inputs (from MyBookings)
const depFlights= props.state.depFlights;               // all flights
const bookingNo=props.state.bookingNo;                    //booking no of booking selected (passed by previous page: Myflght.jsx)
//---------

const location = useLocation();
const history = useHistory();
axios.defaults.withCredentials = true;

const [bookingActive, setBookingActive] = useState({});   // booking selected
const [isChecked, setIsChecked] = useState(false);         // status of confirm cancel checkbox 

useEffect(() => {

console.log(bookingNo);
var article= {bookingNo: bookingNo};
axios.post('http://localhost:8000/getBooking',article).        // gets booking selected
then(res =>{  setBookingActive(res.data);  })
console.log(depFlights);  console.log(bookingNo);
console.log(bookingActive);

}, [location]);


function GetFlight(FlightNumber) {                  // get flight using flight no (from all flights)
    var element = depFlights.find(({ Flight_No }) => Flight_No === FlightNumber);
    for (let i = 0; i < depFlights.length; i++) {
        if (depFlights[i].Flight_No == FlightNumber)
            return depFlights[i]
    }
    return [];
}


function handleChange(event){                      // handles change of cancellation checkbox
    setIsChecked(event.target.checked);
}

        
function deleteFlight(event){                        // deletes booking and send email to user
    event.preventDefault();
    var x=bookingActive.BookingNo;

    if (isChecked) {
    var art= {bookingNo: x};
    axios.post(`http://localhost:8000/cancel`,art);           // removes booking from booking collection & update flight collection with new available seats

    const article = { booking: bookingActive};               // sends cancellation email
    axios.post('http://localhost:8000/SendCancelEmail', article).then(res => {
    if (res.data==1){
    alert("Booking Canceled Successfully \nYou'll recieve an email with the cancelation details along with the refund amount");
    history.push({ pathname: '/MyBookings'});   // or handle in main page (Booking Details)
    }
    });
    
    }
    else 
    alert("Make sure confirmation checkbox is checked, to cancel booking!");
}


// Sending Itenerary (pdf by email)
const printRef = React.useRef();

async function SendItineraryPDF(event){
  const element = printRef.current;
  const canvas = await html2canvas(element);
  const data = canvas.toDataURL('image/png');

  const pdf = new jsPDF();
  const imgProperties = pdf.getImageProperties(data);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight =
    (imgProperties.height * pdfWidth) / imgProperties.width;

  pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
  var pdfFile = pdf.output('blob');      //formdata (for sending files) takes only blob (binary large object) item (the 2nd parameter of append must be blob)
                                      // blob format : blob is an object with many attrbutes , but most important is "data" attribute (is a buffer that holds  the data of file)  
  var file2=new FormData(); 
  file2.append('file',pdfFile);
  //console.log(pdfFile);
  axios.post('http://localhost:8000/SendEmail', file2).then(res => {
      if (res.data==1){ alert ("Intinerary sent to your email")
    window.location.reload();}

      //add loading while waiting for email to be sent
  })
  
};

var from= GetFlight(bookingActive.DepartureFlightNo).From +""; var fromCode= from.substr(0,3); var fromFull= from.substr(5,from.length-6);
var to= GetFlight(bookingActive.DepartureFlightNo).To +""; var toCode= to.substr(0,3); var toFull= to.substr(5,to.length-6);

var departureFlight= GetFlight(bookingActive.DepartureFlightNo); 
var returnFlight= GetFlight(bookingActive.ReturnFlightNo); 

console.log(departureFlight);
console.log(returnFlight);

//------------------------------------------------------------------------
const [changeSeatsClicked,setChangeSeatsClicked]= useState(false); 
const [state1,setState1]= useState({});

function handleChangeSeats(event){
    var id=event.target.id;  // FlightDirection -> "DepartureFlight" or "ReturnFlight"
    
    if (id=='DepartureFlight')
    var article= {Flight: GetFlight(bookingActive.DepartureFlightNo) , Booking: bookingActive, FlightDirection: id};
    else
    var article= {Flight: GetFlight(bookingActive.ReturnFlightNo) , Booking: bookingActive, FlightDirection: id};
    
    var data4=article;			// state passed (as object) passed to location.state (previously)
    
    setHelperShow(true);
    setState1(data4);
    setChangeSeatsClicked(true);
    

  /*   history.push({                    //remove & pass props to changeSeats component when calling (set flag -> render conditionally)
        pathname:"/ChangeSeats",
       state:article
    }); */
}

const [changeFlightClicked,setChangeFlightClicked]= useState(false); 


function handleChangeFlight(event){
var id=event.target.id;  // FlightDirection -> "DepartureFlight" or "ReturnFlight"
var departureFlight= GetFlight(bookingActive.DepartureFlightNo);
var returnFlight= GetFlight(bookingActive.ReturnFlightNo);
 
if (id=="DepartureFlight"){
var passedVariable= {Flight: departureFlight, Booking: bookingActive, FlightDirection: id};
var input= {from: departureFlight.From , to: departureFlight.To , date: departureFlight.FlightDate,
cabin: bookingActive.Cabin , adultSeats: bookingActive.AdultSeats, childrenSeats: bookingActive.ChildrenSeats };
}
else{
    var passedVariable= {Flight: returnFlight, Booking: bookingActive, FlightDirection: id};
    var input= {from: returnFlight.From , to: returnFlight.To , date: returnFlight.FlightDate,
    cabin: bookingActive.Cabin , adultSeats: bookingActive.AdultSeats, childrenSeats: bookingActive.ChildrenSeats };
    }

//Getting matching flights & price for each all at once (passed to other front end pages using history.push)
    axios.post('http://localhost:8000/getMatchingFlights', input).then(res =>{ 
        var data1= res.data; // array of objects {FlightDetails: x, TotalPrice: x} ->flights that meet the search criteria (FlightDetails & Price) sent from  bookingDetails (when change flight is pressed)
        var data=[];
        var oldFlightNo= passedVariable.Flight.Flight_No; 

        for (var i=0; i<data1.length; i++){            // excluding the flight you want to change from the matched flights result
            if (data1[i].FlightDetails.Flight_No!= oldFlightNo)
            data.push(data1[i]);
        }

    if (data.length!=0) {        
         //console.log(res.data);  // res.send(FlightsAndPrices);  // array of objects [ {FlightDetails: x , TotalPrice: x } ]
         
    var data4={matchedFlights: res.data, search: input, passed: passedVariable};
    console.log(data4);			// state passed (as object) passed to location.state (previously)
    
    setHelperShow(true);
    setState1(data4);
    setChangeFlightClicked(true);
  

         
         /* history.push({                //remove & pass props to changeFlight component when calling (set flag -> render conditionally)
          pathname: '/ChangeFlight',
          state: {matchedFlights: res.data, search: input, passed: passedVariable}
        }); */
    }
    else alert ("No matching flights");
       
    
    })

}
//-----------------------------------------------------------------------
const [helperShow,setHelperShow]=useState(false);


return (
<div name="dialog" >

{helperShow==false && 

<div name="bookingDetailsPage">

<div ref={printRef} name="Itinerary">

    Booking No: {bookingActive.BookingNo} |  Cabin: {bookingActive.Cabin}  | Seats: {bookingActive.AdultSeats>0 && bookingActive.AdultSeats + " (Adults)"} {(bookingActive.AdultSeats>0 && bookingActive.ChildrenSeats>0) && " | " } {bookingActive.ChildrenSeats>0 && bookingActive.ChildrenSeats + " (Children)"} 
     | Price: {bookingActive.Price}
    <br></br><br /> <br></br>

<div>
<label name="depFlight"  className={css`  padding: 20px; font-size: 20px; font-weight: normal;  
      
       text-align:center; width:1200px; height:150px; `}>

<label name="upper">
    <div name="from->to" style={{display:"flex"}} className={css`  
      
      text-align:center; `}>
    
    <div name="From Label">
    <label className={css` font-size: 30px; font-weight: bold; ` }>{fromCode}</label> <br></br>
    <label className={css` width:450px; ` }> {fromFull} </label>
    </div>
    
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
    <div name="plane_data" style={{color:'grey'}}> 
    
    <img src="/airplane.png"/>  <br></br><br></br>
    <label>Departure Flight</label>
    <label>{  (new Date(departureFlight.FlightDate)+"").substr(0,15) }</label>
       
     </div>
     &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
    
    <div name="To Label">
    <label className={css` font-size: 30px; font-weight: bold; ` }>{toCode}</label> <br></br>
    <label className={css` width:450px; ` }> {toFull} </label>
    </div>
     
    
     </div>
     </label>

     <br></br><br></br>
<div  name="Dtime_Atime" className={css`  width:100%; display:flex; padding-left:13%; `}> 

<div className={css`   width: 22%;`}> <FlightTakeoffIcon className={css`  color:#2C85B8; transform: scale(2.5);`}/> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<a className={css` font-size: 30px;`} >{departureFlight.Departure}</a> </div>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

<div className={css`  text-align:center; color:gray; width: 33%; `}> <AccessTimeIcon/> <br></br>
{departureFlight.Duration}  </div>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

<div> <FlightLandIcon className={css` color:#2C85B8; transform: scale(2.5);`}/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
 <a className={css` font-size: 30px;`} >{departureFlight.Arrival} </a> </div>

</div>

 
<div name="Baggage_flightNo_Seats" className={css`  display:flex; color:gray; text-align:center;`}> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<div>  # {departureFlight.Flight_No} </div>
<div className={css`   width: 33%;  `}> 
<LuggageIcon className={css`  transform: scale(1.3);`}/>  
{bookingActive.Cabin=="First" && departureFlight.First_Class_BaggageAllowance}
{bookingActive.Cabin=="Business" && departureFlight.Business_Class_BaggageAllowance} 
{bookingActive.Cabin=="Economy" && departureFlight.Economy_Class_BaggageAllowance} 
</div>

<div><AirlineSeatLegroomExtraIcon/> {bookingActive.DepartureChosenSeats} </div>


<div>

</div>


</div>  

</label>        
 
 <br></br><br></br><Divider/> <br></br><br></br>
<label name="retFlight"  className={css`  padding: 20px; font-size: 20px; font-weight: normal;  
      
       text-align:center; width:1200px; height:150px; `}>

<label name="upper">
    <div name="from->to" style={{display:"flex"}} className={css`  
      
      text-align:center; `}>
    
    <div name="From Label">
    <label className={css` font-size: 30px; font-weight: bold; ` }>{toCode}</label> <br></br>
    <label className={css` width:450px; ` }> {toFull} </label>
    </div>
    
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
    <div name="plane_date" style={{color:'grey'}}> 
    
    <img src="/airplane.png"/>  <br></br><br></br>
    <label>Return Flight</label>
    <label>{  (new Date(returnFlight.FlightDate)+"").substr(0,15) }</label>
       
     </div>
     &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
    
    <div name="To Label">
    <label className={css` font-size: 30px; font-weight: bold; ` }>{fromCode}</label> <br></br>
    <label className={css` width:450px; ` }> {fromFull} </label>
    </div>
     
    
     </div>
     </label>

     <br></br><br></br>
<div  name="Dtime_Atime" className={css`  width:100%; display:flex; padding-left:13%; `}> 

<div className={css`   width: 22%;`}> <FlightTakeoffIcon className={css`  color:#2C85B8; transform: scale(2.5);`}/> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<a className={css` font-size: 30px;`} >{returnFlight.Departure}</a> </div>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

<div className={css`  text-align:center; color:gray; width: 33%; `}> <AccessTimeIcon/> <br></br>
{returnFlight.Duration}  </div>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

<div> <FlightLandIcon className={css` color:#2C85B8; transform: scale(2.5);`}/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
 <a className={css` font-size: 30px;`} >{returnFlight.Arrival} </a> </div>

</div>

 
<div name="Baggage_flightNo_Seats" className={css`  display:flex; color:gray; text-align:center;`}> 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<div>  # {returnFlight.Flight_No} </div>
<div className={css`   width: 33%;  `}> 
<LuggageIcon className={css`  transform: scale(1.3);`}/>  
{bookingActive.Cabin=="First" && returnFlight.First_Class_BaggageAllowance}
{bookingActive.Cabin=="Business" && returnFlight.Business_Class_BaggageAllowance} 
{bookingActive.Cabin=="Economy" && returnFlight.Economy_Class_BaggageAllowance} 
</div>

<div><AirlineSeatLegroomExtraIcon/> {bookingActive.ReturnChosenSeats} </div>


<div>

</div>


</div>  


</label>                
 </div>       

</div>


<br></br> <br></br><br></br>
<div name="Buttons" style={{textAlign:"center", paddingRight:'40px'}}>


<button  class="btn btn-success" onClick={SendItineraryPDF}>Send Itineray By Email </button> <br></br> <br></br> <br></br>



<Divider/>
<br></br>
<label style={{color:'grey'}}>Edit / Cancel Booking</label> <br></br>
<div name="editBooking" className={css`  display: flex`} >

<div name="editDeparture" className={css`  width: 50%`}>

<label style={{color:'grey'}}>Departure Flight</label> <br></br>
<button class="btn btn-primary" id="DepartureFlight" onClick={handleChangeSeats}> Change Seats </button>  <br></br><br></br> 
<button class="btn btn-primary" id="DepartureFlight" onClick={handleChangeFlight} > Change Flight </button> <br></br> <br></br><br></br>
</div>

<div  name="editReturn" className={css`  width: 50%`}>
<label style={{color:'grey'}}>Return Flight</label> <br></br>
<button class="btn btn-primary" id="ReturnFlight" onClick={handleChangeSeats}> Change Seats </button>  <br></br><br></br> 
<button class="btn btn-primary" id="ReturnFlight" onClick={handleChangeFlight} > Change Flight </button>
         
</div>

</div>
<div name="Cancel Button">         
                               
<br /> 

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp;
<label> Are you sure you want to cancel this booking?</label> &nbsp; &nbsp; 
<input  type="checkbox"  onChange={handleChange}/>  
               
&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
<button class="btn btn-danger"  onClick={deleteFlight}> Cancel Booking </button> 
                    
                                
</div>



</div>


</div>
}

<div name="helperPages" >
{ changeSeatsClicked && <ChangeSeats state={state1}/> }
{ changeFlightClicked && <ChangeFlight state={state1}/> }
</div> 

</div>
    


);
}
export default BookingDetails;