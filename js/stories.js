"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */
function generateStoryMarkup(story) {
  let storyUrl = story.url;
  let hostName = story.getHostName(storyUrl);

  const $story = $(`
      <li id="${story.storyId}">
      <span><i class="fa-regular fa-heart favorite"></i> 
       

        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">${hostName}</small>
        <small class="story-author">by ${story.author} </small>
        
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
  if (story.username === currentUser.username) {
    $story.prepend($deleteBtn);
  }
  return $story;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}
async function showFavoriteStories() {
  $allStoriesList.hide();
  let favoriteStoryArr = await currentUser.favorites;
  for (let faveStory of favoriteStoryArr) {
    const $faveStory = generateStoryMarkup(faveStory);
    $("#favorite-stories-list").append($faveStory);
  }
}
async function storySubmission() {
  let title = $storyTitle.val();
  let author = $storyAuthor.val();
  let url = $storyUrl.val();
  let username = currentUser.username;

  let $storyObj = { title, author, url, username };

  let newStory = await storyList.addStory(currentUser, $storyObj);

  const $newStory = generateStoryMarkup(newStory);

  $allStoriesList.prepend($newStory);

  $newStory.prepend($deleteBtn);

  $storyTitle.val("");
  $storyAuthor.val("");
  $storyUrl.val("");
  $allStoriesList.show();
  $storiesForm.hide();
}
$submitBtn.on("click", function (e) {
  e.preventDefault();
  storySubmission();
});
