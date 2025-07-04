document.addEventListener("DOMContentLoaded", () => {
  // --- Variabel Global & Elemen DOM ---
  let quizQuestions = []; // Akan diisi dari file JSON
  let currentQuestionIndex = 0;
  let score = 0;
  let selectedPacketQuestions = [];
  let userAnswers = [];
  let selectedAnswer = null;
  let timerInterval = null;

  const screens = {
    start: document.getElementById("start-screen"),
    packetSelection: document.getElementById("packet-selection-screen"),
    quiz: document.getElementById("quiz-screen"),
    result: document.getElementById("result-screen"),
    review: document.getElementById("review-screen"),
  };

  const modal = {
    overlay: document.getElementById("confirmation-modal"),
    title: document.getElementById("modal-title"),
    text: document.getElementById("modal-text"),
    confirmButton: document.getElementById("modal-confirm-button"),
    cancelButton: document.getElementById("modal-cancel-button"),
  };

  const startButton = document.getElementById("start-button");
  const packetButtons = document.querySelectorAll(".packet-button");
  const nextButton = document.getElementById("next-button");
  const restartButton = document.getElementById("restart-button");
  const reviewButton = document.getElementById("review-button");
  const backToResultButton = document.getElementById("back-to-result-button");
  const backToStartButton = document.getElementById("back-to-start-button");
  const quizBackButton = document.getElementById("quiz-back-button");

  const questionCounter = document.getElementById("question-counter");
  const timerDisplay = document.getElementById("timer");
  const progressBar = document.getElementById("progress-bar");
  const questionText = document.getElementById("question-text");
  const optionsContainer = document.getElementById("options-container");

  const scoreText = document.getElementById("score-text");
  const scoreBar = document.getElementById("score-bar");
  const feedbackContainer = document.getElementById("feedback-container");
  const reviewContainer = document.getElementById("review-container");

  // --- Definisi Fungsi Aplikasi ---

  function showScreen(screenId) {
    Object.values(screens).forEach((screen) =>
      screen.classList.remove("active")
    );
    if (screens[screenId]) {
      screens[screenId].classList.add("active");
    }
  }

  function showConfirmationModal(title, text, onConfirm) {
    modal.title.innerText = title;
    modal.text.innerText = text;
    modal.overlay.classList.add("active");

    modal.confirmButton.onclick = () => {
      modal.overlay.classList.remove("active");
      onConfirm();
    };
    modal.cancelButton.onclick = () => {
      modal.overlay.classList.remove("active");
    };
  }

  function selectPacket(packetType) {
    let duration = 0;
    let packetName = "";

    if (packetType === "a") {
      selectedPacketQuestions = quizQuestions.slice(155, 183);
      duration = 30 * 60;
      packetName = "Paket A";
    } else if (packetType === "b") {
      selectedPacketQuestions = quizQuestions.slice(125, 155);
      duration = 30 * 60;
      packetName = "Paket B";
    } else if (packetType === "p15") {
      selectedPacketQuestions = quizQuestions.slice(100, 125);
      duration = 25 * 60;
      packetName = "Paket P15";
    } else if (packetType === "1") {
      selectedPacketQuestions = quizQuestions.slice(0, 50);
      duration = 50 * 60;
      packetName = "Paket 1";
    } else if (packetType === "2") {
      selectedPacketQuestions = quizQuestions.slice(50, 100);
      duration = 50 * 60;
      packetName = "Paket 2";
    } else {
      selectedPacketQuestions = [...quizQuestions].sort(
        () => Math.random() - 0.5
      );
      duration = 120 * 60;
      packetName = "Semua Soal";
    }

    showConfirmationModal(
      `Mulai ${packetName}?`,
      `Anda akan memiliki waktu ${
        duration / 60
      } menit untuk menyelesaikan kuis ini. Apakah Anda siap?`,
      () => startQuiz(duration)
    );
  }

  function startQuiz(duration) {
    showScreen("quiz");
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = new Array(selectedPacketQuestions.length).fill(null);
    selectedAnswer = null;
    startTimer(duration);
    loadQuestion();
  }

  function startTimer(duration) {
    let timeLeft = duration;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      const minutes = Math.floor(timeLeft / 60);
      let seconds = timeLeft % 60;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      timerDisplay.innerText = `${minutes}:${seconds}`;
      if (--timeLeft < 0) {
        clearInterval(timerInterval);
        showResult();
      }
    }, 1000);
  }

  function loadQuestion() {
    selectedAnswer = null;
    nextButton.disabled = true;

    const currentQuestion = selectedPacketQuestions[currentQuestionIndex];
    const totalQuestions = selectedPacketQuestions.length;

    questionCounter.innerText = `Soal ${
      currentQuestionIndex + 1
    } dari ${totalQuestions}`;
    const progressPercentage =
      ((currentQuestionIndex + 1) / totalQuestions) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    questionText.innerText = currentQuestion.question;

    optionsContainer.innerHTML = "";
    currentQuestion.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.innerHTML = `<span class="font-semibold">${String.fromCharCode(
        65 + index
      )}.</span> ${option}`;
      button.className =
        "p-4 rounded-lg text-left w-full transition-all duration-200 border-2 bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500";
      button.onclick = () => handleAnswerSelect(option, button);
      optionsContainer.appendChild(button);
    });

    quizBackButton.disabled = currentQuestionIndex === 0;
  }

  function handleAnswerSelect(option, buttonElement) {
    selectedAnswer = option;
    nextButton.disabled = false;
    Array.from(optionsContainer.children).forEach((btn) => {
      btn.className =
        "p-4 rounded-lg text-left w-full transition-all duration-200 border-2 bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500";
    });
    buttonElement.className =
      "p-4 rounded-lg text-left w-full transition-all duration-200 border-2 bg-sky-500 border-sky-400 scale-105 shadow-lg";
  }

  function handleNextQuestion() {
    userAnswers[currentQuestionIndex] = selectedAnswer;
    if (currentQuestionIndex < selectedPacketQuestions.length - 1) {
      currentQuestionIndex++;
      loadQuestion();
    } else {
      clearInterval(timerInterval);
      showResult();
    }
  }

  function showResult() {
    showScreen("result");
    const totalQuestions = selectedPacketQuestions.length;
    let finalScore = 0;
    for (let i = 0; i < totalQuestions; i++) {
      if (userAnswers[i] === selectedPacketQuestions[i].answer) {
        finalScore++;
      }
    }
    const percentage =
      totalQuestions > 0 ? Math.round((finalScore / totalQuestions) * 100) : 0;
    let feedback = {
      text: "Perlu Belajar Lagi",
      color: "text-red-400",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2.25m0 4.5h.008v.008H12v-.008zm0-9a9 9 0 100 18 9 9 0 000-18z" /></svg>`,
    };

    if (percentage >= 90) {
      feedback = {
        text: "Luar Biasa!",
        color: "text-green-400",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75" /><circle cx="12" cy="12" r="9" /></svg>`,
      };
    } else if (percentage >= 70) {
      feedback = {
        text: "Bagus!",
        color: "text-yellow-400",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 17.25c2.485 0 4.5-2.015 4.5-4.5s-2.015-4.5-4.5-4.5-4.5 2.015-4.5 4.5 2.015 4.5 4.5 4.5z" /><circle cx="12" cy="12" r="9" /></svg>`,
      };
    }

    feedbackContainer.innerHTML = `${feedback.icon} <span>${feedback.text}</span>`;
    feedbackContainer.className = `flex items-center justify-center gap-2 text-2xl font-bold mb-4 ${feedback.color}`;
    scoreText.innerHTML = `Anda berhasil menjawab <span class="text-sky-400 font-bold text-2xl">${finalScore}</span> dari <span class="font-bold text-2xl">${totalQuestions}</span> soal.`;
    scoreBar.style.width = `${percentage}%`;
    scoreBar.innerText = `${percentage}%`;
  }

  function showReview() {
    showScreen("review");
    reviewContainer.innerHTML = "";
    selectedPacketQuestions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      const isCorrect = userAnswer === question.answer;
      const reviewItem = document.createElement("div");
      reviewItem.className = `p-4 rounded-lg border-l-4 ${
        isCorrect
          ? "border-green-500 bg-slate-700/50"
          : "border-red-500 bg-slate-700/50"
      }`;
      const icon = isCorrect
        ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-400 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`;
      reviewItem.innerHTML = `
        <p class="font-bold text-lg mb-2">Soal ${question.id}: ${
        question.question
      }</p>
        <p class="text-sm ${
          isCorrect ? "text-green-400" : "text-red-400"
        }">${icon}Jawaban Anda: <span class="font-semibold">${
        userAnswer || "Tidak dijawab"
      }</span></p>
        ${
          !isCorrect
            ? `<p class="text-sm text-sky-400 mt-1"><span class="font-bold">Jawaban Benar:</span> ${question.answer}</p>`
            : ""
        }
      `;
      reviewContainer.appendChild(reviewItem);
    });
  }

  function setupEventListeners() {
    startButton.addEventListener("click", () => showScreen("packetSelection"));
    backToStartButton.addEventListener("click", () => showScreen("start"));
    packetButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const packet = e.currentTarget.getAttribute("data-packet");
        selectPacket(packet);
      });
    });
    nextButton.addEventListener("click", handleNextQuestion);
    restartButton.addEventListener("click", () => {
      showConfirmationModal(
        "Ulangi Latihan?",
        "Anda akan kembali ke halaman pemilihan paket. Progres saat ini akan hilang.",
        () => showScreen("packetSelection")
      );
    });
    reviewButton.addEventListener("click", showReview);
    backToResultButton.addEventListener("click", () => showScreen("result"));
    quizBackButton.addEventListener("click", () => {
      if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
      }
    });
  }

  // --- Eksekusi Utama ---
  fetch("public/questions.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      quizQuestions = data;
      setupEventListeners();
      showScreen("start"); // Tampilkan layar awal setelah semua siap
    })
    .catch((error) => {
      console.error("Gagal memuat file questions.json:", error);
      document.getElementById("app-container").innerHTML = `
        <div class="text-center text-red-400">
          <h1 class="text-2xl font-bold">Error</h1>
          <p>Gagal memuat data soal. Pastikan file 'questions.json' ada di folder yang sama dengan 'index.html'.</p>
        </div>
      `;
    });
});
