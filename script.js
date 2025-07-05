document.addEventListener("DOMContentLoaded", () => {
  // --- Variabel Global & Elemen DOM ---
  let quizQuestions = [];
  let currentQuestionIndex = 0;
  let selectedPacketQuestions = [];
  let userAnswers = [];
  let incorrectQuestions = [];
  let currentPacketInfo = {};
  let selectedAnswer = null;
  let timerInterval = null;
  let timeLeft = 0;
  let lastQuizForReview = null; // **BARU**: Menyimpan snapshot kuis untuk pembahasan

  const ACTIVE_QUIZ_STATE_KEY = "activeQuizState";

  const screens = {
    start: document.getElementById("start-screen"),
    packetSelection: document.getElementById("packet-selection-screen"),
    quiz: document.getElementById("quiz-screen"),
    result: document.getElementById("result-screen"),
    review: document.getElementById("review-screen"),
    history: document.getElementById("history-screen"),
  };

  const modal = {
    overlay: document.getElementById("confirmation-modal"),
    title: document.getElementById("modal-title"),
    text: document.getElementById("modal-text"),
    confirmButton: document.getElementById("modal-confirm-button"),
    cancelButton: document.getElementById("modal-cancel-button"),
  };

  const timerDisplay = document.getElementById("timer");

  // --- FUNGSI MANAJEMEN STATE ---

  function saveQuizState() {
    const state = {
      selectedPacketQuestions,
      currentQuestionIndex,
      userAnswers,
      timeLeft,
      currentPacketInfo,
    };
    localStorage.setItem(ACTIVE_QUIZ_STATE_KEY, JSON.stringify(state));
  }

  function clearQuizState() {
    localStorage.removeItem(ACTIVE_QUIZ_STATE_KEY);
  }

  function restoreQuizState() {
    const savedStateJSON = localStorage.getItem(ACTIVE_QUIZ_STATE_KEY);
    if (!savedStateJSON) return false;

    const savedState = JSON.parse(savedStateJSON);

    selectedPacketQuestions = savedState.selectedPacketQuestions;
    currentQuestionIndex = savedState.currentQuestionIndex;
    userAnswers = savedState.userAnswers;
    timeLeft = savedState.timeLeft;
    currentPacketInfo = savedState.currentPacketInfo;

    showScreen("quiz");
    startTimer(timeLeft);
    loadQuestion();

    showConfirmationModal(
      "Sesi Dilanjutkan",
      `Selamat datang kembali! Anda melanjutkan sesi "${currentPacketInfo.name}".`,
      () => {},
      "Lanjutkan"
    );

    return true;
  }

  // --- Definisi Fungsi Aplikasi ---

  function showScreen(screenId) {
    Object.values(screens).forEach((s) => s.classList.remove("active"));
    if (screens[screenId]) screens[screenId].classList.add("active");
  }

  function showConfirmationModal(
    title,
    text,
    onConfirm,
    confirmText = "Konfirmasi"
  ) {
    modal.title.innerText = title;
    modal.text.innerText = text;
    modal.confirmButton.innerText = confirmText;
    modal.overlay.classList.add("active");
    modal.confirmButton.onclick = () => {
      modal.overlay.classList.remove("active");
      onConfirm();
    };
    modal.cancelButton.onclick = () => modal.overlay.classList.remove("active");
  }

  function selectPacket(packetType) {
    let packetInfo = { type: packetType, name: "", questions: [] };
    let duration = 0;

    if (packetType === "a") {
      packetInfo.name = "Paket A";
      packetInfo.questions = quizQuestions.slice(155, 183);
      duration = 30 * 60;
    } else if (packetType === "b") {
      packetInfo.name = "Paket B";
      packetInfo.questions = quizQuestions.slice(125, 155);
      duration = 30 * 60;
    } else if (packetType === "p15") {
      packetInfo.name = "Paket P15";
      packetInfo.questions = quizQuestions.slice(100, 125);
      duration = 25 * 60;
    } else if (packetType === "1") {
      packetInfo.name = "Paket 1";
      packetInfo.questions = quizQuestions.slice(0, 50);
      duration = 50 * 60;
    } else if (packetType === "2") {
      packetInfo.name = "Paket 2";
      packetInfo.questions = quizQuestions.slice(50, 100);
      duration = 50 * 60;
    } else if (packetType === "incorrect") {
      packetInfo.name = `Soal Salah dari ${lastQuizForReview.packetInfo.name}`;
      packetInfo.questions = [...incorrectQuestions];
      duration = Math.ceil((packetInfo.questions.length * 90) / 60) * 60;
    } else {
      packetInfo.name = "Semua Soal (Acak)";
      packetInfo.questions = [...quizQuestions].sort(() => Math.random() - 0.5);
      duration = 120 * 60;
    }

    currentPacketInfo = { name: packetInfo.name };
    showConfirmationModal(
      `Mulai ${packetInfo.name}?`,
      `Anda akan memiliki waktu ${duration / 60} menit. Siap?`,
      () => startQuiz(packetInfo.questions, duration),
      "Mulai"
    );
  }

  function startQuiz(questions, duration) {
    selectedPacketQuestions = questions;
    currentQuestionIndex = 0;
    userAnswers = new Array(selectedPacketQuestions.length).fill(null);
    selectedAnswer = null;
    timeLeft = duration;
    showScreen("quiz");
    startTimer(duration);
    loadQuestion();
    saveQuizState();
  }

  function startTimer(duration) {
    clearInterval(timerInterval);
    timeLeft = duration;

    const updateTimer = () => {
      const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
      const seconds = String(timeLeft % 60).padStart(2, "0");
      timerDisplay.innerText = `${minutes}:${seconds}`;
    };

    updateTimer();

    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimer();
      if (timeLeft < 0) {
        clearInterval(timerInterval);
        showResult();
      }
    }, 1000);
  }

  function loadQuestion() {
    selectedAnswer = null;
    const currentQuestion = selectedPacketQuestions[currentQuestionIndex];
    document.getElementById("question-counter").innerText = `Soal ${
      currentQuestionIndex + 1
    } dari ${selectedPacketQuestions.length}`;
    document.getElementById("progress-bar").style.width = `${
      ((currentQuestionIndex + 1) / selectedPacketQuestions.length) * 100
    }%`;
    document.getElementById("question-text").innerText =
      currentQuestion.question;

    const optionsContainer = document.getElementById("options-container");
    optionsContainer.innerHTML = "";
    currentQuestion.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.innerHTML = `<span class="font-semibold">${String.fromCharCode(
        65 + index
      )}.</span> ${option}`;
      button.className = "option-button";
      button.onclick = () => handleAnswerSelect(option, button);
      optionsContainer.appendChild(button);
    });

    const previousAnswer = userAnswers[currentQuestionIndex];
    if (previousAnswer) {
      const selectedBtn = Array.from(optionsContainer.children).find((btn) =>
        btn.innerText.includes(previousAnswer)
      );
      handleAnswerSelect(previousAnswer, selectedBtn);
    } else {
      document.getElementById("next-button").disabled = true;
    }

    document.getElementById("quiz-back-button").disabled =
      currentQuestionIndex === 0;
  }

  function handleAnswerSelect(option, buttonElement) {
    selectedAnswer = option;
    document.getElementById("next-button").disabled = false;
    document
      .querySelectorAll(".option-button")
      .forEach((btn) => btn.classList.remove("selected"));
    if (buttonElement) buttonElement.classList.add("selected");
  }

  function handleNextQuestion() {
    userAnswers[currentQuestionIndex] = selectedAnswer;
    if (currentQuestionIndex < selectedPacketQuestions.length - 1) {
      currentQuestionIndex++;
      loadQuestion();
      saveQuizState();
    } else {
      showResult();
    }
  }

  function showResult() {
    clearInterval(timerInterval);

    // **PERBAIKAN**: Ambil snapshot state kuis untuk halaman pembahasan dan hasil
    lastQuizForReview = {
      questions: [...selectedPacketQuestions],
      answers: [...userAnswers],
      packetInfo: { ...currentPacketInfo },
    };

    clearQuizState(); // Hapus state dari localStorage setelah kuis selesai

    let finalScore = 0;
    incorrectQuestions = [];
    lastQuizForReview.questions.forEach((q, i) => {
      if (lastQuizForReview.answers[i] === q.answer) {
        finalScore++;
      } else {
        incorrectQuestions.push(q);
      }
    });

    const total = lastQuizForReview.questions.length;
    const percentage = total > 0 ? Math.round((finalScore / total) * 100) : 0;
    if (
      lastQuizForReview.packetInfo.name &&
      !lastQuizForReview.packetInfo.name.includes("Soal Salah")
    ) {
      saveHistory(finalScore, total, percentage);
    }

    document.getElementById(
      "score-text"
    ).innerHTML = `Anda berhasil menjawab <span class="text-sky-400 font-bold text-2xl">${finalScore}</span> dari <span class="font-bold text-2xl">${total}</span> soal.`;
    const scoreBar = document.getElementById("score-bar");
    scoreBar.style.width = `${percentage}%`;
    scoreBar.innerText = `${percentage}%`;

    const retryBtn = document.getElementById("retry-incorrect-button");
    if (incorrectQuestions.length > 0) {
      retryBtn.classList.remove("hidden");
    } else {
      retryBtn.classList.add("hidden");
    }

    showScreen("result");
  }

  function saveHistory(score, total, percentage) {
    const history = JSON.parse(localStorage.getItem("quizHistory")) || [];
    const newResult = {
      packetName: currentPacketInfo.name,
      score,
      total,
      percentage,
      date: new Date().toISOString(),
    };
    history.unshift(newResult);
    if (history.length > 20) history.pop();
    localStorage.setItem("quizHistory", JSON.stringify(history));
  }

  function showHistory() {
    const history = JSON.parse(localStorage.getItem("quizHistory")) || [];
    const container = document.getElementById("history-container");
    container.innerHTML = "";
    if (history.length === 0) {
      container.innerHTML = `<p class="text-slate-400 text-center">Belum ada riwayat tes.</p>`;
    } else {
      history.forEach((result) => {
        const date = new Date(result.date).toLocaleString("id-ID", {
          dateStyle: "long",
          timeStyle: "short",
        });
        const item = document.createElement("div");
        item.className =
          "bg-slate-700 p-4 rounded-lg border-l-4 " +
          (result.percentage >= 70 ? "border-green-500" : "border-red-500");
        item.innerHTML = `<div class="flex justify-between items-center"><div><p class="font-bold text-lg">${result.packetName}</p><p class="text-sm text-slate-400">${date}</p></div><p class="text-2xl font-bold">${result.percentage}%</p></div><p class="text-right mt-1 text-slate-300">Skor: ${result.score} / ${result.total}</p>`;
        container.appendChild(item);
      });
    }
    showScreen("history");
  }

  // **PERBAIKAN**: Fungsi pembahasan sekarang menggunakan data snapshot
  function showReview() {
    const reviewContainer = document.getElementById("review-container");
    reviewContainer.innerHTML = "";

    if (!lastQuizForReview || lastQuizForReview.questions.length === 0) {
      reviewContainer.innerHTML =
        '<p class="text-slate-400 text-center">Tidak ada data pembahasan untuk ditampilkan.</p>';
      showScreen("review");
      return;
    }

    lastQuizForReview.questions.forEach((question, index) => {
      const userAnswer = lastQuizForReview.answers[index];
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
    showScreen("review");
  }

  function setupEventListeners() {
    document
      .getElementById("start-button")
      .addEventListener("click", () => showScreen("packetSelection"));
    document
      .getElementById("history-button")
      .addEventListener("click", showHistory);
    document
      .getElementById("back-to-start-button")
      .addEventListener("click", () => showScreen("start"));
    document
      .getElementById("back-to-start-from-history")
      .addEventListener("click", () => showScreen("start"));
    document
      .querySelectorAll(".packet-button")
      .forEach((b) =>
        b.addEventListener("click", (e) =>
          selectPacket(e.currentTarget.dataset.packet)
        )
      );
    document
      .getElementById("next-button")
      .addEventListener("click", handleNextQuestion);

    document
      .getElementById("quiz-back-button")
      .addEventListener("click", () => {
        if (currentQuestionIndex > 0) {
          userAnswers[currentQuestionIndex] = selectedAnswer;
          currentQuestionIndex--;
          loadQuestion();
          saveQuizState();
        }
      });

    document
      .getElementById("surrender-button")
      .addEventListener("click", () => {
        showConfirmationModal(
          "Yakin ingin menyerah?",
          "Progres kuis ini akan dihitung nilainya.",
          () => showResult(),
          "Ya, Menyerah"
        );
      });

    document.getElementById("restart-button").addEventListener("click", () => {
      clearQuizState();
      showConfirmationModal(
        "Ulangi Latihan?",
        "Pilih paket soal untuk memulai lagi.",
        () => showScreen("packetSelection"),
        "Mulai Lagi"
      );
    });

    document
      .getElementById("review-button")
      .addEventListener("click", showReview);
    document
      .getElementById("retry-incorrect-button")
      .addEventListener("click", () => selectPacket("incorrect"));
    document
      .getElementById("back-to-result-button")
      .addEventListener("click", () => showScreen("result"));

    const reviewContainer = document.getElementById("review-container");
    const backToTopBtn = document.getElementById("back-to-top-button");
    backToTopBtn.addEventListener("click", () => {
      reviewContainer.scrollTo({ top: 0, behavior: "smooth" });
    });
    reviewContainer.addEventListener("scroll", () => {
      backToTopBtn.classList.toggle("hidden", reviewContainer.scrollTop < 200);
    });

    window.addEventListener("beforeunload", () => {
      if (screens.quiz.classList.contains("active")) {
        saveQuizState();
      }
    });
  }

  // --- Eksekusi Utama ---
  fetch("/public/questions.json")
    .then((res) => (res.ok ? res.json() : Promise.reject(res)))
    .then((data) => {
      quizQuestions = data;
      setupEventListeners();
      if (!restoreQuizState()) {
        showScreen("start");
      }
    })
    .catch((error) => {
      console.error("Gagal memuat questions.json:", error);
      document.getElementById(
        "app-container"
      ).innerHTML = `<div class="text-center text-red-400"><h1 class="text-2xl font-bold">Error</h1><p>Gagal memuat data soal. Pastikan file 'questions.json' ada di folder yang sama.</p></div>`;
    });
});
