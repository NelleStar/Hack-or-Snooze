"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

// login is a asynchronous function that takes an evt
// we start with console logging the name of the function and preventing the default action on the page which would normally refresh the page on a submit
// next we make variables for username and password by grabbing the information that the user placed into the form
// then, the function pauses while we take the User class and using the login method within that class we retrieve the user information from the API and return the promise of the User instance which is saved to currentUser
//after we receive that the login form triggers a reset event to remove any user placed information
//we then save the user credentials using the function provided and update the UI as well

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}

//event listener calling the login function (above) on a submit in this form
$loginForm.on("submit", login);

/** Handle signup form submission. */

// asynchronous function that will first console log the name of the function and prevents default as the event
// declared variables of name, username, password --- all taken from the form
// the currentUser then becomes the User instance using these variables using an await where the function pauses until we get the promise response back
// we call saveUserCredentialsInLocalStorage to save the information on refresh or coming back to site on same browser
// we call updateUIOnUserLogin to update the information being shown on the page (now includes favorites, my stories, logout, profile)
// .trigger() method is used with a built in event 'reset' at the end to clear any user entered data

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup method retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  $signupForm.trigger("reset");
}

// event listener calling the signup function (above) on a submit in this form
$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

//event listener on a click of the navLogOut calling the above function
$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

// localStorage is an object provided by JS - stores key value pairs - no need to declare anywhere
// this asynchronous function will first log the name of the function so help us see when it is called
//2 constant variables are declared - the first is retrieving the value associated with the token key from localStorage  and accesses the value stored there - the other will do the same except it is looking for username information and assigns it according
// the if statement is staying if either the token or username variable is falsy/empty/not present then return false - this is false when the required credentials are not present in localStorage
// if truthy then we continue onto currentUser which is awaiting the user.loginViaStoredCredentials method to complete and return a promise - what is returned is saved as currentUser

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username); //models.js function
}

/** Sync current user information to localStorage for automatic login
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

//so how do we cave the user info? first we console log the name of the function to ensure we see it being called then we have an if statement saying -
//if we have currentUser object (aka someone logged in) then we set 2 items - token is the currentUser.loginToken and username is currentUser is the currentUser.username

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");

  hidePageComponents(); //need to call this to reset the page
  
  getAndShowStoriesOnStart(); //to show stories but this time with stars

  updateNavOnLogin(); //to change the navBar

  generateUserProfile(); // to make a user profile
}

/** Show a "user profile" part of page built from the current user's info. */
// created a hard coded user profile div in html file with these ids as the name, username, and date

function generateUserProfile() {
  console.debug("generateUserProfile");

  $("#profile-name").text(currentUser.name);
  $("#profile-username").text(currentUser.username);
  $("#profile-account-date").text(currentUser.createdAt.slice(0, 10));
}