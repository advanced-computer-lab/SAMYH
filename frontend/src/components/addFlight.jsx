import React, {useState} from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function AddFlight(){
    const [input, setInput] = useState({
        flightNo:"", from: "" , to: "" , date: "", departure: "", arrival: "", firstSeats: "", businessSeats: "" , economySeats: ""  
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

    const newFlight= {flightNo: input.flightNo, from: input.from , to: input.to , date: input.date , departure: input.departure, arrival: input.arrival, firstSeats: input.firstSeats, businessSeats: input.businessSeats , economySeats: input.economySeats }  ;
    axios.post('http://localhost:8000/addFlight', newFlight)
}

return (
<div>
<h1>Add Flight</h1>

<br></br>


<form>
<label>Flight No. <input onChange={handleChange} name="flightNo" type="number" value={input.flightNo} />  </label> <br></br> <br></br>
      <label>From <input onChange={handleChange} name="from" type="text" value={input.from} />  </label> <br></br> <br></br>
      <label>To   <input onChange={handleChange} name="to" type="text" value={input.to}/>  </label> <br></br> <br></br> <br></br> 
      <label>Date       <input onChange={handleChange} name="date" type="date" value={input.date}/>  </label> <br></br> <br></br>
      <label>Departure  <input onChange={handleChange} name="departure" type="time" value={input.departure}/>  </label> <br></br> <br></br>
      <label>Arrival    <input onChange={handleChange} name="arrival" type="time" value={input.arrival}/>  </label> <br></br> <br></br> <br></br> 
      <label>First Class Seats     <input onChange={handleChange} name="firstSeats" type="number" value={input.firstSeats}/>  </label> <br></br> <br></br>
      <label>Business Class Seats  <input onChange={handleChange} name="businessSeats" type="number" value={input.businessSeats}/>  </label> <br></br> <br></br>
      <label>Economy Class Seats   <input onChange={handleChange} name="economySeats" type="number" value={input.economySeats}/>  </label> <br></br> <br></br>

      <input type="submit" value="Add" onClick={handleclick} /> 
</form>

    




 


</div>
)
} 

export default AddFlight;