"use strict";

// So we don't have to keep re-finding things on page, find DOM elements once:

const $body = $("body"); //body

const $storiesLoadingMsg = $("#stories-loading-msg"); //msg to have on screen while stories load
const $allStoriesList = $("#all-stories-list"); // ol in html for all-stories

const $loginForm = $("#login-form"); // form id in html for login information
const $signupForm = $("#signup-form"); //form id in html for sign-up information

const $navLogin = $("#nav-login"); //anchor tag in nav right portion 
const $navUserProfile = $("#nav-user-profile"); //anchor tag in nav right portion - does not have anything written in now but will be dynamically filled in a function in nav.js
const $navLogOut = $("#nav-logout"); //anchor tag for logout in html - hidden

const $submitForm = $('#submit-form'); // html form for new stories submit form
const $userProfile = $('#user-profile'); // html div for user profile information

/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
 */

// a function that build an array of different page components
// each c in the array holds reference to a specific html element some of which still needs to be created
//.forEach allows us to loop through the array and call the hide method which sets the css stying to display: none

function hidePageComponents() {
  const components = [
    $allStoriesList, //html ol
    $loginForm, // html form
    $signupForm, // html form
    $submitForm, //id for new story form 
    $userProfile // id for user profile 
  ];
  components.forEach(c => c.hide()); //hides each element from array
}

/** Overall function to kick off the app. */
// an async function to operate asynchronously --- will log the message start to console and serves as a debugging tool
// next we await for the completion of the checkForRememberedUser function to run from the user.js file --- suspending the execution of the function until the promise is returned
// next we await the getAndShowStoriesOnStart from the stories.js file - suspends the exectution of the start function until a promise is returned 
// The if statement is looking for a truthy(if it has a value or not) which it may or not not have depending on what comes back from the first await - if we get a truthy back then we run updateUIOnUserLogin from the user.js file

async function start() {
  console.debug("start");

  // "Remember logged-in user" and log in, if credentials in localStorage
  await checkForRememberedUser(); //user.js function that pulls from models.js
  await getAndShowStoriesOnStart(); //stories.js function that pulls from models.js

  // if we got a logged-in user
  if (currentUser) updateUIOnUserLogin();
}

// Once the DOM is entirely loaded, begin the app

console.warn("HEY STUDENT: This program sends many debug messages to" +
  " the console. If you don't see the message 'start' below this, you're not" +
  " seeing those helpful debug messages. In your browser console, click on" +
  " menu 'Default Levels' and add Verbose");
$(start);
