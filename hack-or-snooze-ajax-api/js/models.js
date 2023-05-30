"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */
  //The object that is needed to make this constructor is created when retrieving data from the API
  //this. keyword refers to THIS current instance of an object - so this specific story we are breaking down
  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */
  // getHostName is a method we defined within the story class to parse the hostname from the URL of a story and returning it - 
  

  getHostName() {
    return new URL(this.url).host //creates new URL object (built in feature of JS) using the this.url property of the current Story instance --- the URL object represents the story url
    //.host property of the URL object returns the hostname/domain name (think google.com instead of https://google.com)
    //convenient way to extract and display the hostname
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances (see above)
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map((story) => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** 2A - Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(user, { title, author, url }) {
    try {
      const token = user.loginToken; //to make the token grabbing easier

      //an asynchronous request to server using axios to the stories endpoint with the token and a story details in an object --- the response is saved in variable response
      const response = await axios.post(`${BASE_URL}/stories`, { 
        token,
        story: { title, author, url },
      });

      //now we need to extract the story property from the response.data object
      const { story } = response.data;

      //a new Story is created by using the {story} data and saved as variable
      const newStory = new Story(story);

      //newStory is added to ownStories array of user object //unshift() method adds to beginning
      user.ownStories.unshift(newStory);
      //same idea but this time adding to the storyList.stories array at the beginning
      storyList.stories.unshift(newStory);

      //need to return newStory
      return newStory;
    } catch (error) {
      console.error("Error adding story:", error);
      throw error;
    }
  }

  //need a way to delete a story from list based on the 
  async removeStory(user, storyId) {
    const token = user.loginToken; //to make the token grabbing easier
    await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: 'DELETE',
      data: {token: user.loginToken}
    });

    // Now we need to filer them out of the stories, own stories and favorite stories arrays

    this.stories = this.stories.filter(story => story.storyId !== storyId);
    
    user.ownStories = user.ownStories.filter(story => story.storyId !== storyId);

    user.favorites = user.favorites.filter(story => story.storyId !== storyId);
  }
}

/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor(
    { username, name, createdAt, favorites = [], ownStories = [] },
    token
  ) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map((s) => new Story(s));
    this.ownStories = ownStories.map((s) => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */
  // static functions belongs to the class rather than instances and is invoked using the classname.functionname instead of creating an object ....so User.loginViaStoredCredentials(token,username)
  // being async this function will log in a user based on the stored credentials
  //wrapped in a try...catch(err) block to console log any error that it might run into and return null
  //the try portion declares a variable called response which is an axios library http get request (object being created with the url, method, params)
  //because response is an await - we pause the execution of the method until the response is received
  // create an object called user and pass that into the return statment of return new User to get an instance of this specific user

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data; //extracts user property from the response.data object and assigns it to user so we dont have to go around typing response.data.user all the time ---destructuring at its finest
      // use this object of user and slip it into User to create a new instance

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  isOwnStory(storyId) {
    return this.ownStories.some((s) => s.storyId === storyId);
  }

  isFavorite(story) {
    return this.favorites.some((s) => s.storyId === story.storyId);
  }

  // addFavorite(story) {
  //   this.favorites.push(story);
  // };

  // removeFavorite(story) {
  //   this.favorites = this.favorites.filter(
  //     (favStory) => favStory.storyId !== story.storyId
  //   );
  // }

  //for step 3A we need to allow logged in users to favorite and unfavorite a story and they should remain favorited when the page refreshes. They should see these as a separate list

  // we will first make a function to add or remove a story and to do so we much change the state of the story from add to remove or vise versa along with either pushing it into the array or filtering it out of the array
  async addOrRemoveFavStory(newState, story, token) {
    if (newState === "add") {
      this.favorites.push(story);
      const method = "POST";
      await axios({
        url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
        method,
        data: { token },
      });
    } else if (newState === "remove") {
      this.favorites = this.favorites.filter(
        (favorite) => favorite.storyId !== story.storyId
      );
      const method = "DELETE";
      await axios({
        url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
        method,
        data: { token: this.loginToken },
      });
    }
  }
}
