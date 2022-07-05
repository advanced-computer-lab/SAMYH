const flight = require('../Models/Flights');                  // Collections In Database
const user = require('../Models/User');
const booking = require('../Models/Booking');
const { findByIdAndRemove } = require("../Models/Flights"); 

const { ConnectionPoolClosedEvent } = require("mongodb");

const bcrypt = require("bcrypt");
const express = require("express");
const router= express.Router();
router.use(express.json());
const cors = require('cors');

const fileUpload= require('express-fileupload');   // to accept files (blob) from frontend & then accessing it from req.files
router.use(fileUpload());


router.use(cors({                          // for axios post to not destroy session (credentials is where the sessions is saved as cookie)
  origin:['http://localhost:3000'],     // is the origin of the axios requests (frontend url port)
  methods:['GET','POST'],
  credentials: true // enable set cookie
}));

const session=require("express-session");
router.use(session({secret:'secret', resave:false , saveUninitialized:false}));

const nodemailer = require("nodemailer");

//--------------------------------------------------------------------------------------------

router.route("/logout").get((req, res) => {
  req.session.destroy();              // destroying session
   });

router.route("/SignIn").post(async(req, res) => {
   var emailInput = req.body.Email;  
  const email=emailInput.toLowerCase();  const password = req.body.Password;

  const User = await user.findOne({ Email: email }); // user with same email 
  
  if ( (User) && (await bcrypt.compare(password, User.Password))) {        // (user) = user found/exists/true

    if (User.type!="Guest") {
  
        switch (User.Type){
          case("Customer"): {req.session.email = email;  req.session.type = User.Type; req.session.save();res.send("1"); break;};  // customer signed in
          case("Admin"): {req.session.email = x; req.session.type = founduser[0].Type; req.session.save();res.send("2"); break;};  //admin signed in
          default:  {res.send("0"); break;};     
        }
    }
  }
  else  
    res.send("0");  // wrong email/password or guest type-> don't sign in 
});

router.route("/currentUser").get((req, res) => {
   if (req.session.type=="Customer" || req.session.type=="Guest"){
     const user= {email: req.session.email, type: req.session.type  }
     res.send(user);  
   }
   else
   res.send("0"); // no one logged in -> add new guest
   });




router.route("/addGuest").get((req,res) => { //get becuase no input
   user.find({ Type : "Guest"}).then(foundguests => {  //all cases (actions) shoud be inside then statement (variable changes in then statement dont get apllied outside then statement)
     var x = foundguests.length + 1;
     var guestEmail= "guest"+ x;
     //req.session.email= guestEmail;
   
     const newGuest = new user({
      FirstName : "-",
      LastName: "-",
      Email : guestEmail,
      Password : "-",
      
      PassportNo: "-",
      Address: "-",
      CountryCode: 0,
      PhoneNo: 0,
      Type: "Guest" 
       });
      
      

      newGuest.save();
      req.session.email = guestEmail; req.session.type="Guest"; res.send(req.session);
  
    })
 });

router.route("/addUser").post(async(req,res) => {
   
  const firstName= req.body.firstname;
  const lastName= req.body.lastname;
  const passportNo= req.body.passportNo;
  const address= req.body.address;
  const countryCode= req.body.countryCode;
  const phoneNo= req.body.phoneNo;
   
  const emailInput= req.body.email; const email = emailInput.toLowerCase();
  const password= req.body.password; const encryptedPassword = await bcrypt.hash(password, 10);  //Encrypt user password
  
  
  user.find({ Email : email}).then(founduser => {  //all cases (actions) shoud be inside then statement (variable changes in then statement dont get apllied outside then statement)
   if (founduser.length!= 0) 
    res.send("1"); 
   else {
  
    const newUser = new user({
      FirstName : firstName,
      LastName: lastName,
      Email : email,
      Password : encryptedPassword,
      
      PassportNo: passportNo,
      Address: address,
      CountryCode: countryCode,
      PhoneNo: phoneNo,
      Type: "Customer" 
       });
      newUser.save();
      }  

      res.send("0");  // successful user registration
    })
 });



router.route("/MyBookings").get((req, res) => {
  booking.find({Email : req.session.email})
    .then(foundBookings => {res.send(foundBookings); //console.log(foundBookings);
    })
})

router.route("/getBooking").post((req, res) => {
  bookingNo= req.body.bookingNo;
  //console.log(bookingNo);
  booking.find({BookingNo : bookingNo}).then(foundBookings => {
    res.send(foundBookings[0])
   // console.log(foundBookings[0]);  
  })
  
})


router.route("/searchFlightUser").post(async(req, res) => {
  
  const from= req.body.from;
  const to= req.body.to;
  
  const departureDate= req.body.departure;
  const returnDate = req.body.return;
  
  const cabin= req.body.cabin;
  const adultSeats= req.body.adultSeats;  
  const childrenSeats= req.body.childrenSeats;

var seats= adultSeats+ childrenSeats;
var searchD = { From : from, To : to, FlightDate : departureDate }   ;   // departureFlight
var searchR = { From : to, To : from, FlightDate : returnDate }   ;   // returnFlight

switch (cabin){
 
case ("First"):{
  searchD = { $and: [ searchD,  {First_Class_AvailableSeats : { $gte: seats}}  ]} ;
  searchR = { $and: [ searchR,  {First_Class_AvailableSeats : { $gte: seats}}  ]};
}; break;

case ("Business"):{
  searchD = { $and: [ searchD,  {Bussiness_Class_AvailableSeats : { $gte: seats}}  ]};
  searchR = { $and: [ searchR,  {Bussiness_Class_AvailableSeats : { $gte: seats}}  ]}; 
}; break;

case ("Economy"):{
  searchD = { $and: [ searchD,  {Economy_Class_AvailableSeats : { $gte: seats}}  ]};
  searchR = { $and: [ searchR,  {Economy_Class_AvailableSeats : { $gte: seats}}  ]};
}; break;

}

var departureFlights;  var returnFlights;
var bothfound=true;
await flight.find(searchD).then(foundflights => {
      if (foundflights.length!=0)
      departureFlights= foundflights;
      else
      bothfound=false;   // no results 
    });

    await flight.find(searchR).then(foundflights1 => {
      if (foundflights1.length!=0)
      returnFlights= foundflights1;
      else
      bothfound=false;   // no results 
    });

  if (bothfound==true){
var flights= {departureFlights: departureFlights, returnFlights: returnFlights };

var departureFlightsAndPrices=[];
for (var i=0; i<flights.departureFlights.length; i++){    // gets price of every departure flight
 var flight1= flights.departureFlights[i]; var price;
 switch (cabin){
  case ("First"):{
   price = flight1.First_Class_Price * adultSeats + flight1.First_Class_Price * childrenSeats*0.7; } break;
    
  case ("Business"):{
   price = flight1.Business_Class_Price * adultSeats + flight1.Business_Class_Price * childrenSeats*0.7; } break;
    
  case ("Economy"):{
   price = flight1.Economy_Class_Price * adultSeats + flight1.Economy_Class_Price * childrenSeats*0.7; } break;
   
}
var dF= { FlightDetails: flight1, TotalPrice: price}   //makes new object (flight & its corrosponding price)
departureFlightsAndPrices.push(dF) // pushes object (flight & its corrosponding price) to an array (departureFlightsAndPrices) 
}

var returnFlightsAndPrices=[];
for (var i=0; i<flights.returnFlights.length; i++){   // // gets price of every return flight
 var flight1= flights.returnFlights[i]; var price;
 switch (cabin){
  case ("First"):{
   price = flight1.First_Class_Price * adultSeats + flight1.First_Class_Price * childrenSeats*0.7; } break;
    
  case ("Business"):{
   price = flight1.Business_Class_Price * adultSeats + flight1.Business_Class_Price * childrenSeats*0.7; } break;
    
  case ("Economy"):{
   price = flight1.Economy_Class_Price * adultSeats + flight1.Economy_Class_Price * childrenSeats*0.7; } break;
   
}
var rF= { FlightDetails: flight1, TotalPrice: price}   //makes new object (flight & its corrosponding price)
returnFlightsAndPrices.push(rF) // pushes object (flight & its corrosponding price) to an array (returnFlightsAndPrices) 
}

var flightsModified= {departureFlightsAndPrices: departureFlightsAndPrices, returnFlightsAndPrices: returnFlightsAndPrices };

res.send(flightsModified);
}
else 
res.send('1');


    //search for the return flight if no flight (then don't show trip)
  })

  router.route("/getMatchingFlights").post(async(req, res) => {
  
    const from= req.body.from;
    const to= req.body.to;
    
    const date= req.body.date;
     
    const cabin= req.body.cabin;
    const adultSeats= req.body.adultSeats;  
    const childrenSeats= req.body.childrenSeats;
  
  var seats= adultSeats+ childrenSeats;
  var search = { From : from, To : to, FlightDate : date }   ;   
 
  
  switch (cabin){
   
  case ("First"):{
    search = { $and: [ search,  {First_Class_AvailableSeats : { $gte: seats}}  ]} ;
   
  }; break;
  
  case ("Business"):{
    search = { $and: [ search,  {Bussiness_Class_AvailableSeats : { $gte: seats}}  ]};
  
  }; break;
  
  case ("Economy"):{
    search = { $and: [ search,  {Economy_Class_AvailableSeats : { $gte: seats}}  ]};

  }; break;
  
  }
  
  var Flights;  
  var foundflag=true;
  await flight.find(search).then(foundflights => {
        if (foundflights.length!=0)
        Flights= foundflights;
        else
        foundflag=false;   // no results 
      });
  
  
  if (foundflag==true){
  
    var FlightsAndPrices=[];
  
  for (var i=0; i<Flights.length; i++){    // gets price of every departure flight
   var flight1= Flights[i]; var price;
   switch (cabin){
    case ("First"):{
     price = flight1.First_Class_Price * adultSeats + flight1.First_Class_Price * childrenSeats*0.7; } break;
      
    case ("Business"):{
     price = flight1.Business_Class_Price * adultSeats + flight1.Business_Class_Price * childrenSeats*0.7; } break;
      
    case ("Economy"):{
     price = flight1.Economy_Class_Price * adultSeats + flight1.Economy_Class_Price * childrenSeats*0.7; } break;
     
  }
  var f= { FlightDetails: flight1, TotalPrice: price}   //makes new object (flight & its corrosponding price)
  FlightsAndPrices.push(f) // pushes object (flight & its corrosponding price) to an array (departureFlightsAndPrices) 
  }
  
 res.send(FlightsAndPrices);  // array of objects [ {FlightDetails: x , TotalPrice: x } ]
  }
  else 
  res.send('1');

})

router.route("/changeFlight").post((req, res) => {
  var newFlight= req.body.newFlight.FlightDetails  // actual flight
  var newChosenSeats= req.body.NewChosenSeats;
  var Booking= req.body.Booking;
  var FlightDirection= req.body.FlightDirection;
  var Flight= req.body.Flight;  // to get seat array from & update it

  var cabin= Booking.Cabin; var adults= Booking.AdultSeats; var children= Booking.ChildrenSeats; 

  var totalSeats= adults+children;  
  var oldChosenSeats;

//1) update old flight's seats array (get old chosen seats in the corrosponding cabin)

if (FlightDirection=="DepartureFlight")   oldChosenSeats= Booking.DepartureChosenSeats;
else                                      oldChosenSeats= Booking.ReturnChosenSeats;

var seatsArray=[];
var availableSeats;
switch (cabin){
case ("First"):{  seatsArray=Flight.First_Class_Seats;       availableSeats=Flight.First_Class_AvailableSeats;} break;
case ("Business"):{  seatsArray=Flight.Business_Class_Seats; availableSeats=Flight.Business_Class_AvailableSeats;} break;
case ("Economy"):{  seatsArray=Flight.Economy_Class_Seats;   availableSeats=Flight.Economy_Class_AvailableSeats;} break;
}
availableSeats+=totalSeats;

for (var i=1;i<seatsArray.length; i++){
  for (var j=0; j<oldChosenSeats.length; j++)
          if (i== oldChosenSeats[j])   seatsArray[i]= 0  //-> seat became available
  }
  //now seatsArray & avaialable seats of old flight is updated --> update flight collection
  switch (cabin){
    case ("First"):{  
    flight.findOneAndUpdate({Flight_No: Flight.Flight_No},{ First_Class_Seats: seatsArray, First_Class_AvailableSeats: availableSeats  },{ new: true, upsert: true }).then(res);} break;
    case ("Business"):{  
    flight.findOneAndUpdate({Flight_No: Flight.Flight_No},{ Business_Class_Seats: seatsArray, Business_Class_AvailableSeats: availableSeats },{ new: true, upsert: true }).then(res);} break;
    case ("Economy"):{  
    flight.findOneAndUpdate({Flight_No: Flight.Flight_No},{ Economy_Class_Seats: seatsArray, Economy_Class_AvailableSeats: availableSeats },{ new: true, upsert: true }).then(res);} break;
    }

//2) update newFlight seats array & available seats 
 
var newFlightSeatsArray=[]; var newFlightAvailableSeats;
switch (cabin){
  case ("First"):{    newFlightSeatsArray = newFlight.First_Class_Seats;       newFlightAvailableSeats=newFlight.First_Class_AvailableSeats;} break;
  case ("Business"):{ newFlightSeatsArray  = newFlight.Business_Class_Seats; newFlightAvailableSeats=newFlight.Business_Class_AvailableSeats;} break;
  case ("Economy"):{  newFlightSeatsArray = newFlight.Economy_Class_Seats;   newFlightAvailableSeats=newFlight.Economy_Class_AvailableSeats;} break;
  }
  newFlightAvailableSeats= newFlightAvailableSeats- totalSeats;
  console.log(newFlightSeatsArray);

  for (var i=1;i<newFlightSeatsArray.length; i++){
    for (var j=0; j<newChosenSeats.length; j++)
            if (i== newChosenSeats[j])   newFlightSeatsArray[i]= 1  //-> seat became occupied
    }
    console.log(newFlightSeatsArray);
    //now seatsArray & avaialable seats of old flight is updated --> update flight collection

    switch (cabin){
      case ("First"):{  
      flight.findOneAndUpdate({Flight_No: newFlight.Flight_No},{ First_Class_Seats:  newFlightSeatsArray, First_Class_AvailableSeats: newFlightAvailableSeats  },{ new: true, upsert: true }).then(res);} break;
      case ("Business"):{  
      flight.findOneAndUpdate({Flight_No: newFlight.Flight_No},{ Business_Class_Seats:  newFlightSeatsArray, Business_Class_AvailableSeats: newFlightAvailableSeats },{ new: true, upsert: true }).then(res);} break;
      case ("Economy"):{  
      flight.findOneAndUpdate({Flight_No: newFlight.Flight_No},{ Economy_Class_Seats:  newFlightSeatsArray, Economy_Class_AvailableSeats: newFlightAvailableSeats },{ new: true, upsert: true }).then(res);} break;
      }

 //3) update booking collection with  new flight no & NewChosenSeats based on flight direction     
if (FlightDirection=="DepartureFlight"){
  booking.findOneAndUpdate({BookingNo: Booking.BookingNo},{DepartureFlightNo: newFlight.Flight_No, DepartureChosenSeats:  newChosenSeats},{ new: true, upsert: true }).then(res.send("1")); 
}  else{                                   
booking.findOneAndUpdate({BookingNo: Booking.BookingNo},{ReturnFlightNo: newFlight.Flight_No, ReturnChosenSeats:  newChosenSeats},{ new: true, upsert: true }).then(res.send("1"));
}

 })



 router.route("/selectReturnFlight").post((req, res) => {
  const dflightNo= req.body.departureFlightNo;

  flight.find({ Flight_No : dflightNo }).then(foundflights => {  //all cases (actions) shoud be inside then statement (variable changes in then statement dont get apllied outside then statement)
      dFrom= foundflights[0].From;   dTo= foundflights[0].To;
    res.send({dFrom:dFrom , dTo: dTo});
       });
 })

 router.route("/selectReturnFlight2").post((req, res) => {
  const dFrom= req.body.dFrom; const dTo= req.body.dTo;
  flight.find({ From : dTo, To: dFrom }).then(foundflights => {
        
          if (foundflights.length!=0)
          res.json(foundflights); 
          else
          res.send("1");   // no return flights available
        
 })
})

router.route("/getDFLight").post((req,res)=>{
  const departureFlightNo = req.body.DepartureFlightNo;

  flight.find({ Flight_No : departureFlightNo}).then(foundflights => {
    //console.log(foundflights);
    if (foundflights.length!=0)
    res.json(foundflights); 
    else
    res.send("0"); // not found
  })

});
router.route("/getRFLight").post((req,res)=>{
  const returnFlightNo = req.body.ReturnFlightNo;

  flight.find({ Flight_No : returnFlightNo}).then(foundflights => {
    //console.log(foundflights);
    if (foundflights.length!=0)
    res.json(foundflights); 
    else
    res.send("0"); // not found
  })

});

router.route("/booking").post((req,res)=>{ //check if seats available & calculate price
  const dFlightNo = req.body.departureFlightNo;
  const rFlightNo = req.body.returnFlightNo;
  const cabin = req.body.cabin;
  var adults = req.body.adults;
  var children = req.body.children;
  
  if (adults=="") adults=0; if (children=="") children=0;
  
    //check seats available then calculate price //check if seats available (& res.send(0))
var search= { $or: [{Flight_No: dFlightNo},{Flight_No: rFlightNo} ] }
  flight.find(search).then(foundflights => {
    //console.log(foundflights);
    
    var DFirstSeats = foundflights[0].First_Class_Seats;
    var DBusinessSeats = foundflights[0].Business_Class_Seats;
    var DEconomySeats = foundflights[0].Economy_Class_Seats;
    
    var RFirstSeats = foundflights[1].First_Class_Seats;
    var RBusinessSeats = foundflights[1].Business_Class_Seats;
    var REconomySeats = foundflights[1].Economy_Class_Seats;
   
    
    var DFirstPrice = foundflights[0].First_Class_Price;
    var DBusinessPrice = foundflights[0].Business_Class_Price;
    var DEconomyPrice = foundflights[0].Economy_Class_Price;
    
    var RFirstPrice = foundflights[1].First_Class_Price;
    var RBusinessPrice = foundflights[1].Business_Class_Price;
    var REconomyPrice = foundflights[1].Economy_Class_Price;

    var price;
    var seatsavailable=false;
    var seats= parseInt(adults) + parseInt(children);            //parseInt is used for int var from req.body to make sure they are read as int
    
    switch(cabin){
      case("First"):{
      if ( (seats <= DFirstSeats) && (seats <= RFirstSeats) ) {
        price = (adults*DFirstPrice)+(children*DFirstPrice*0.7)+(adults*RFirstPrice)+(children*RFirstPrice*0.7); 
        seatsavailable=true; }
        break;  }
      
        case("Business"):{
      if ((seats <= DBusinessSeats) && (seats <= RBusinessSeats))  { 
        price = (adults*DBusinessPrice)+(children*DBusinessPrice*0.7)+(adults*RBusinessPrice)+(children*RBusinessPrice*0.7); 
        seatsavailable=true; }
        break;  }

      case("Economy"):{
        if ( ( seats <= DEconomySeats ) && ( seats <= REconomySeats)  )  {   
        price = (adults*DEconomyPrice)+(children*DEconomyPrice*0.7)+(adults*REconomyPrice)+(children*REconomyPrice*0.7);
        seatsavailable=true;}
         break;  }

      }

      if (seatsavailable==true){
        //console.log(price);
        var price1= price+"";
        res.send(price1);   // seats available --> show price in frontend
      }
      else
      res.send("0");   // seats not available -> alert in frontend

      
    })

});

router.route("/confirmBooking").post((req,res)=>{ // update available seats in flights collection & make booking in booking collection
  const email= req.session.email;
  
  const dFlightNo = req.body.dFlightNo;
  const rFlightNo = req.body.rFlightNo;
  const cabin = req.body.cabin;
  var adults = req.body.adults;
  var children = req.body.children;
  const price = req.body.price;
  var departureChosenSeats= req.body.departureChosenSeats;
  var returnChosenSeats= req.body.returnChosenSeats;
  

 
   // making booking entry

  var bookingNo;
  booking.find().then(foundBookings => {      
   if (foundBookings.length==0)
   bookingNo=1;
   else 
   bookingNo= foundBookings[foundBookings.length-1].BookingNo + 1; //ensures unique booking no (even when canceling bookings)
   
   const newBooking = new booking({
    BookingNo: bookingNo,
    Email: email, 
    DepartureFlightNo: dFlightNo ,
    ReturnFlightNo: rFlightNo ,
    Cabin: cabin,
    AdultSeats: adults ,
    ChildrenSeats: children,
    DepartureChosenSeats: departureChosenSeats,
    ReturnChosenSeats: returnChosenSeats,  
    Price: price
    });
    newBooking.save();
    res.send("1"); // booking successful
    })

    

// updating flights (deduct available seats by no. of seats in booking

  var search= { $or: [{Flight_No: dFlightNo},{Flight_No: rFlightNo} ] }
  
  flight.find(search).then(foundflights => {      
    var departureFlight={}; var returnFlight={};
    if (foundflights[0].Flight_No == dFlightNo) { departureFlight=foundflights[0]; returnFlight=foundflights[1]; }
    else { departureFlight=foundflights[1]; returnFlight=foundflights[0]; }
    //console.log(foundflights);
    
    var DFirstAvailableSeats = departureFlight.First_Class_AvailableSeats;    // no of seats available
    var RFirstAvailableSeats =returnFlight.First_Class_AvailableSeats;

    var DFirstSeats = departureFlight.First_Class_Seats;                     // seats array
    var RFirstSeats =returnFlight.First_Class_Seats; 
    
    var DBusinessAvailableSeats =departureFlight.Business_Class_AvailableSeats;
    var RBusinessAvailableSeats =returnFlight.Business_Class_AvailableSeats;
    
    
    var DBusinessSeats =departureFlight.Business_Class_Seats;
    var RBusinessSeats =returnFlight.Business_Class_Seats;
    
    var DEconomyAvailableSeats =departureFlight.Economy_Class_AvailableSeats;
    var REconomyAvailableSeats = returnFlight.Economy_Class_AvailableSeats;
    
    var DEconomySeats =departureFlight.Economy_Class_Seats;
    var REconomySeats = returnFlight.Economy_Class_Seats;
   
    var seats= parseInt(adults) + parseInt(children);

    switch(cabin){
      case("First"):{
      
      // Seats Available Update
      DFirstAvailableSeats =DFirstAvailableSeats- seats;
      RFirstAvailableSeats = RFirstAvailableSeats- seats;
      
      // Seats Array Update
      for (var i=1;i<DFirstSeats.length; i++){
        for (var j=0; j<departureChosenSeats.length; j++)
             if (i== departureChosenSeats[j])   DFirstSeats[i]= 1  //-> seat occupied
      }
      for (var i=1;i<RFirstSeats.length; i++){
        for (var j=0; j<returnChosenSeats.length; j++)
             if (i== returnChosenSeats[j])   RFirstSeats[i]= 1  //-> seat occupied
      }
  
      flight.findOneAndUpdate({Flight_No:dFlightNo},{First_Class_AvailableSeats:DFirstAvailableSeats, First_Class_Seats: DFirstSeats},{ new: true, upsert: true }).then(res);
      flight.findOneAndUpdate({Flight_No:rFlightNo},{First_Class_AvailableSeats:RFirstAvailableSeats, First_Class_Seats: RFirstSeats},{ new: true, upsert: true }).then(res);
      
      break;  }
      
        case("Business"):{
      
          // Seats Available Update
          DBusinessAvailableSeats = DBusinessAvailableSeats- seats;
          RBusinessAvailableSeats =RBusinessAvailableSeats - seats;
          
          // Seats Array Update
          for (var i=1;i<DBusinessSeats.length; i++){
            for (var j=0; j<departureChosenSeats.length; j++)
                 if (i== departureChosenSeats[j])   DBusinessSeats[i]= 1  //-> seat occupied
          }
          for (var i=1;i<RBusinessSeats.length; i++){
            for (var j=0; j<returnChosenSeats.length; j++)
                 if (i== returnChosenSeats[j])   RBusinessSeats[i]= 1  //-> seat occupied
          }
      
          flight.findOneAndUpdate({Flight_No:dFlightNo},{Business_Class_AvailableSeats:DBusinessAvailableSeats, Business_Class_Seats: DBusinessSeats},{ new: true, upsert: true }).then(res);
          flight.findOneAndUpdate({Flight_No:rFlightNo},{Business_Class_AvailableSeats:RBusinessAvailableSeats, Business_Class_Seats: RBusinessSeats},{ new: true, upsert: true }).then(res);
          
          break;  }

      case("Economy"):{
      
        // Seats Available Update
        DEconomyAvailableSeats = DEconomyAvailableSeats- seats;
        REconomyAvailableSeats = DEconomyAvailableSeats- seats;
        
        // Seats Array Update
        for (var i=1;i<DEconomySeats.length; i++){
          for (var j=0; j<departureChosenSeats.length; j++)
               if (i== departureChosenSeats[j])   DEconomySeats[i]= 1  //-> seat occupied
        }
        for (var i=1;i<REconomySeats.length; i++){
          for (var j=0; j<returnChosenSeats.length; j++)
               if (i== returnChosenSeats[j])   REconomySeats[i]= 1  //-> seat occupied
        }
    
        flight.findOneAndUpdate({Flight_No:dFlightNo},{Economy_Class_AvailableSeats:DEconomyAvailableSeats, Economy_Class_Seats: DEconomySeats},{ new: true, upsert: true }).then(res);
        flight.findOneAndUpdate({Flight_No:rFlightNo},{Economy_Class_AvailableSeats:REconomyAvailableSeats, Economy_Class_Seats: REconomySeats},{ new: true, upsert: true }).then(res);
        
        break;  }

      }
    
         
    }) 
});

//------------------------------------------------------------------------------------------------------------------------
//adham
router.route("/UpdateBookingUser").post((req, res) => {
  //console.log("UpdateBookingUser");
 //console.log(email);

 const s = req.body.oldEmail;
 


 booking.find({Email :  s}, function (err, docs) {
  //console.log("TEST BEFORE");
 //  console.log(docs);
  // console.log("TEST AFTER");
   for(let i = 0; i < docs.length; i++)
   {
     docs[i]["Email"] = req.session.email;   // current & new email
     docs[i].save();
   }
 
  
});
})


router.route("/Updateinfo").post(async(req, res) => {
//Inputs
console.log(req.body);

var newEmailInput = req.body.email;  var newEmail=  newEmailInput.toLowerCase();

var newPassword = req.body.password; const encryptedNewPassword = await bcrypt.hash(newPassword, 10);  //Encrypt user new password
var oldPassword= req.body.oldPassword;

var emailNow= req.session.email;     // old email
const password = req.body.Password;  // old pass
//-----------------------------------------------------------------------------------------------

const User = await user.findOne({ Email: emailNow }); // user with same email  // old email

if ( (User) && (await bcrypt.compare(oldPassword, User.Password))) {        // (user) = user found/exists/true
//if old password is correct & user with old email exists (which actually always exists due to code structure)

user.find({Email: newEmail}).then(foundUser=>{
  if (foundUser.length==0){  //if  didn't find existing users with the new email user wants to use
     
     user.findOne({Email: emailNow}, function (err, user) {  // better way because it updates  // update user with old email
      //encrypt pass
      
      if(user){                   //user found/exists/true
      
       user.Password = encryptedNewPassword;
       user.Email = newEmail;
       
       user.save(function (err) { if(err) {}   });           // updatesSaved
            
       req.session.email=newEmail;   //change session email after successful update
       res.send({status:"1", oldEmail:emailNow});  //(old password given by user was correct) 
       }
       else res.send("2"); // wrong old password
     
     }); 
 }
  else
   res.send('0'); // email exists
 
 })

}
}) //end of route

router.route("/SendEmail").post( async (req, res) => {
var pdfObject= req.files.file
console.log(pdfObject)

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'fakeEmailACL@gmail.com',
      pass: 'Fake1234' // naturally, replace both with your real credentials or an application-specific password
    }
  });
  
  
  const mailOptions = {
    from: 'ACL_SAMYH_TEAM@GUC.com',
    to: req.session.email,
    subject: 'Itenerary',
    attachments:[{
      filename: 'Itinerary.pdf',
      content: pdfObject.data,     // the buffer of data of the file
      contentType: 'application/pdf'
  }]
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
    console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      res.send("1");
    }
  });
  

})


//---------------------------------------------------------------------------------------------------------------------
//mayar & shorouk
router.route("/SendCancelEmail").post( async (req, res) => {

  const booking = req.body.booking;
  //console.log(booking)
;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'fakeEmailACL@gmail.com',
      pass: 'Fake1234' // naturally, replace both with your real credentials or an application-specific password
    }
  });
  
  let mess = "Your booking has been cancelled. \nBooking Number: "  + booking.BookingNo + "\nRefund: " + booking.Price;
  const mailOptions = {
    from: 'ACL_SAMYH_TEAM@GUC.com',
    to: req.session.email,
    subject: 'Your cancelled reservation',
    text:mess 
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
    console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      res.send("1");
    }
  });

})

var selectedFlightID = "";
router.route('/FlightsListVal').post((req, res) => {
  selectedFlightID = req.body.id;
  //console.log(selectedFlightID);
});

router.route('/UpdatePage').post((req, res) => {
  //console.log(selectedFlightID);
  flight.findById(selectedFlightID, function (err, docs) {
   // console.log(docs);
    var flightVar = req.body;

    if (flightVar.FlightNo_.length != 0)
      docs["Flight_No"] = flightVar.FlightNo_;

    if (flightVar.FlightFrom_.length != 0)
      docs["From"] = flightVar.FlightFrom_;


    if (flightVar.FlightTo_.length != 0)
      docs["To"] = flightVar.FlightTo_;

    if (flightVar.FlightDate_.length != 0)
      docs["FlightDate"] = flightVar.FlightDate_;

    if (flightVar.FlightDep_.length != 0)
      docs["Departure"] = flightVar.FlightDep_;

    if (flightVar.FlightArr_.length != 0)
      docs["Arrival"] = flightVar.FlightArr_;

    if (flightVar.FlightFirst_.length != 0)
      docs["First_Class_Seats"] = flightVar.FlightFirst_;

    if (flightVar.FlightBus_.length != 0)
      docs["Business_Class_Seats"] = flightVar.FlightBus_;

    if (flightVar.FlightEco_.length != 0)
      docs["Economy_Class_Seats"] = flightVar.FlightEco_;

    docs.save();
  });
});


router.route('/cancel').post(async(req, res) => {
  const bookingNo = req.body.bookingNo;
 // console.log(bookingNo);

  var booking1={};
  var departureFlight={}; var returnFlight={};
  
  await booking.findOne({BookingNo : bookingNo}).then(res => booking1=res);

  var dFlightNo=booking1.DepartureFlightNo; var rFlightNo=booking1.ReturnFlightNo;
  
  var seats= parseInt(booking1.AdultSeats) + parseInt(booking1.ChildrenSeats);

  var departureChosenSeats= booking1.DepartureChosenSeats;
  var returnChosenSeats= booking1.ReturnChosenSeats;
  
  var search= { $or: [{Flight_No: dFlightNo},{Flight_No: rFlightNo} ] }
  
  flight.find(search).then(res => {
    if (res[0].Flight_No == dFlightNo) { departureFlight=res[0]; returnFlight=res[1]; }
    else { departureFlight=res[1]; returnFlight=res[0]; }

    var DFirstAvailableSeats = departureFlight.First_Class_AvailableSeats;    // no of seats available
    var RFirstAvailableSeats =returnFlight.First_Class_AvailableSeats;

    var DFirstSeats = departureFlight.First_Class_Seats;                     // seats array
    var RFirstSeats =returnFlight.First_Class_Seats; 
    
    var DBusinessAvailableSeats =departureFlight.Business_Class_AvailableSeats;
    var RBusinessAvailableSeats =returnFlight.Business_Class_AvailableSeats;
    
    
    var DBusinessSeats =departureFlight.Business_Class_Seats;
    var RBusinessSeats =returnFlight.Business_Class_Seats;
    
    var DEconomyAvailableSeats =departureFlight.Economy_Class_AvailableSeats;
    var REconomyAvailableSeats = returnFlight.Economy_Class_AvailableSeats;
    
    var DEconomySeats =departureFlight.Economy_Class_Seats;
    var REconomySeats = returnFlight.Economy_Class_Seats;
   
   
    
    //console.log(booking1); console.log("Departure Flight " + departureFlight); console.log("Return Flight " +returnFlight); 
  // here we have departure Flight  (depr)
   
   
  switch(booking1.Cabin){
  case("First"):{
      
    // Seats Available Update
    DFirstAvailableSeats += seats;
    RFirstAvailableSeats += seats;
    
    // Seats Array Update
    for (var i=1;i<DFirstSeats.length; i++){
      for (var j=0; j<departureChosenSeats.length; j++)
           if (i== departureChosenSeats[j])   DFirstSeats[i]= 0  //-> seat available
    }
    for (var i=1;i<RFirstSeats.length; i++){
      for (var j=0; j<returnChosenSeats.length; j++)
           if (i== returnChosenSeats[j])   RFirstSeats[i]= 0  //-> seat available
    }

    flight.findOneAndUpdate({Flight_No:dFlightNo},{First_Class_AvailableSeats:DFirstAvailableSeats, First_Class_Seats: DFirstSeats},{ new: true, upsert: true }).then(res);
    flight.findOneAndUpdate({Flight_No:rFlightNo},{First_Class_AvailableSeats:RFirstAvailableSeats, First_Class_Seats: RFirstSeats},{ new: true, upsert: true }).then(res);
    
    break;  }
    case("Business"):{
      
      // Seats Available Update
      DBusinessAvailableSeats += seats;
      RBusinessAvailableSeats += seats;
      
      // Seats Array Update
      for (var i=1;i<DBusinessSeats.length; i++){
        for (var j=0; j<departureChosenSeats.length; j++)
             if (i== departureChosenSeats[j])   DBusinessSeats[i]= 0  //-> seat available
      }
      for (var i=1;i<RBusinessSeats.length; i++){
        for (var j=0; j<returnChosenSeats.length; j++)
             if (i== returnChosenSeats[j])   RBusinessSeats[i]= 0  //-> seat available
      }
  
      flight.findOneAndUpdate({Flight_No:dFlightNo},{Business_Class_AvailableSeats:DBusinessAvailableSeats, Business_Class_Seats: DBusinessSeats},{ new: true, upsert: true }).then(res);
      flight.findOneAndUpdate({Flight_No:rFlightNo},{Business_Class_AvailableSeats:RBusinessAvailableSeats, Business_Class_Seats: RBusinessSeats},{ new: true, upsert: true }).then(res);
      
      break;  }

  case("Economy"):{
  
    // Seats Available Update
    DEconomyAvailableSeats += seats;
    REconomyAvailableSeats += seats;
    
    // Seats Array Update
    for (var i=1;i<DEconomySeats.length; i++){
      for (var j=0; j<departureChosenSeats.length; j++)
           if (i== departureChosenSeats[j])   DEconomySeats[i]= 0  //-> seat available
    }
    for (var i=1;i<REconomySeats.length; i++){
      for (var j=0; j<returnChosenSeats.length; j++)
           if (i== returnChosenSeats[j])   REconomySeats[i]= 0  //-> seat available
    }

    flight.findOneAndUpdate({Flight_No:dFlightNo},{Economy_Class_AvailableSeats:DEconomyAvailableSeats, Economy_Class_Seats: DEconomySeats},{ new: true, upsert: true }).then(res);
    flight.findOneAndUpdate({Flight_No:rFlightNo},{Economy_Class_AvailableSeats:REconomyAvailableSeats, Economy_Class_Seats: REconomySeats},{ new: true, upsert: true }).then(res);
    
    break;  }

  }


booking.findOneAndDelete({BookingNo : bookingNo}).then(res);

  });

});

router.route('/changeSeats').post(async(req, res) => {
//console.log(req.body);
//updating booking
var bookingNo= req.body.BookingNo;
var flightDirection= req.body.FlightDirection;
var newChosenSeats= req.body.NewChosenSeats;

if (flightDirection=="DepartureFlight")
booking.findOneAndUpdate({BookingNo: bookingNo },{DepartureChosenSeats: newChosenSeats},{ new: true, upsert: true }).then(res);
else
booking.findOneAndUpdate({BookingNo: bookingNo },{ReturnChosenSeats: newChosenSeats},{ new: true, upsert: true }).then(res);


//updating flight
var flightNo=req.body.FlightNo;
var cabin=req.body.Cabin;  
var newSeatsArray= req.body.NewSeatsArray;

  switch(cabin){
    case("First"):{
    
      flight.findOneAndUpdate({Flight_No: flightNo },{First_Class_Seats: newSeatsArray},{ new: true, upsert: true }).then(res.send("1"));
      }break;
    
    case("Business"):{
     
      flight.findOneAndUpdate({Flight_No: flightNo },{Business_Class_Seats: newSeatsArray},{ new: true, upsert: true }).then(res.send("1"));
      }break;
    
    case("Economy"):{
        
        flight.findOneAndUpdate({Flight_No: flightNo },{Economy_Class_Seats: newSeatsArray},{ new: true, upsert: true }).then(res.send("1") );
        }break;
  }
});

//----------------------------------------------------------------------------------------------------------------------
//admin

router.route('/delete/:id').delete(async(req, res) => {                       //delete flight
  const idNum = req.params.id;
   await flight.findOneAndDelete({_id : idNum}, function (err, docs) {
   // console.log(err);
   });
  res.send("deleted");
});

router.route("/addFlight").post((req,res) => {
  const flightNo= req.body.flightNo;
  const from= req.body.from;
  const to= req.body.to;
  const date= req.body.date;
  const departure= req.body.departure;
  const arrival= req.body.arrival;
  const firstSeats= req.body.firstSeats;
  const businessSeats= req.body.businessSeats;
  const economySeats= req.body.economySeats;

 
  const newFlight = new flight({
    Flight_No: flightNo,
    From: from,
    To: to,
    FlightDate: date,
    Departure: departure,
    Arrival: arrival,
    First_Class_Seats: firstSeats,
    Business_Class_Seats: businessSeats,
    Economy_Class_Seats: economySeats

  });

  newFlight.save();
});


router.route("/getFlightByNo").post((req, res) => {
  const x = req.body.flightNo;
  flight.find({ Flight_No : x }).then(foundflights => res.send(foundflights))
  });

router.route("/getFlightByFrom").post((req, res) => {
  const x = req.body.from;
  console.log(x);
  flight.find({ From : x}).then(foundflights => res.send(foundflights))
  });

  router.route("/getFlightByTo").post((req, res) => {
    const x = req.body.to;
    console.log(x);
    flight.find({ To : x}).then(foundflights => res.send(foundflights))
    });

    router.route("/getFlightByDate").post((req, res) => {
      const x = req.body.date;
      console.log(x);
      flight.find({ FlightDate : x}).then(foundflights => res.send(foundflights))
      });

      router.route("/getFlightByDeparture").post((req, res) => {
        const x = req.body.departure;
        console.log(x);
        flight.find({ Departure : x}).then(foundflights => res.send(foundflights))
        });

        router.route("/getFlightByArrival").post((req, res) => {
          const x = req.body.arrival;
          console.log(x);
          flight.find({ Arrival : x}).then(foundflights => res.send(foundflights))
          });



router.route("/FlightsList").get((req, res) => {
  flight.find()
    .then(foundflights => res.json(foundflights))
});

//-----------------------------------------------------------------------------------------------------------------------
//one-time execution for addding things in the database

///*
router.route("/addFlightManual").get((req,res) => {
  var d; var a;
var LAX= "LAX (Los Angeles International Airport, California, USA)";  
var JFK= "JFK (John F. Kennedy International Airport, New York, USA)" ; 
var LHR= "LHR (Heathrow Airport, London, England)"  ;
var CAI= "CAI (Cairo International Airport, Cairo, Egypt)"  ;
var DXB= "DXB (Dubai International Airport, Dubai, UAE)"  ;
var CDG= "CDG (Paris Charles de Gaulle Airport, Paris, France)"  ;
var MUC= "MUC (Munich International Airport, Munich, Germany)"  ;
var RUH= "RUH (King Khalid International Airport, Riyadh, Saudi Arabia)" ; 
var YYZ= "YYZ (Toronto Pearson International Airport, Toronto, Canada)";  
var FRA= "FRA (Frankfurt Airport, Frankfurt, Germany)";  
 
  function duration(departure, arrival){         //function for calculating duration
    var x= departure.split(":"); var y= arrival.split(":");
    var h= (y[0]-x[0]) ;  var m;   
    
    if (x[1]>y[1]){
    h=h-1;
    m= (60-x[1]) + parseInt(y[1]);      
  }
    else
    m= (y[1]-x[1]); 
  
    h2=  h + ""; m2= m + "";
    
    if (h2.length<2) h2= "0" + h;   if (m2.length<2) m2= "0" + m;
    
    var duration= h2 + ":" + m2; 
    return duration;
    }
  
    var FirstSeats= new Array(16+1).fill(0); var BusinessSeats= new Array(30+1).fill(0); var EconomySeats= new Array(60+1).fill(0); 
    
    // 0 in seats array means 0-> Seat Available &  1-> Seat Occupied 

  d= "10:00"; a= "14:00";
    
    const newFlight1 = new flight({
    Flight_No: 1,
    From: LAX, 
    To: JFK,
  
    FlightDate: "2022-01-12",
    Departure: d,
    Arrival: a,
    Duration: duration(d,a),
  
    First_Class_Seats: FirstSeats,
    Business_Class_Seats: BusinessSeats,
    Economy_Class_Seats: EconomySeats,

    First_Class_AvailableSeats: FirstSeats.length-1, 
    Business_Class_AvailableSeats: BusinessSeats.length-1,
    Economy_Class_AvailableSeats: EconomySeats.length-1,
  
    First_Class_BaggageAllowance: 4,
    Business_Class_BaggageAllowance: 3,
    Economy_Class_BaggageAllowance: 2,
  
    First_Class_Price: 5000,
    Business_Class_Price: 3000,
    Economy_Class_Price: 1500

  });
   newFlight1.save();

   d= "14:00"; a= "18:00";
   const newFlight2 = new flight({
    Flight_No: 2,
    From: JFK,
    To: LAX,
  
    FlightDate: "2022-01-22",
    Departure: d,
    Arrival: a,
    Duration: duration(d,a),
  
    First_Class_Seats: FirstSeats,
    Business_Class_Seats: BusinessSeats,
    Economy_Class_Seats: EconomySeats,

    First_Class_AvailableSeats: FirstSeats.length-1, 
    Business_Class_AvailableSeats: BusinessSeats.length-1,
    Economy_Class_AvailableSeats: EconomySeats.length-1,
  
    First_Class_BaggageAllowance: 4,
    Business_Class_BaggageAllowance: 3,
    Economy_Class_BaggageAllowance: 2,
  
    First_Class_Price: 5000,
    Business_Class_Price: 3000,
    Economy_Class_Price: 1500

  });
   newFlight2.save();

   d= "10:00"; a= "12:00";
   const newFlight3 = new flight({
    Flight_No: 3,
    From: JFK,
    To: LHR,
  
    FlightDate: "2022-02-21",
    Departure: d,
    Arrival: a,
    Duration: duration(d,a),
  
    First_Class_Seats: FirstSeats,
    Business_Class_Seats: BusinessSeats,
    Economy_Class_Seats: EconomySeats,

    First_Class_AvailableSeats: FirstSeats.length-1, 
    Business_Class_AvailableSeats: BusinessSeats.length-1,
    Economy_Class_AvailableSeats: EconomySeats.length-1,
  
    First_Class_BaggageAllowance: 4,
    Business_Class_BaggageAllowance: 3,
    Economy_Class_BaggageAllowance: 2,
  
    First_Class_Price: 2500,
    Business_Class_Price: 1500,
    Economy_Class_Price: 750

  });
   newFlight3.save();

   d= "10:00"; a= "12:00";
   const newFlight4 = new flight({
    Flight_No: 4,
    From: LHR,
    To: JFK,
  
    FlightDate: "2022-03-06",
    Departure: d,
    Arrival: a,
    Duration: duration(d,a),
  
    First_Class_Seats: FirstSeats,
    Business_Class_Seats: BusinessSeats,
    Economy_Class_Seats: EconomySeats,

    First_Class_AvailableSeats: FirstSeats.length-1, 
    Business_Class_AvailableSeats: BusinessSeats.length-1,
    Economy_Class_AvailableSeats: EconomySeats.length-1,
  
    First_Class_BaggageAllowance: 4,
    Business_Class_BaggageAllowance: 3,
    Economy_Class_BaggageAllowance: 2,
  
    First_Class_Price: 2500,
    Business_Class_Price: 1500,
    Economy_Class_Price: 750

  });
   newFlight4.save();

   d= "10:00"; a= "14:00";
    
    const newFlight5 = new flight({
    Flight_No: 5,
    From: LAX, 
    To: JFK,
  
    FlightDate: "2022-01-12",
    Departure: d,
    Arrival: a,
    Duration: duration(d,a),
  
    First_Class_Seats: FirstSeats,
    Business_Class_Seats: BusinessSeats,
    Economy_Class_Seats: EconomySeats,

    First_Class_AvailableSeats: FirstSeats.length-1, 
    Business_Class_AvailableSeats: BusinessSeats.length-1,
    Economy_Class_AvailableSeats: EconomySeats.length-1,
  
    First_Class_BaggageAllowance: 4,
    Business_Class_BaggageAllowance: 3,
    Economy_Class_BaggageAllowance: 2,
  
    First_Class_Price: 5000,
    Business_Class_Price: 3000,
    Economy_Class_Price: 1500

  });
   newFlight5.save();
   

   res.send("success");
});
//*/

module.exports = router;
