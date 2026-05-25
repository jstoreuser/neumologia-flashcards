// PACS Diagnostic Console - Core Logic (Spaced Repetition & UI Driver)
import { requireAuth } from './guards/auth.guard.js';
import { FlashcardsRepository } from './repositories/flashcards.repository.js';
import { ProgressRepository } from './repositories/progress.repository.js';
import { AuthService } from './services/auth.service.js';
import { Logger } from './core/logger.js';

document.addEventListener("DOMContentLoaded", () => {
    // 1. CARREGAR ESTADOS E VARIÁVEIS
    let currentUser = null;
    let currentFilter = "Todos";
    let activeQueue = []; // Cards a serem estudados na sessão atual
    let currentCardIndex = 0; // Índice do card ativo na fila
    let sessionCount = 0; // Contador de cards estudados nesta sessão
    let sessionSuccessCount = 0; // Quantos cards foram fáceis de primeira
    
    // Dados injetados assincronamente
    let FLASHCARD_DATA = [];
    let userProgress = {};
    
    // Streak (dias seguidos de estudo - mantido no local storage por simplicidade de UX imediata, 
    // embora idealmente devesse ir pro db/users depois)
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

    // Botão de Logout no header (vamos injetar evento depois)
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'btn btn-icon btn-outline';
        logoutBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span>Sair</span>`;
        logoutBtn.addEventListener('click', () => AuthService.logout());
        headerActions.appendChild(logoutBtn);
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
                    streakState.count += 1;
                } else if (diffDays > 1) {
                    streakState.count = 1;
                }
            } else {
                streakState.count = 1;
            }
            streakState.lastDate = todayStr;
            localStorage.setItem("pacs_streak_data", JSON.stringify(streakState));
        }
        if (streakCountLbl) streakCountLbl.textContent = streakState.count;
    }

    // 5. ATUALIZAR METRICAS DO SIDEBAR
    function updateSidebarStats() {
        let totalMastered = 0;
        let totalLearning = 0;
        let totalNew = 0;

        FLASHCARD_DATA.forEach(card => {
            const cardState = userProgress[card.id];
            if (!cardState) {
                totalNew++;
            } else if (cardState.interval > 10) { // Lógica temporária baseada em intervalo
                totalMastered++;
            } else {
                totalLearning++;
            }
        });

        if (statsMasteredLbl) statsMasteredLbl.textContent = totalMastered;
        if (statsLearningLbl) statsLearningLbl.textContent = totalLearning;
        if (statsNewLbl) statsNewLbl.textContent = totalNew;

        const totalCards = FLASHCARD_DATA.length;
        const masteredPercent = totalCards > 0 ? Math.round((totalMastered / totalCards) * 100) : 0;
        if (radialPercentLbl) radialPercentLbl.textContent = `${masteredPercent}%`;

        if (radialProgressBar) {
            radialProgressBar.setAttribute("stroke-dasharray", `${masteredPercent}, 100`);
        }

        updateFilterCounters();
    }

    function updateFilterCounters() {
        const counts = { "Todos": FLASHCARD_DATA.length };

        FLASHCARD_DATA.forEach(card => {
            if (card.tags) {
                card.tags.forEach(tag => {
                    counts[tag] = (counts[tag] || 0) + 1;
                });
            }
        });

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
        
        completionScreen.classList.add("hidden");

        let filteredCards = filterName === "Todos" 
            ? [...FLASHCARD_DATA] 
            : FLASHCARD_DATA.filter(c => c.tags && c.tags.includes(filterName));

        const learningQueue = [];
        const newQueue = [];
        const masteredQueue = [];

        filteredCards.forEach(card => {
            const cardState = userProgress[card.id];
            if (!cardState) {
                newQueue.push(card);
            } else if (cardState.interval > 10) {
                masteredQueue.push(card);
            } else {
                learningQueue.push(card);
            }
        });

        shuffleArray(learningQueue);
        shuffleArray(newQueue);
        shuffleArray(masteredQueue);

        activeQueue = [...learningQueue, ...newQueue, ...masteredQueue];

        if (activeQueue.length === 0) {
            if (currentQueueCountLbl) currentQueueCountLbl.textContent = 0;
            if (sessionProgressBar) sessionProgressBar.style.width = "100%";
            showCompletionScreen();
            return;
        }

        loadCard(activeQueue[0]);
        updateQueueUI();
        updateSidebarStats();
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // 7. CARREGAR E EXIBIR OS FLASHCARDS NO CONSOLE PACS
    function loadCard(card) {
        cardLoader.classList.remove("hidden");
        
        const cardHeader = cardPanel.querySelector(".pacs-card-header");
        const imageWrapper = cardPanel.querySelector(".web-image-wrapper");
        const promptSection = cardPanel.querySelector(".prompt-section");
        const cardActionBar = cardPanel.querySelector(".card-action-bar");
        
        if(cardHeader) cardHeader.style.opacity = "0";
        if(imageWrapper) imageWrapper.style.opacity = "0";
        if(promptSection) promptSection.style.opacity = "0";
        if(cardActionBar) cardActionBar.style.opacity = "0";
        
        answerDivider.style.display = "none";
        answerBox.style.display = "none";
        revealBtn.style.display = "flex";
        recallButtonsBar.style.display = "none";
        
        if (cardMetaPage) cardMetaPage.textContent = `PÁGINA ${card.id.substring(0,6).toUpperCase()}`;
        
        if (cardMetaStudy) {
            if (card.tags && card.tags.includes("Tomografía")) {
                cardMetaStudy.textContent = "TC PULMONAR - AXIAL";
            } else if (card.tags && card.tags.includes("Radiografía")) {
                cardMetaStudy.textContent = "RX DE TÓRAX - FRENTE";
            } else {
                cardMetaStudy.textContent = "IMAGEN PULMONAR";
            }
        }

        cardPrompt.textContent = card.question;

        cardImagesGrid.innerHTML = "";
        if (card.imageUrl) {
            const imgEl = document.createElement("img");
            imgEl.src = card.imageUrl;
            imgEl.className = "card-image-web";
            imgEl.alt = `Imagem Médica do card ${card.id}`;
            imgEl.addEventListener("click", (e) => {
                e.stopPropagation();
                openLightbox(card.imageUrl);
            });
            cardImagesGrid.appendChild(imgEl);
        }

        cardAnswer.textContent = card.answer;
        cardExplanation.innerHTML = card.explanation || '';

        setTimeout(() => {
            cardLoader.classList.add("hidden");
            if(cardHeader) {
                cardHeader.style.transition = "opacity 0.3s ease";
                cardHeader.style.opacity = "1";
            }
            if(imageWrapper) {
                imageWrapper.style.transition = "opacity 0.3s ease";
                imageWrapper.style.opacity = "1";
            }
            if(promptSection) {
                promptSection.style.transition = "opacity 0.3s ease";
                promptSection.style.opacity = "1";
            }
            if(cardActionBar) {
                cardActionBar.style.transition = "opacity 0.3s ease";
                cardActionBar.style.opacity = "1";
            }
        }, 320);
    }

    function updateQueueUI() {
        const remaining = activeQueue.length - currentCardIndex;
        if (currentQueueCountLbl) currentQueueCountLbl.textContent = remaining >= 0 ? remaining : 0;
        
        const totalSession = activeQueue.length;
        const progressPercent = totalSession > 0 ? Math.round((currentCardIndex / totalSession) * 100) : 100;
        if (sessionProgressBar) sessionProgressBar.style.width = `${progressPercent}%`;
    }

    function revealCardAnswer() {
        answerDivider.style.display = "block";
        answerBox.style.display = "block";
        revealBtn.style.display = "none";
        recallButtonsBar.style.display = "grid";
        
        setTimeout(() => {
            answerBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 80);
    }

    if (revealBtn) revealBtn.addEventListener("click", revealCardAnswer);

    document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
            e.preventDefault();
            if (revealBtn && revealBtn.style.display !== "none" && completionScreen && completionScreen.classList.contains("hidden")) {
                revealCardAnswer();
            }
        }
    });

    // 8. CLASSIFICAÇÃO SPACED REPETITION (SYNC FIRESTORE)
    document.querySelectorAll(".recall-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const rating = btn.getAttribute("data-rating");
            handleCardRating(rating);
        });
    });

    async function handleCardRating(rating) {
        const currentCard = activeQueue[currentCardIndex];
        if (!currentCard) return;

        let cardState = userProgress[currentCard.id] || {
            interval: 0,
            easeFactor: 2.5,
            repetitions: 0,
            lapses: 0
        };

        sessionCount++;

        // Algoritmo rudimentar SuperMemo 2
        if (rating === "easy") {
            cardState.repetitions++;
            cardState.interval = cardState.repetitions === 1 ? 1 : cardState.interval * cardState.easeFactor;
            cardState.easeFactor += 0.15;
            
            if (cardState.repetitions === 1) sessionSuccessCount++;
            currentCardIndex++;
        } 
        else if (rating === "hard") {
            cardState.repetitions++;
            cardState.interval = Math.max(1, cardState.interval * 1.2);
            cardState.easeFactor = Math.max(1.3, cardState.easeFactor - 0.15);
            
            const cardToMove = activeQueue.splice(currentCardIndex, 1)[0];
            const newPos = Math.min(currentCardIndex + 5, activeQueue.length);
            activeQueue.splice(newPos, 0, cardToMove);
        } 
        else if (rating === "wrong") {
            cardState.repetitions = 0;
            cardState.interval = 1;
            cardState.lapses++;
            cardState.easeFactor = Math.max(1.3, cardState.easeFactor - 0.20);
            
            const cardToMove = activeQueue.splice(currentCardIndex, 1)[0];
            const newPos = Math.min(currentCardIndex + 2, activeQueue.length);
            activeQueue.splice(newPos, 0, cardToMove);
        }

        cardState.lastReview = new Date().toISOString();
        
        // Atualiza cache local
        userProgress[currentCard.id] = cardState;

        // Atualiza Streak
        updateStreak();

        // 🚀 FIREBASE SYNC (Em background graças ao Offline Cache do SDK)
        try {
            await ProgressRepository.updateCardProgress(currentUser.uid, currentCard.id, cardState);
        } catch(e) {
            Logger.warn('Sync', 'Could not sync progress, will retry in background', e);
        }

        if (currentCardIndex < activeQueue.length) {
            loadCard(activeQueue[currentCardIndex]);
            updateQueueUI();
            updateSidebarStats();
        } else {
            showCompletionScreen();
        }
    }

    // 9. MODAL DE ZOOM (LIGHTBOX)
    function openLightbox(imgUrl) {
        if (!lightboxImg || !lightbox) return;
        lightboxImg.src = imgUrl;
        lightbox.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
        if (!lightboxImg || !lightbox) return;
        lightbox.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        lightboxImg.src = "";
    }

    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    if (lightbox) lightbox.addEventListener("click", closeLightbox);
    if (lightboxImg) lightboxImg.addEventListener("click", (e) => e.stopPropagation());

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeLightbox();
    });

    // 10. TELA DE CONCLUSÃO
    function showCompletionScreen() {
        updateSidebarStats();
        if (compTotalCards) compTotalCards.textContent = sessionCount;
        const rate = sessionCount > 0 ? Math.round((sessionSuccessCount / sessionCount) * 100) : 100;
        if (compSuccessRate) compSuccessRate.textContent = `${rate}%`;
        if (completionScreen) completionScreen.classList.remove("hidden");
    }

    if (restartDeckBtn) {
        restartDeckBtn.addEventListener("click", () => {
            initStudySession(currentFilter);
        });
    }

    // 11. FILTROS
    const filterContainer = document.getElementById("filter-container");
    if (filterContainer) {
        filterContainer.addEventListener("click", (e) => {
            const pill = e.target.closest(".filter-pill");
            if (!pill) return;
            document.querySelectorAll(".filter-pill").forEach(el => el.classList.remove("active"));
            pill.classList.add("active");
            initStudySession(pill.getAttribute("data-filter"));
        });
    }

    // 13. BOOTSTRAP ASSÍNCRONO DA APLICAÇÃO (Firebase Guard)
    async function bootstrapApp() {
        try {
            // Mostrar skeleton loader de sistema inteiro
            if(cardLoader) {
                cardLoader.classList.remove("hidden");
                cardLoader.querySelector('.loader-text').textContent = "Conectando ao terminal...";
            }
            
            // 1. Verificar Autenticação
            const authState = await requireAuth();
            currentUser = authState.user;

            // 2. Buscar Dados do Firebase (Repositories)
            if(cardLoader) cardLoader.querySelector('.loader-text').textContent = "Buscando base de dados clínica...";
            
            // Carregamento paralelo para performance
            const [cardsData, progressData] = await Promise.all([
                FlashcardsRepository.getAllPublished(),
                ProgressRepository.getUserProgress(currentUser.uid)
            ]);

            FLASHCARD_DATA = cardsData;
            userProgress = progressData;

            // 3. Inicializar App Visualmente
            updateSidebarStats();
            updateStreak();
            initStudySession(currentFilter);

            // 4. Efeito de fade de vídeo
            setupVideoFade();

        } catch (error) {
            Logger.error('App', 'Bootstrap failed', error);
            // Se falhou por Auth, o Guard já redirecionou. 
            // Se falhou por banco off sem cache, mostramos erro cyberpunk.
            if (error !== 'User not authenticated') {
                alert('[FIREBASE LINK LOST] Não foi possível carregar a base de dados.');
            }
        }
    }

    function setupVideoFade() {
        const ambientVideo = document.querySelector(".ambient-video-bg");
        if (ambientVideo) {
            let heroHeight = window.innerHeight || 800;
            window.addEventListener("resize", () => heroHeight = window.innerHeight || 800, { passive: true });
            let ticking = false;
            window.addEventListener("scroll", () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        const scrollPos = window.scrollY;
                        const fadeThreshold = heroHeight * 0.8;
                        if (scrollPos <= fadeThreshold) {
                            const maxOpacity = 0.45;
                            const newOpacity = maxOpacity * (1 - scrollPos / fadeThreshold);
                            ambientVideo.style.opacity = newOpacity;
                        } else if (ambientVideo.style.opacity !== "0") {
                            ambientVideo.style.opacity = 0;
                        }
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });
        }
    }

    // Inicia fluxo de autenticação e dados
    bootstrapApp();
});
