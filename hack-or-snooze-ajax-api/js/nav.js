"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */
function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage(storyList.stories);
}

// 2B states we need to show submit new story form
function navSubmitNewStory(evt) {
  console.debug("navSubmitNewStory", evt);
  hidePageComponents();
  putStoriesOnPage(storyList.stories);
  $submitForm.show()
}

//show favorite stories list 
function navFavoriteStories(evt) {
  console.debug("navFavoriteStories", evt);
  hidePageComponents();
  putStoriesOnPage(currentUser.favorites);
}

// 2B states to show list of stoies submitted
function navMyStories(evt) {
  console.debug("navMyStories", evt);
  hidePageComponents();
  putStoriesOnPage(currentUser.ownStories);
}

// click events for the all stories, submit, favorite, mystories in nav bar
$body.on("click", "#nav-all", navAllStories);
$body.on("click", "#nav-submit", navSubmitNewStory);
$body.on("click", "#nav-favorites", navFavoriteStories);
$body.on("click", "#nav-my-stories", navMyStories);

/** Show login/signup on click on "login" */

//function that takes an event and does the following
// 1-console.debug will log the even to console
// 2- hide Page components to hide certain aspects from the user for good UI experience - function found in main.js
// 3- shows the 2 forms by modifying their class to 

function navLoginClick(evt) { 
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();  
  $signupForm.show();
}
//event listener for the above function
$navLogin.on("click", navLoginClick);

function navProfileClick(evt) {
  console.debug('navProfileClick', evt);
  hidePageComponents();
  $userProfile.show();
}

$navUserProfile.on('click', navProfileClick)

/** When a user first logins in, update the navbar to reflect that. */
// this is called in the main.js file in the updateUIOnUserLogin function
function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}


