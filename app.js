// PACS Diagnostic Console - Core Logic (Spaced Repetition & UI Driver)

document.addEventListener("DOMContentLoaded", () => {
    // 1. CARREGAR ESTADOS E VARIÁVEIS DO LOCAL STORAGE
    let currentFilter = "Todos";
    let activeQueue = []; // Cards a serem estudados na sessão atual
    let currentCardIndex = 0; // Índice do card ativo na fila
    let sessionCount = 0; // Contador de cards estudados nesta sessão
    let sessionSuccessCount = 0; // Quantos cards foram fáceis de primeira
    
    // Objeto do progresso do usuário no localStorage
    // Estrutura: { cardId: { status: 'new'|'learning'|'mastered', easeCount: 0, reviewsCount: 0 } }
    let userProgress = JSON.parse(localStorage.getItem("pacs_progress_data")) || {};
    
    // Streak (dias seguidos de estudo)
    let streakState = JSON.parse(localStorage.getItem("pacs_streak_data")) || { count: 0, lastDate: null };

    // 2. ELEMENTOS DO DOM
    const cardPanel = document.getElementById("card-panel");
    const welcomePanel = document.getElementById("welcome-panel");
    const startSessionBtn = document.getElementById("start-session-btn");
    const cardLoader = document.getElementById("card-loader");
    const cardMetaStudy = document.getElementById("card-meta-study");
    const cardMetaPage = document.getElementById("card-meta-page");
    const cardImagesGrid = document.getElementById("card-images-grid");
    const cardPrompt = document.getElementById("card-prompt");
    const cardAnswer = document.getElementById("card-answer");
    const cardExplanation = document.getElementById("card-explanation");
    
    const answerDivider = document.getElementById("answer-divider");
    const answerBox = document.getElementById("answer-box");
    const revealBtn = document.getElementById("reveal-btn");
    const recallButtonsBar = document.getElementById("recall-buttons-bar");
    const currentQueueCountLbl = document.getElementById("current-queue-count");
    const sessionProgressBar = document.getElementById("session-progress-bar");
    
    // Sidebar Stats Lbls
    const radialProgressBar = document.getElementById("radial-progress-bar");
    const radialPercentLbl = document.getElementById("radial-percent-lbl");
    const statsMasteredLbl = document.getElementById("stats-mastered");
    const statsLearningLbl = document.getElementById("stats-learning");
    const statsNewLbl = document.getElementById("stats-new");
    const streakCountLbl = document.getElementById("streak-count");
    
    // Modais e Telas
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxClose = document.getElementById("lightbox-close");
    const completionScreen = document.getElementById("completion-screen");
    const restartDeckBtn = document.getElementById("restart-deck-btn");
    const compTotalCards = document.getElementById("comp-total-cards");
    const compSuccessRate = document.getElementById("comp-success-rate");
    const resetProgressBtn = document.getElementById("reset-all-progress");
    const themeToggleBtn = document.getElementById("theme-toggle");
    
    const sunIcon = document.getElementById("sun-icon");
    const moonIcon = document.getElementById("moon-icon");

    // 3. SISTEMA DE TEMA (CLARO/ESCURO)
    const activeTheme = localStorage.getItem("pacs_theme") || "dark";
    applyTheme(activeTheme);

    themeToggleBtn.addEventListener("click", () => {
        const isDark = document.body.classList.contains("pacs-theme-dark");
        const nextTheme = isDark ? "light" : "dark";
        applyTheme(nextTheme);
    });

    function applyTheme(theme) {
        if (theme === "dark") {
            document.body.classList.remove("pacs-theme-light");
            document.body.classList.add("pacs-theme-dark");
            sunIcon.classList.add("hidden");
            moonIcon.classList.remove("hidden");
        } else {
            document.body.classList.remove("pacs-theme-dark");
            document.body.classList.add("pacs-theme-light");
            moonIcon.classList.add("hidden");
            sunIcon.classList.remove("hidden");
        }
        localStorage.setItem("pacs_theme", theme);
    }

    // 4. ATUALIZAÇÃO DO STREAK (DIAS SEGUIDOS DE ESTUDO)
    function updateStreak() {
        const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        if (streakState.lastDate !== todayStr) {
            if (streakState.lastDate) {
                const lastDate = new Date(streakState.lastDate);
                const today = new Date(todayStr);
                const diffTime = Math.abs(today - lastDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                    // Estudou ontem, incrementa streak
                    streakState.count += 1;
                } else if (diffDays > 1) {
                    // Pulou dias, reseta
                    streakState.count = 1;
                }
            } else {
                // Primeiro estudo de todos
                streakState.count = 1;
            }
            streakState.lastDate = todayStr;
            localStorage.setItem("pacs_streak_data", JSON.stringify(streakState));
        }
        streakCountLbl.textContent = streakState.count;
    }

    // 5. ATUALIZAR METRICAS DO SIDEBAR
    function updateSidebarStats() {
        let totalMastered = 0;
        let totalLearning = 0;
        let totalNew = 0;

        // Filtrar contagens para todos os cards gerais
        FLASHCARD_DATA.forEach(card => {
            const cardState = userProgress[card.id];
            if (!cardState || cardState.status === "new") {
                totalNew++;
            } else if (cardState.status === "mastered") {
                totalMastered++;
            } else if (cardState.status === "learning") {
                totalLearning++;
            }
        });

        // Atualizar textos do Sidebar
        statsMasteredLbl.textContent = totalMastered;
        statsLearningLbl.textContent = totalLearning;
        statsNewLbl.textContent = totalNew;

        // Atualizar Rosca de Progresso (Radial Loader)
        const totalCards = FLASHCARD_DATA.length;
        const masteredPercent = totalCards > 0 ? Math.round((totalMastered / totalCards) * 100) : 0;
        radialPercentLbl.textContent = `${masteredPercent}%`;

        // Modifica o dasharray do path circular do SVG para dar o efeito de carregamento
        // Circunferência de raio 15.9155 é exatamente 100
        radialProgressBar.setAttribute("stroke-dasharray", `${masteredPercent}, 100`);

        // Atualizar também os números pequenos dos Filtros de Pills
        updateFilterCounters();
    }

    // Atualiza os contadores pequenos nas pills de filtro
    function updateFilterCounters() {
        const counts = {
            "Todos": FLASHCARD_DATA.length,
            "Radiografía": 0,
            "Tomografía": 0,
            "Signo_Radiológico": 0,
            "Patrón_Intersticial": 0
        };

        FLASHCARD_DATA.forEach(card => {
            card.tags.forEach(tag => {
                if (tag in counts) {
                    counts[tag]++;
                }
            });
        });

        // Setar contadores no DOM
        for (let tag in counts) {
            const countLbl = document.getElementById(`count-${tag}`);
            if (countLbl) {
                countLbl.textContent = counts[tag];
            }
        }
    }

    // 6. FILTRO DE CARDS E INICIALIZAÇÃO DA FILA DE ESTUDO
    function initStudySession(filterName = "Todos") {
        currentFilter = filterName;
        activeQueue = [];
        currentCardIndex = 0;
        sessionCount = 0;
        sessionSuccessCount = 0;
        
        // Ocultar tela de conclusão
        completionScreen.classList.add("hidden");

        // Selecionar os cards correspondentes ao filtro
        let filteredCards = [];
        if (filterName === "Todos") {
            filteredCards = [...FLASHCARD_DATA];
        } else {
            filteredCards = FLASHCARD_DATA.filter(card => card.tags.includes(filterName));
        }

        // Criar Fila Inteligente baseada no Espaçamento de Repetição:
        // 1. Cards classificados como "learning" (errados) vêm primeiro para reforço
        // 2. Cards novos ("new") vêm a seguir
        // 3. Cards dominados ("mastered") vêm por último
        const learningQueue = [];
        const newQueue = [];
        const masteredQueue = [];

        filteredCards.forEach(card => {
            const cardState = userProgress[card.id];
            if (!cardState || cardState.status === "new") {
                newQueue.push(card);
            } else if (cardState.status === "learning") {
                learningQueue.push(card);
            } else if (cardState.status === "mastered") {
                masteredQueue.push(card);
            }
        });

        // Embaralhar filas individualmente para tornar o estudo dinâmico
        shuffleArray(learningQueue);
        shuffleArray(newQueue);
        shuffleArray(masteredQueue);

        // A fila final consiste nas falhas de ontem/recente -> novos cartões -> revisões
        activeQueue = [...learningQueue, ...newQueue, ...masteredQueue];

        // Se o filtro estiver vazio
        if (activeQueue.length === 0) {
            currentQueueCountLbl.textContent = 0;
            sessionProgressBar.style.width = "100%";
            showCompletionScreen();
            return;
        }

        // Carregar o primeiro card da fila
        loadCard(activeQueue[0]);
        updateQueueUI();
        updateSidebarStats();
    }

    // Método de embaralhar array (Fisher-Yates)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // 7. CARREGAR E EXIBIR OS FLASHCARDS NO CONSOLE PACS
    function loadCard(card) {
        // Mostrar o loader sutil de escaneamento
        cardLoader.classList.remove("hidden");
        
        // Esconder os elementos de conteúdo temporariamente para animar
        const cardHeader = cardPanel.querySelector(".pacs-card-header");
        const imageWrapper = cardPanel.querySelector(".web-image-wrapper");
        const promptSection = cardPanel.querySelector(".prompt-section");
        const cardActionBar = cardPanel.querySelector(".card-action-bar");
        
        cardHeader.style.opacity = "0";
        imageWrapper.style.opacity = "0";
        promptSection.style.opacity = "0";
        cardActionBar.style.opacity = "0";
        
        // Resetar visualização do verso (ocultar laudo)
        answerDivider.style.display = "none";
        answerBox.style.display = "none";
        revealBtn.style.display = "flex";
        recallButtonsBar.style.display = "none";
        
        // Setar cabeçalho
        cardMetaPage.textContent = `PÁGINA ${card.pageNumber}`;
        
        // Detectar o estudo primário (Rx ou TC)
        if (card.tags.includes("Tomografía")) {
            cardMetaStudy.textContent = "TC PULMONAR - AXIAL";
        } else if (card.tags.includes("Radiografía")) {
            cardMetaStudy.textContent = "RX DE TÓRAX - FRENTE";
        } else {
            cardMetaStudy.textContent = "IMAGEM PULMONAR";
        }

        // Exibir prompt da pergunta
        cardPrompt.textContent = card.prompt;

        // Injetar imagens na grid do monitor PACS
        cardImagesGrid.innerHTML = "";
        card.images.forEach(imgUrl => {
            const imgEl = document.createElement("img");
            imgEl.src = imgUrl;
            imgEl.className = "card-image-web";
            imgEl.alt = `Radiografia/TC da página ${card.pageNumber}`;
            
            imgEl.addEventListener("click", (e) => {
                e.stopPropagation();
                openLightbox(imgUrl);
            });
            cardImagesGrid.appendChild(imgEl);
        });

        // Preparar conteúdo do Verso (Oculto até revelação)
        cardAnswer.textContent = card.answer;
        cardExplanation.innerHTML = card.explanation;

        // Simular um carregamento sutil PACS de alta fidelidade
        setTimeout(() => {
            cardLoader.classList.add("hidden");
            
            cardHeader.style.transition = "opacity 0.3s ease";
            imageWrapper.style.transition = "opacity 0.3s ease";
            promptSection.style.transition = "opacity 0.3s ease";
            cardActionBar.style.transition = "opacity 0.3s ease";
            
            cardHeader.style.opacity = "1";
            imageWrapper.style.opacity = "1";
            promptSection.style.opacity = "1";
            cardActionBar.style.opacity = "1";
        }, 320);
    }

    // Atualiza contadores na fila
    function updateQueueUI() {
        const remaining = activeQueue.length - currentCardIndex;
        currentQueueCountLbl.textContent = remaining >= 0 ? remaining : 0;
        
        // Progresso linear da barra de progresso da sessão
        const totalSession = activeQueue.length;
        const progressPercent = totalSession > 0 ? Math.round((currentCardIndex / totalSession) * 100) : 100;
        sessionProgressBar.style.width = `${progressPercent}%`;
    }

    // 8. CONTROLE DE REVELAR E CLASSIFICAR CARDS
    function revealCardAnswer() {
        answerDivider.style.display = "block";
        answerBox.style.display = "block";
        revealBtn.style.display = "none";
        recallButtonsBar.style.display = "grid";
        
        // Rolar o console suavemente para baixo para revelar o laudo no mobile
        setTimeout(() => {
            answerBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 80);
    }

    revealBtn.addEventListener("click", revealCardAnswer);

    // Atalho de Teclado (Espaço revela / Enter também)
    document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
            // Evita que o espaço role a página
            e.preventDefault();
            
            // Se o botão de revelar estiver visível, clica
            if (revealBtn.style.display !== "none" && !completionScreen.classList.contains("hidden")) {
                revealCardAnswer();
            }
        }
    });

    // Clique nas classificações do spaced repetition (Errei, Difícil, Fácil)
    document.querySelectorAll(".recall-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const rating = btn.getAttribute("data-rating");
            handleCardRating(rating);
        });
    });

    function handleCardRating(rating) {
        const currentCard = activeQueue[currentCardIndex];
        if (!currentCard) return;

        // Inicializar registro no localStorage para o card caso não exista
        if (!userProgress[currentCard.id]) {
            userProgress[currentCard.id] = {
                status: "new",
                easeCount: 0,
                reviewsCount: 0
            };
        }

        const cardState = userProgress[currentCard.id];
        cardState.reviewsCount++;

        sessionCount++;

        if (rating === "easy") {
            // Se foi fácil, marcamos como mastered e tiramos da fila da sessão atual
            cardState.status = "mastered";
            cardState.easeCount++;
            
            if (cardState.reviewsCount === 1) {
                sessionSuccessCount++;
            }
            
            // Avança para o próximo card da fila
            currentCardIndex++;
        } 
        else if (rating === "hard") {
            // Se foi difícil, marcamos como em aprendizado
            cardState.status = "learning";
            
            // Re-insere o card 5 posições à frente para rever em breve na mesma sessão!
            const cardToMove = activeQueue.splice(currentCardIndex, 1)[0];
            const newPos = Math.min(currentCardIndex + 5, activeQueue.length);
            activeQueue.splice(newPos, 0, cardToMove);
            
            // NÃO incrementa currentCardIndex, pois removemos o card atual e a fila andou!
        } 
        else if (rating === "wrong") {
            // Se errou, reforço imediato
            cardState.status = "learning";
            
            // Re-insere o card 2 posições à frente para rever muito rapidamente!
            const cardToMove = activeQueue.splice(currentCardIndex, 1)[0];
            const newPos = Math.min(currentCardIndex + 2, activeQueue.length);
            activeQueue.splice(newPos, 0, cardToMove);
            
            // NÃO incrementa currentCardIndex
        }

        // Salvar progresso
        localStorage.setItem("pacs_progress_data", JSON.stringify(userProgress));
        
        // Atualizar Streak de estudo ativo
        updateStreak();

        // Passar para o próximo card da fila se houver, senão concluir sessão
        if (currentCardIndex < activeQueue.length) {
            loadCard(activeQueue[currentCardIndex]);
            updateQueueUI();
            updateSidebarStats();
        } else {
            showCompletionScreen();
        }
    }

    // 9. EVENTOS DO MODAL DE ZOOM (LIGHTBOX)
    function openLightbox(imgUrl) {
        lightboxImg.src = imgUrl;
        lightbox.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden"; // Desabilita scroll do fundo
    }

    function closeLightbox() {
        lightbox.setAttribute("aria-hidden", "true");
        document.body.style.overflow = ""; // Reabilita scroll do fundo
        lightboxImg.src = "";
    }

    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", closeLightbox);
    lightboxImg.addEventListener("click", (e) => e.stopPropagation()); // Evita fechar clicar no próprio raio-x

    // Fechar lightbox no ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeLightbox();
        }
    });

    // 10. TELA DE CONCLUSÃO
    function showCompletionScreen() {
        updateSidebarStats();
        
        compTotalCards.textContent = sessionCount;
        const rate = sessionCount > 0 ? Math.round((sessionSuccessCount / sessionCount) * 100) : 100;
        compSuccessRate.textContent = `${rate}%`;
        
        completionScreen.classList.remove("hidden");
    }

    restartDeckBtn.addEventListener("click", () => {
        initStudySession(currentFilter);
    });

    // 11. CONTROLES DO MENU DE FILTROS (PILLS DA ESQUERDA)
    document.getElementById("filter-container").addEventListener("click", (e) => {
        const pill = e.target.closest(".filter-pill");
        if (!pill) return;

        // Alternar active class nas pills
        document.querySelectorAll(".filter-pill").forEach(el => el.classList.remove("active"));
        pill.classList.add("active");

        const selectedFilter = pill.getAttribute("data-filter");
        initStudySession(selectedFilter);
    });

    // 12. APAGAR TODO O PROGRESSO (RESET GLOBAL INDIVIDUAL)
    resetProgressBtn.addEventListener("click", () => {
        const confirmReset = confirm("Deseja apagar todo o seu progresso neste console de flashcards? Isso limpará seus dados de aprendizado individual.");
        if (confirmReset) {
            localStorage.removeItem("pacs_progress_data");
            localStorage.removeItem("pacs_streak_data");
            userProgress = {};
            streakState = { count: 0, lastDate: null };
            
            // Reiniciar sessão atual
            initStudySession(currentFilter);
            alert("Progresso apagado com sucesso. Bons estudos!");
        }
    });
    // 13. INICIALIZAÇÃO INICIAL DO APP
    // Inicia os cartões automaticamente abaixo do fold e configura o scroll do Hero
    updateSidebarStats();
    updateStreak();
    initStudySession(currentFilter);

    const scrollToStudyBtn = document.getElementById("scroll-to-study-btn");
    if (scrollToStudyBtn) {
        scrollToStudyBtn.addEventListener("click", () => {
            const studyWorkspace = document.getElementById("study-workspace");
            if (studyWorkspace) {
                studyWorkspace.scrollIntoView({ behavior: "smooth" });
            }
        });
    }

    if (startSessionBtn && welcomePanel) {
        startSessionBtn.addEventListener("click", () => {
            welcomePanel.classList.add("hidden");
            cardPanel.classList.remove("hidden");
            initStudySession(currentFilter);
        });
    }
});
