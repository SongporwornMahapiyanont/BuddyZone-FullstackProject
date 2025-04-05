let currentQuestionIndex = 0;
const questions = [
  {
    question: "1.How do you usually spend your free time?",
    options: ["Reading", "Playing Games", "Exercising", "Hanging out"],
    selectedOption: null,
  },
  {
    question: "2.What type of music do you prefer?",
    options: ["Rock", "Pop", "Jazz", "Classical"],
    selectedOption: null,
  },
  {
    question: "3.What is your favorite activity?",
    options: ["Sports", "Art", "Traveling", "Cooking"],
    selectedOption: null,
  },
  {
    question: "4.How do you prefer to relax?",
    options: ["Watching TV", "Listening to music", "Meditation", "Socializing"],
    selectedOption: null,
  },
  {
    question: "5.Do you enjoy being outdoors?",
    options: ["Yes", "No", "Sometimes", "It depends"],
    selectedOption: null,
  },
  {
    question: "6.What type of movies do you like?",
    options: ["Action", "Comedy", "Drama", "Horror"],
    selectedOption: null,
  },
  {
    question: "7.How do you feel about team sports?",
    options: [
      "I love them",
      "Not interested",
      "I play occasionally",
      "I prefer individual sports",
    ],
    selectedOption: null,
  },
  {
    question: "8.Are you an early bird or a night owl?",
    options: ["Early bird", "Night owl", "Depends on the day", "Neither"],
    selectedOption: null,
  },
  {
    question: "9.Do you enjoy reading books?",
    options: ["Yes", "No", "Sometimes", "I prefer audiobooks"],
    selectedOption: null,
  },
  {
    question: "10.Do you like traveling?",
    options: ["Yes", "No", "I love it", "It depends on the destination"],
    selectedOption: null,
  },
];

function showNextQuestion() {
  const questionContainer = document.getElementById("questions");
  questionContainer.innerHTML = "";

  if (currentQuestionIndex === questions.length - 1) {
    document.getElementById("next-button").style.display = "none";
    document.getElementById("complete-button").style.display = "block";
  }

  const q = questions[currentQuestionIndex];

  const questionElement = document.createElement("div");
  questionElement.innerHTML = `
    <p>${q.question}</p>
    <div class="radio-input">
      ${q.options
        .map(
          (option, i) => `
        <label class="label">
          <input 
            type="radio" 
            id="value-${currentQuestionIndex}-${i}" 
            name="value-radio" 
            value="${option}" 
            ${q.selectedOption === option ? "checked" : ""}
            onchange="saveAnswer(${currentQuestionIndex}, '${option}')"
          />
          <p class="text">${option}</p>
        </label>
      `
        )
        
        .join("")}
        
    </div>
  `;
  questionContainer.appendChild(questionElement);''
}

function saveAnswer(index, value) {
  questions[index].selectedOption = value;
}

window.onload = function () {
  showNextQuestion();

  document.getElementById("next-button").addEventListener("click", function () {
    currentQuestionIndex++;
    showNextQuestion();
  });

  document
    .getElementById("complete-button")
};
