// ==========================================================================
// BARCL Premium Cyberpunk Workstation - Bootstrap Entrypoint (Native ESM)
// ==========================================================================
import { EventBus } from "./core/event-bus.js";
import { Storage } from "./core/storage.js";
import { State } from "./core/state.js";
import { SpacedRepetition } from "./features/spaced-repetition.js";
import { Filters } from "./features/filters.js";
import { Statistics } from "./features/statistics.js";
import { Keyboard } from "./input/keyboard.js";
import { Loader } from "./ui/loader.js";
import { Modal } from "./ui/modal.js";
import { Animations } from "./ui/animations.js";
import { Viewer } from "./ui/viewer.js";
import { Renderer } from "./ui/renderer.js";
import { ErrorOverlay } from "./ui/overlay.js";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Inicializa o HUD de Exceções de Runtime (Segurança Total de UX)
    ErrorOverlay.init();

    // 2. Variável de Controle Local do Card Ativo na Fila
    let activeCard = null;

    // 3. Inicialização dos Módulos UI, Core e Features
    Loader.init();
    Modal.init();
    Animations.init();
    Viewer.init();
    Renderer.init();
    Statistics.init();
    Filters.init();
    Keyboard.init();
    SpacedRepetition.init();
    State.init(); // Inicializa o estado (valida o banco e dispara primeira fila)

    // 4. Inscrições no Barramento de Eventos (EventBus Boundaries)
    
    // a. Carregamento de Card Ativo na Workstation
    EventBus.on("card:load", (card) => {
        activeCard = card;
        Loader.show();
        
        // Renderização visual isolada das camadas
        Renderer.renderHeader(card);
        Renderer.renderPrompt(card.prompt);
        Viewer.renderImages(card);
        Renderer.renderAnswerAndExplanation(card);
        Renderer.resetRevealState();

        // Simulação de scanner laser sutil PACS
        setTimeout(() => {
            Loader.hide();
        }, 320);
    });

    // b. Conclusão da Fila de Estudos Ativa (Completion Panel)
    const completionScreen = document.getElementById("completion-screen");
    const compTotalCards = document.getElementById("comp-total-cards");
    const compSuccessRate = document.getElementById("comp-success-rate");

    EventBus.on("session:completed", (data) => {
        const { sessionCount, sessionSuccessCount } = data;
        
        if (compTotalCards) compTotalCards.textContent = sessionCount;
        
        if (compSuccessRate) {
            const rate = sessionCount > 0 ? Math.round((sessionSuccessCount / sessionCount) * 100) : 100;
            compSuccessRate.textContent = `${rate}%`;
        }
        
        if (completionScreen) {
            completionScreen.classList.remove("hidden");
        }
    });

    // 5. Configuração de Listeners DOM Locais de Interação (Event Listeners)

    // Revelação de laudo clínico pelo botão ou tecla Espaço
    const revealBtn = document.getElementById("reveal-btn");
    const handleReveal = () => {
        if (revealBtn && revealBtn.style.display !== "none" && (!completionScreen || completionScreen.classList.contains("hidden"))) {
            Renderer.revealAnswer();
        }
    };

    if (revealBtn) {
        revealBtn.addEventListener("click", handleReveal);
    }
    EventBus.on("keyboard:space", handleReveal);

    // Classificações do Spaced Repetition (Erré, Difícil, Fácil)
    document.querySelectorAll(".recall-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const rating = btn.getAttribute("data-rating");
            if (activeCard) {
                SpacedRepetition.rateCard(activeCard, rating);
            }
        });
    });

    // Atalhos de teclado mapeados para botões SRS (Teclas 1, 2, 3)
    EventBus.on("keyboard:1", () => {
        const btn = document.querySelector(".recall-btn[data-rating='wrong']");
        if (btn && activeCard && btn.parentNode && btn.parentNode.style.display !== "none") {
            SpacedRepetition.rateCard(activeCard, "wrong");
        }
    });

    EventBus.on("keyboard:2", () => {
        const btn = document.querySelector(".recall-btn[data-rating='hard']");
        if (btn && activeCard && btn.parentNode && btn.parentNode.style.display !== "none") {
            SpacedRepetition.rateCard(activeCard, "hard");
        }
    });

    EventBus.on("keyboard:3", () => {
        const btn = document.querySelector(".recall-btn[data-rating='easy']");
        if (btn && activeCard && btn.parentNode && btn.parentNode.style.display !== "none") {
            SpacedRepetition.rateCard(activeCard, "easy");
        }
    });

    // Botão de Reiniciar Sessão na tela de conclusão
    const restartDeckBtn = document.getElementById("restart-deck-btn");
    if (restartDeckBtn) {
        restartDeckBtn.addEventListener("click", () => {
            if (completionScreen) completionScreen.classList.add("hidden");
            State.initSession(State.currentFilter);
        });
    }

    // Botão de Reset Geral do Progresso (Header)
    const resetProgressBtn = document.getElementById("reset-all-progress");
    if (resetProgressBtn) {
        resetProgressBtn.addEventListener("click", () => {
            const confirmReset = confirm("¿Desea restablecer todo su progreso en esta consola de tarjetas de estudio? Esto borrará sus datos de aprendizaje individual de forma permanente.");
            if (confirmReset) {
                SpacedRepetition.resetAll();
                alert("¡Progreso restablecido con éxito! Buen estudio.");
            }
        });
    }

    // Rolagem suave até a estação de estudos pelo botão Acceder da Hero
    const scrollToStudyBtn = document.getElementById("scroll-to-study-btn");
    if (scrollToStudyBtn) {
        scrollToStudyBtn.addEventListener("click", () => {
            const studyWorkspace = document.getElementById("study-workspace");
            if (studyWorkspace) {
                studyWorkspace.scrollIntoView({ behavior: "smooth" });
            }
        });
    }

    // 6. Bootstrap Completo do Fundo Inicial da Fila
    State.initSession("Todos");
});
