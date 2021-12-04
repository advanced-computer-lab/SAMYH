const nodemailer = require("nodemailer");
const express = require("express");
const { ConnectionPoolClosedEvent } = require("mongodb");

const router= express.Router();
const flight = require('../Models/Flights');
const user = require('../Models/User');
const booking = require('../Models/Booking');


router.route("/addGuest").get((req,res) => { //get becuase no input
   user.find({ Type : "Guest"}).then(foundguests => {  //all cases (actions) shoud be inside then statement (variable changes in then statement dont get apllied outside then statement)
     var x = foundguests.length + 1;
     var guestEmail= "guest"+ x;
   
     const newGuest = new user({
      Name : "Guest",
      Email : guestEmail,
      Password : "guest",
      Type: "Guest", 
      
       });
      newGuest.save();
      res.send(guestEmail); 
    })
 });

router.route("/addUser").post((req,res) => {
  const name= req.body.name;
  const email= req.body.email;
  const password= req.body.password;

  user.find({ Email : email}).then(founduser => {  //all cases (actions) shoud be inside then statement (variable changes in then statement dont get apllied outside then statement)
   if (founduser.length!= 0) 
    res.send("1"); 
   else {
    
    res.send("0"); 
    const newUser = new user({
      Name : name,
      Email : email,
      Password : password,
      Type: "Customer" 
       });
      newUser.save();
      }  
    })
 });

 var currentUserEmail = "";


router.route("/SignIn").post((req, res) => {
  const x = req.body.Email;  const y = req.body.Password;


  currentUserEmail = x;

  user.find({ Email : x , Password: y}).then(founduser => {  //all cases (actions) shoud be inside then statement (variable changes in then statement dont get apllied outside then statement)
    if (founduser.length!= 0) {
    
      switch (founduser[0].Type){
        case ("Admin"):{
          res.send("2");            // admin found -> sign in as admin
          console.log("found admin");  break;
        }
        case ("Customer"):{
          res.send("1");    //user found -> sign in as user
      console.log("found user"); break;
        }
        default:  {res.send("0"); break;}

      }
    }
     else  
     res.send("0");  //user not found -> don't sign in
  })

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
})

router.route("/MyBookings").get((req, res) => {
  booking.find({Email : currentUserEmail})
    .then(foundBookings => res.json(foundBookings))
})

router.route("/SendCancelEmail").post( async (req, res) => {

  console.log("Hamaddaaa");
  console.log(req);
  const details = req.body.details;
  const From = req.body.From;
  const To = req.body.To;
  let testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'kiana.ryan36@ethereal.email',
        pass: 'BxEqFHCUPC636EeTmK'
    }
});

      let mess = 'Amount to be refunded: ' + details.Price + "Booking Number: "  + details.BookingNo + " Departure From: " + From[0] + " || To: " + To[0] + " \n Return From: " + From[1] + " || To: " + To[1] ;
      let info = await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: details.Email, // list of receivers
        subject: "Cancelled Flight ", // Subject line
        text: mess, // plain text body
        html: "<b>" + mess +"</b>", // html body
      }).catch(console.error);
      transporter.sendMail();

      console.log("Message sent: %s", info.messageId);
  
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
})

var selectedFlightID = "";
router.route('/FlightsListVal').post((req, res) => {
  selectedFlightID = req.body.id;
  console.log(selectedFlightID);
});

router.route('/UpdatePage').post((req, res) => {
  console.log(selectedFlightID);
  flight.findById(selectedFlightID, function (err, docs) {
    console.log(docs);
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

router.route("/searchFlightUser").post((req, res) => {
var SPflag= false;

  const from= req.body.from;
  const to= req.body.to;
  const date= req.body.date;
  const departure= req.body.departure;
  const arrival= req.body.arrival;
  const cabin= req.body.cabin;
  const seats= req.body.seats;
  const price= req.body.price;

 var search={};
if (from.length!=0) 
search = { $and: [ search,  {From : from}  ] }; 

if (to.length!=0) 
search = { $and: [ search,  {To : to}  ] };

if (date.length!=0) 
search = { $and: [ search,  {FlightDate : date}  ] };

if (departure.length!=0) 
search = { $and: [ search,  {Departure : departure}  ] };

if (arrival.length!=0) 
search = { $and: [ search,  {Arrival : arrival}  ] };


//Note: when checking seats & price assume you user must select cabin

if (seats.length!=0){      
SPflag=true;                                        // seat/price input  

switch (cabin){
 
case ("First"):{
  search = { $and: [ search,  {First_Class_Seats : { $gte: seats}}  ] }; break;
};
case ("Business"):{
  search = { $and: [ search,  {Bussiness_Class_Seats : { $gte: seats}}  ] }; break;
}
case ("Economy"):{
  search = { $and: [ search,  {Economy_Class_Seats : { $gte: seats}}  ] }; break;
}
default: { res.send("0"); break;}                  // no cabin input -> error in frontend
}
}

if (price.length!=0){ 
 
  SPflag=true;                                     // seat/price input  


  switch (cabin){
  case ("First"):{
    search = { $and: [ search,  {First_Class_Price : { $lte: price}}  ] }; break;
  };
  case ("Business"):{
    search = { $and: [ search,  {Bussiness_Class_Price : { $lte: price}}  ] }; break;
  }
  case ("Economy"):{
    search = { $and: [ search,  {Economy_Class_Price : { $lte: price}}  ] }; break;
  }
  default: { res.send("0"); break;}                // no cabin input -> error in frontend
  }
  }

var s=false;                              //search statement used in find statement is by default empty

if ( Object.keys(search).length != 0){   // if the search statement isn't empty to catch no reults error
  var s=true;                             //search statement used in find statement isn't empty
  flight.find(search)
     .then(foundflights => {
      if (foundflights.length!=0)
      res.json(foundflights); 
      else
      res.send("1");
    });
    
    }

   if (SPflag==false && s==false)   // if search statement was empty & no seat/price input
    res.send("1");                  // no results (no search criteria was entered)
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
  const email= req.body.email;
  const dFlightNo = req.body.departureFlightNo;
  const rFlightNo = req.body.returnFlightNo;
  const cabin = req.body.cabin;
  var adults = req.body.adults;
  var children = req.body.children;
  const price = req.body.price;


  if (adults=="") adults=0; if (children=="") children=0;
  
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
    Price: price
    });
    newBooking.save();
    res.send("1"); // booking successful
    })

    

  var search= { $or: [{Flight_No: dFlightNo},{Flight_No: rFlightNo} ] }
  flight.find(search).then(foundflights => {
    //console.log(foundflights);
    
    var DFirstSeats = foundflights[0].First_Class_Seats;
    var DBusinessSeats = foundflights[0].Business_Class_Seats;
    var DEconomySeats = foundflights[0].Economy_Class_Seats;
    
    var RFirstSeats = foundflights[1].First_Class_Seats;
    var RBusinessSeats = foundflights[1].Business_Class_Seats;
    var REconomySeats = foundflights[1].Economy_Class_Seats;
   
    var seats= parseInt(adults) + parseInt(children);

    console.log(seats);
    switch(cabin){
      case("First"):{
      var DFirstSeatsUpdate = DFirstSeats - seats;
      var RFirstSeatsUpdate = RFirstSeats - seats;
      
      flight.findOneAndUpdate({Flight_No:dFlightNo},{First_Class_Seats:DFirstSeatsUpdate},{ new: true, upsert: true }).then(res);
      flight.findOneAndUpdate({Flight_No:rFlightNo},{First_Class_Seats:RFirstSeatsUpdate},{ new: true, upsert: true }).then(res);
        break;  }
      
        case("Business"):{

          var DBusinessSeatsUpdate = DBusinessSeats - seats;
          var RBusinessSeatsUpdate = RBusinessSeats - seats;
          
          flight.findOneAndUpdate({Flight_No:dFlightNo},{Business_Class_Seats:DBusinessSeatsUpdate},{ new: true, upsert: true }).then(res);
          flight.findOneAndUpdate({Flight_No:rFlightNo},{Business_Class_Seats:RBusinessSeatsUpdate},{ new: true, upsert: true }).then(res);
   
        break;  }

      case("Economy"):{
        var DEconomySeatsUpdate = DEconomySeats - seats;
        var REconomySeatsUpdate = REconomySeats - seats;
        
        flight.findOneAndUpdate({Flight_No:dFlightNo},{Economy_Class_Seats:DEconomySeatsUpdate},{ new: true, upsert: true }).then(res);
        flight.findOneAndUpdate({Flight_No:rFlightNo},{Economy_Class_Seats:REconomySeatsUpdate},{ new: true, upsert: true }).then(res);
       
         break;  }

      }
    
         
    }) 
});




/*
router.route("/addFlightManual").get((req,res) => {
  var d; var a;
 
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
   
  d= "10:00"; a= "14:00";
    
    const newFlight1 = new flight({
    Flight_No: 1,
    From: "LAX",
    To: "JFK",
  
    FlightDate: "2022-01-12",
    Departure: d,
    Arrival: a,
    Duration: duration(d,a),
  
    First_Class_Seats: 6,
    Business_Class_Seats: 10,
    Economy_Class_Seats: 20,
  
    First_Class_BaggageAllowance: 4,
    Business_Class_BaggageAllowance: 3,
    Economy_Class_BaggageAllowance: 2,
  
    First_Class_Price: 5000,
    Business_Class_Price: 3000,
    Economy_Class_Price: 1500

  });
   newFlight1.save();

   d= "10:00"; a= "14:00";
   const newFlight2 = new flight({
    Flight_No: 2,
    From: "JFK",
    To: "LAX",
  
    FlightDate: "2022-01-22",
    Departure: d,
    Arrival: a,
    Duration: duration(d,a),
  
    First_Class_Seats: 16,
    Business_Class_Seats: 15,
    Economy_Class_Seats: 30,
  
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
    From: "JFK",
    To: "LHR",
  
    FlightDate: "2022-02-21",
    Departure: d,
    Arrival: a,
    Duration: duration(d,a),
  
    First_Class_Seats: 5,
    Business_Class_Seats: 2,
    Economy_Class_Seats: 22,
  
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
    From: "LHR",
    To: "JFK",
  
    FlightDate: "2022-03-06",
    Departure: d,
    Arrival: a,
    Duration: duration(d,a),
  
    First_Class_Seats: 16,
    Business_Class_Seats: 26,
    Economy_Class_Seats: 43,
  
    First_Class_BaggageAllowance: 4,
    Business_Class_BaggageAllowance: 3,
    Economy_Class_BaggageAllowance: 2,
  
    First_Class_Price: 2500,
    Business_Class_Price: 1500,
    Economy_Class_Price: 750

  });
   newFlight4.save();

   res.send("success");
});
*/

module.exports = router;
