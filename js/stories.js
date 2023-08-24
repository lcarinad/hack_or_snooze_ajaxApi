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
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
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
// async function storySubmission() {
//   let user = new User();
//   let token = user.token;
//   let title = $storyTitle.val();
//   let author = $storyAuthor.val();
//   let url = $storyUrl.val();

//   const storyList = await StoryList.getStories();
//   await storyList.addStory(token, { title, author, url });
//   $(".stories-form input").val("");
// }
async function storySubmission(user, { title, author, url }) {
  const storyList = await StoryList.getStories(); // Get a StoryList instance

  // Call the addStory method with the correct user and story data
  const newStory = await storyList.addStory(user, { title, author, url });

  // Clear input values after successfully adding the story
  $storyTitle.val("");
  $storyAuthor.val("");
  $storyUrl.val("");
  console.log(newStory);
}
$submitBtn.on("click", function (e) {
  e.preventDefault();
  storySubmission();
});
