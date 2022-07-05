import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Route} from "react-router-dom";  // react-router & react-router-dom v5.1.2
import react, {useEffect,useState} from "react";
import WebFont from 'webfontloader';

//imported jsx components should start with uppercase letter


import Admin from './components/Admin/Admin';                         //admin
import AddFlight from './components/Admin/addFlight';  
import FlightsList from './components/Admin/FlightsList';
import SearchFlight from './components/Admin/SearchFlight';
import SearchResults from './components/Admin/SearchResults';
import UpdatePage from './components/Admin/UpdatePage';

                       
import SignUp from './components/Others/SignUp';                               //Main (Others) Components
import SignIn from './components/Others/SignIn';
import EditProfile from './components/Others/EditProfile';

import LandingPage from './components/LandingPage';                                 //Main Components
import FlightSelector from './components/FlightSelector';
import MyBookings from './components/MyBookings';



function App() {
  
  useEffect(() => {
    WebFont.load({
      google: {
        families: ['Droid Sans', 'Chilanka', 'Josefin Sans', 'Roboto']
      }
    });
   }, []);

  return (
    <Router>
     
          
      <Route exact path="/SignUp">
      <SignUp/>
      </Route>
     
      <Route exact path="/SignIn">
      <SignIn/>
      </Route>

      <Route exact path="/EditProfile">
        <EditProfile/>
      </Route>



      <Route exact path="/">
      <LandingPage/>
      </Route>

      <Route exact path ="/FlightSelector">
        <FlightSelector/>
      </Route>
     
      <Route exact path="/MyBookings">
      <MyBookings/>
      </Route>
      
     



      <Route exact path="/admin">
      <Admin/>
      </Route>
      
      <Route exact path="/addFlight">
      <AddFlight/>
      </Route>

      <Route exact path ="/FlightsList">
        <FlightsList/>
      </Route>

      
      <Route exact path ="/SearchFlight">
        <SearchFlight/>
      </Route>
      
      <Route exact path ="/SearchResults">
        <SearchResults/>
      </Route>


      <Route exact path ="/UpdatePage">
        <UpdatePage/>
      </Route> 
    
     
    </Router>
    
)}

export default App;