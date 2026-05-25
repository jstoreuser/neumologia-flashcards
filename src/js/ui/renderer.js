// ==========================================================================
// BARCL Clinical Text Renderer (UI Component Builder)
// ==========================================================================

export const Renderer = {
    metaPageEl: null,
    metaStudyEl: null,
    promptEl: null,
    answerEl: null,
    explanationEl: null,
    answerBoxEl: null,
    answerDividerEl: null,
    revealBtnEl: null,
    recallButtonsBarEl: null,

    /**
     * Liga referências DOM de textos e laudos médicos.
     */
    init() {
        this.metaPageEl = document.getElementById("card-meta-page");
        this.metaStudyEl = document.getElementById("card-meta-study");
        this.promptEl = document.getElementById("card-prompt");
        this.answerEl = document.getElementById("card-answer");
        this.explanationEl = document.getElementById("card-explanation");
        this.answerBoxEl = document.getElementById("answer-box");
        this.answerDividerEl = document.getElementById("answer-divider");
        this.revealBtnEl = document.getElementById("reveal-btn");
        this.recallButtonsBarEl = document.getElementById("recall-buttons-bar");
    },

    /**
     * Renderiza o cabeçalho PACS com o estudo e a página clínica.
     */
    renderHeader(card) {
        if (this.metaPageEl) {
            this.metaPageEl.textContent = `PÁGINA ${card.pageNumber}`;
        }
        
        if (this.metaStudyEl) {
            if (card.tags.includes("Tomografía")) {
                this.metaStudyEl.textContent = "TC PULMONAR - AXIAL";
            } else if (card.tags.includes("Radiografía")) {
                this.metaStudyEl.textContent = "RX DE TÓRAX - FRENTE";
            } else {
                this.metaStudyEl.textContent = "IMAGEN PULMONAR";
            }
        }
    },

    /**
     * Renderiza a pergunta diagnóstica do card ativo.
     */
    renderPrompt(promptText) {
        if (this.promptEl) {
            this.promptEl.textContent = promptText;
        }
    },

    /**
     * Prepara os campos ocultos do laudo radiológico (diagnóstico e achados clínicos).
     */
    renderAnswerAndExplanation(card) {
        if (this.answerEl) {
            this.answerEl.textContent = card.answer;
        }
        
        if (this.explanationEl) {
            this.explanationEl.innerHTML = card.explanation;
        }
    },

    /**
     * Reseta os painéis ocultando o verso (laudo clínico) e reexibindo o botão de revelação.
     */
    resetRevealState() {
        if (this.answerDividerEl) this.answerDividerEl.style.display = "none";
        if (this.answerBoxEl) this.answerBoxEl.style.display = "none";
        if (this.revealBtnEl) this.revealBtnEl.style.display = "flex";
        if (this.recallButtonsBarEl) this.recallButtonsBarEl.style.display = "none";
    },

    /**
     * Revela o laudo radiológico e os botões do algoritmo SRS.
     */
    revealAnswer() {
        if (this.answerDividerEl) this.answerDividerEl.style.display = "block";
        if (this.answerBoxEl) this.answerBoxEl.style.display = "block";
        if (this.revealBtnEl) this.revealBtnEl.style.display = "none";
        if (this.recallButtonsBarEl) this.recallButtonsBarEl.style.display = "grid";

        // Rolagem suave no mobile e telas pequenas para exibir o laudo
        setTimeout(() => {
            if (this.answerBoxEl) {
                this.answerBoxEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
        }, 80);
    }
};
