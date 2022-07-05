import react, {useEffect,useState} from "react";
import { Route, Redirect, useLocation } from "react-router-dom";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import { css} from '@emotion/css'


import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import ArticleIcon from '@mui/icons-material/Article';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';

import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import * as React from 'react';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from '@mui/material/MenuList';
import Divider from '@mui/material/Divider';


function NavBar(props){      //for USER & GUEST
   
    const location = useLocation();
    const history = useHistory();
    const [x,setUser]=useState();
    const [guestMode,setGuestMode]=useState(false);
    axios.defaults.withCredentials = true;
    
    useEffect(() => {
        axios.get('http://localhost:8000/currentUser').then(res =>{ 
        if (res.data==0){                                    // no guest logged in or user logged in
        axios.get('http://localhost:8000/addGuest'); setGuestMode(true); console.log(res.data);}
        else if (res.data.type=="Guest") setGuestMode(true); // guest looged in
        else {setUser(res.data.email); setGuestMode(false)};   //user logged in
     })
    }, [location]);

    function handleclick7(event){
        event.preventDefault();
        history.push({
        pathname: '/'})
    }
    function handleclick8(event){
        event.preventDefault();
        history.push({pathname: '/EditProfile' });
    }
    function handleclick9(event){
        event.preventDefault();
        axios.get('http://localhost:8000/logout').then(
        history.push({
            pathname: '/'}));
            window.location.reload();
    }
    function showBookings(event){
        event.preventDefault();
        history.push({
        pathname: '/MyBookings'}); 
    }

// MUI Profile Dropdown
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  function signIn(event){
    event.preventDefault();
    history.push({
    pathname: '/SignIn'}); 
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);
 
// ----------------------

var formFlag=false;
var mode=props.state1;              // "landingPage" or "Page" or "form ->sign in & sign up"

//Normal Page NavBar Style
var style1= css` width: 100%; display:flex; height: 75px; position: fixed; padding-top:15px; 
z-index:1;  font-family:"Josefin Sans"; color:	#2C85B8; box-shadow: 0px 0px 10px 1px lightGray; background-color:white;  ` ;

//Landing Page NavBar Style 
var style2= css` width: 100%; display:flex; height: 75px; position: fixed; padding-top:15px;   
z-index:1; font-family:"Josefin Sans"; color:white;  `  ;

var style;

if (mode=="landingPage") style= style2;
else if (mode=="Page")        style= style1;
else { style= style1; formFlag=true}  // signIn & signup pages

return (
  <div className={style}>
       
     
        
       <img className={css`position: absolute; left: 10%; &:hover{cursor: pointer;`} onClick={handleclick7} src="/logo.png" />
      
        
      {formFlag==false &&<div name="Book_MyBookings" className={css`position: absolute; left: 71%; top:22%; font-size: 22px; ` }>
      <label className={css`&:hover{cursor: pointer;} `} onClick={handleclick7}>Book</label>  
      &nbsp; &nbsp; &nbsp;    
   
      <label className={css` &:hover{cursor: pointer;}`} onClick={showBookings}>My Bookings</label> 
      &nbsp; &nbsp; &nbsp;  
   
     </div>}
      
  <div name="ProfileIcon">

  {guestMode && <button class="btn btn-primary"  style={{ position: 'absolute' , left: '89%', top:'13%'}}  onClick={signIn}>Sign In</button>}
   <AccountCircleRoundedIcon className={css`position: absolute; top:23%;left: 85%; transform: scale(1.5); &:hover{cursor: pointer; `}  ref={anchorRef}
          id="composition-button"
          aria-controls={open ? 'composition-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="true"
          onClick={handleToggle} />
          <Popper
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            placement="bottom-end"
            transition
            disablePortal
          >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === 'bottom-start' ? 'left top' : 'left bottom',
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList
                    autoFocusItem={open}
                    id="composition-menu"
                    aria-labelledby="composition-button"
                    onKeyDown={handleListKeyDown}
                  >
                     &nbsp;&nbsp;&nbsp;<PersonIcon/>
                    
                    &nbsp; {guestMode && <a>Guest</a>}{x} &nbsp;&nbsp;
               
                                     
                  {guestMode==false && 
                  <a> <Divider/>
                    <MenuItem onClick={handleclick8}><EditIcon/> &nbsp; Edit Profile</MenuItem>
                    <MenuItem onClick={handleclick9}>&nbsp;<LogoutIcon/> &nbsp;  Sign Out</MenuItem>
                  </a>}

                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
        </div>

 </div>


);
} 

export default NavBar;
