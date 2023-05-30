"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */
// async function so we can pause the function as needed to run other portions/get promises back
// the await keyword pauses execution until the StoryList.getStories function is resolved = will return a promise before the rest of the function can continue
// we remove the $storiesLoadingMsg using the remove method
//call putStoriesOnPage() from stories.js

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories(); // ** this is where we add stories thanks to the getStories() method in the StoryList class from models.js
  
  $storiesLoadingMsg.remove(); //global variable on main.js

  putStoriesOnPage(storyList.stories); //function at bottom of page that calls on another function from this page
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // this story comes from the function below which is an array of stories and we loop through each story and send it here
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName(); //called from models.js
  // console.log(currentUser);

  // we need an to confirm if the story passed into the function has the same id as a story in the currentUser's ounStories data. If they match, we need a way to put a trashcan/delete button on it
  // The some() method is used to determine is there is any story within the ownStories array of the currentUser object that has the same storyId as the current story being processed in the loop where s is the currentUser story and story is the one we are checking from below.
  // if yes then truthy and will include the trashcan.delete button
  let getDeleteButton =
    currentUser && currentUser.isOwnStory(story.storyId)
      ? `<i class="fas fa-trash delete-icon"></i>` // these two lines are a conditional/ternary operator saying if true include trash can : false empty string
      : ``;

  //function to put stars on the stories once logged in much like the delete button
  let getStarButton =
    currentUser && currentUser.isFavorite(story)
      ? `<i class="fas fa-star star-icon"></i>`
      : `<i class="far fa-star star-icon"></i>`;

  // once we determine if the story is posted by the user or not this function returns an li with an id, the results of the trashbutton, the star (empty and filled respectively), an anchor element with the url from the story and target set to blank to open the link in a new tab, then smaller elements holding the hostname, author and username
  return $(`
      <li id="${story.storyId}">
        ${getDeleteButton}
        ${getStarButton}
        <a href="${story.url}" target="_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}




/** Gets list of stories from server, generates their HTML, and puts on page. */

// regular function created to loop through an array of stories - stories will change depending on which anchor tag is clicked in nav.js (whether it be all stories, favorites, or my stories)
// we first console log the name of the function to show it was called
// we empty the element to make sure that we are starting fresh
// we loop using a for...of loop over the array and for each story we 
//   1) call generateStoryMarkup using said story (this function is responsible for generating the HTML markup for a single story based on its data)
//   2) appends the story to the parent element
// after we are done looping we set the parent to show making it visible on the page

function putStoriesOnPage(stories) { //argument of stories comes from nav.js
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
    for (let story of stories) {
      const $story = generateStoryMarkup(story); // this is where the li magic happens - see above for the steps it takes

      // Function to handle star icon click event
      function handleStarIconClick(event) {
        const storyId = $(event.target).closest("li").attr("id");
        const story = storyList.stories.find((s) => s.storyId === storyId);
        if (currentUser.isFavorite(story)) {
        currentUser.addOrRemoveFavStory('remove', story);
        $(event.target).addClass('far').removeClass('fas')
        } else {
          currentUser.addOrRemoveFavStory('add', story);
          $(event.target).addClass('fas').removeClass('far')
        }
      }

      // Function to handle delete icon click event
      function handleDeleteIconClick(event) {
        const storyId = $(event.target).closest("li").attr("id");
        const storyIndex = storyList.stories.findIndex(
          (s) => s.storyId === storyId
        );

        if (storyIndex !== -1) {
          // Remove the story from the storyList
          storyList.stories.splice(storyIndex, 1);

          // Remove the story element from the DOM
          $(event.target).closest("li").remove();

          //remove story fromt he backend as well
          storyList.removeStory(currentUser, storyId)
        }
      }

      // Attach click event handlers to star and delete icons
      if(currentUser) {
        $story.find(".star-icon").click(handleStarIconClick);
      } else {
        $story.find(".star-icon").hide();
      }
      $story.find(".delete-icon").click(handleDeleteIconClick);

      $allStoriesList.append($story);
    }
  
  $allStoriesList.show();
}

// we need a function to delete a story



// we need a function to submit a new story
// async function - first step is to call a debug to review console to make sure it was called - next step we want to prevent the default on the page. 
// we need to grab the information from the form using variables to make it easier to access - title, url, author are all from user inputs in form and the username and data are attached to the currentuser information
// so next we need to use an await to pause the function and call the addStory function of the storyList object and pass the currentUser and storyData and we wait for the promise to come back - we attach this to a variable for use later in the function
// Once we get the promise back we need to make it into an <li> like we did above so we are calling generateStoryMarkup on the variable story that we made and prepending the new variable $story to the parentelement of $allStoriesList to put it on top of the list
//lastly, we want the submitForm to be hidden once the story is submitted so we slide up and reset it at the end of the function


async function submitNewStory(e) {
  console.debug('submitNewStory');
  e.preventDefault();

  const title = $("#create-title").val();
  const url = $("#create-url").val();
  const author = $("#create-author").val();
  const username = currentUser.username;
  const storyData = { title, url, author, username };

  const story = await storyList.addStory(currentUser, storyData);

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);
    
  $submitForm.hide();
  $submitForm.trigger("reset");
}

//we need an event listener for the submitForm so on a submit (aka button click) we run the function from above
$submitForm.on("submit", submitNewStory);
