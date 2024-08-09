// Bibin Tom Joseph / 8991987

"use strict"

// Variable to hold the questions fetched from remote
let questions = [] 

// Variable to hold the index of the currently asked question
let currentQuestionIndex = -1

// Holds the total score of the user per game
let score = 0

// Use this callback to do the inital setup after page loads
$(document).ready(() => {
  setupEventListeners()
  reset()
  startNewGame()
})

// Use this function to setup event listeners
function setupEventListeners() {
  $("#play-again").click(() => {
    reset()
    startNewGame()
  })
}

// Use this function to reset the UI
function reset() {
  questions = []
  currentQuestionIndex = -1
  score = 0
  $("#question-root-container").hide()
  $("#result-container").hide()
  $('#nav-score-content').text(`${score}/5`)
  $("#home-footer").hide()
}

// Use this function to start a new game.
function startNewGame() {
  getQuizFromRemote()
}

// Use this function to show the next questions to the user.
function showNextQuestion() {
  // Updates the current question index
  currentQuestionIndex += 1
  $("#question-root-container").fadeIn(500)
  
  // Loads the next question from array and shows it to the user
  const questionContent = questions[currentQuestionIndex]
  const question = decodeHTMLEntities(questionContent.question)
  $("#question-number").text(`Question ${currentQuestionIndex+1}`)
  $("#question-content").text(question)
  
  // Fetches options for the current question. Includes correct answer to the options and randomizes it.
  let options = questionContent.incorrect_answers
  options.push(questionContent.correct_answer)
  randomize(options)

  // Generates options anchor tags and populates it to the UI for the user to select.
  let htmlContent = ""
  let index = -1
  options.forEach((item) => {
    index += 1
    htmlContent += `<a id="${index}">${item}</a>`
  })
  $("#options-container").html(htmlContent);

  // Adds click event handler to the option
  $("#options-container a").click((evt) => {
    let clickItem = evt.currentTarget;    
    // Checks if its correct or not.
    const isCorrect = clickItem.text == questionContent.correct_answer
    if (isCorrect) {
      score += 1
    }

    // Setting the color green or red based on the answer
    $(`#${clickItem.id}`).css('background-color', isCorrect ? 'green' : 'red')
    
    // Updating score at the navigation bar
    $('#nav-score-content').text(`${score}/5`)

    // Removing event listener to prevent multiple taps
    $("#options-container a").each((item, element) => {
      $(element).off('click')
      // Setting the correct option as green incase user selected the wrong answer.
      if (element.text == questionContent.correct_answer) {
        $(element).css('background-color', 'green')
      }
    })

    
    if (currentQuestionIndex == 4) {
      // If last question, show the result after 1 second delay
      setTimeout(() => {
        $("#question-root-container").fadeOut(500, showResult)
      }, 1000)

    } else {
      // else show the next question after 1 second delay
      setTimeout(() => {
        $("#question-root-container").fadeOut(500, showNextQuestion)
      }, 1000)
    }
  })
}

// Use this function to show the result UI to the user.
function showResult() {
  $("#question-root-container").fadeOut(500)
  $("#result-container").fadeIn(500)
  $('#score-content').text(`${score}/5`)
  $('#nav-score-content').text(`${score}/5`)
}

/// Call this function to get new set of questions from remote
/// API Call
function getQuizFromRemote() {
  // Public API to get quiz
  const getQuizAPIURL = "https://opentdb.com/api.php?amount=5&category=9&difficulty=easy&type=multiple"
  fetch(getQuizAPIURL)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    // Send the response down the pipeline
    return response.json();
  })
  .then(data => {
    loadQuestionsFromData(data)
  })
  .catch(error => {
    // Fetch was not success. 
    // Load backup questions and show to user.

    console.log("API Failed. Loaded from backup questions")
    loadQuestionsFromData(backupQuestions)
  });
}

function loadQuestionsFromData(data) {
  // Setting results(questions) to questions variable
  questions = data.results;
  // Show the first question
  showNextQuestion()
  // Showing the footer after response is recieved
  $("#home-footer").fadeIn(500)
}

// Use this function to randomize the contents of an array.
function randomize(array) {
  for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
}

function decodeHTMLEntities(text) {
  var textArea = $('<textarea/>').html(text);
  return textArea.val();
}