"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

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

$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.

  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage();

  updateUIOnUserLogin();
  alert("You've create an account!");
  $signupForm.trigger("reset");
}

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

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}
function saveUserFavoritesInLocalStorage() {
  console.debug("saveUserFavoritesinLocalStorage");
  if (currentUser) {
    localStorage.setItem("favorites", currentUser.favorites);
  }
}
function removeUserFavoritesInLocalStorage() {
  console.debug("removeUserFavoritesinLocalStorage");
  if (currentUser) {
    localStorage.removeItem("favorites", currentUser.favorites);
  }
  console.log(currentUser);
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

  $allStoriesList.show();
  $signupForm.hide();
  $loginForm.hide();
  updateNavOnLogin();
}
async function addToFavorite(story) {
  console.debug("addUserFavorite");
  let username = currentUser.username;
  await axios.post(`${BASE_URL}/users/${username}/favorites/${story}`, {
    token: currentUser.token,
  });

  saveUserFavoritesInLocalStorage();
}
async function deleteFavorite(storyId) {
  console.debug("removeUserFavorite");
  let username = currentUser.username;

  let token = currentUser.token;
  await axios.delete(`${BASE_URL}/users/${username}/favorites/${storyId}`, {
    data: { token },
  });

  removeUserFavoritesInLocalStorage();
}
async function deleteStory(storyId) {
  let token = currentUser.token;
  await axios.delete(`${BASE_URL}/stories/${storyId}`, {
    data: { token },
  });
}

$("#all-stories-list").on("click", ".favorite", function (e) {
  e.preventDefault();
  const $li = $(this).closest("li");
  const idValue = $li.attr("id");

  $(this).toggleClass("fa-solid clicked");

  if ($(this).hasClass("fa-solid clicked")) {
    addToFavorite(idValue);
  } else {
    deleteFavorite(idValue);
  }
});

$("#all-stories-list").on("click", ".delete", function (e) {
  e.preventDefault();
  const $li = $(this).closest("li");
  const idValue = $li.attr("id");

  const confirmed = window.confirm(
    "Are you sure you want to delete this story?"
  );
  if (confirmed) {
    $li.remove();
    deleteStory(idValue);
  } else {
  }
});
