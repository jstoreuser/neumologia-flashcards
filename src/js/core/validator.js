// ==========================================================================
// BARCL Clinical Schema Validator (Dataset Integrity Guard)
// ==========================================================================

export const Validator = {
    /**
     * Valida a estrutura semântica e física de um único flashcard médico.
     * Lança uma exceção detalhada caso encontre inconsistências de dados.
     */
    validateCard(card) {
        if (!card) {
            throw new Error("Card data is null or undefined.");
        }
        if (typeof card.id !== "number" || isNaN(card.id)) {
            throw new Error(`Invalid card ID: Expected number, got "${typeof card.id}".`);
        }
        if (typeof card.pageNumber !== "string" || !card.pageNumber.trim()) {
            throw new Error(`Card [ID:${card.id}]: "pageNumber" must be a non-empty string.`);
        }
        if (!Array.isArray(card.images)) {
            throw new Error(`Card [ID:${card.id}]: "images" must be a valid Array.`);
        }
        if (typeof card.prompt !== "string" || !card.prompt.trim()) {
            throw new Error(`Card [ID:${card.id}]: "prompt" must be a non-empty string.`);
        }
        if (typeof card.answer !== "string" || !card.answer.trim()) {
            throw new Error(`Card [ID:${card.id}]: "answer" must be a non-empty string.`);
        }
        if (typeof card.explanation !== "string" || !card.explanation.trim()) {
            throw new Error(`Card [ID:${card.id}]: "explanation" must be a non-empty string.`);
        }
        if (!Array.isArray(card.tags)) {
            throw new Error(`Card [ID:${card.id}]: "tags" must be a valid Array.`);
        }
        return true;
    },

    /**
     * Audita o banco de dados inteiro no ciclo de bootstrap.
     */
    validateDataset(dataset) {
        if (!Array.isArray(dataset)) {
            throw new Error("FLASHCARD_DATA dataset is not a valid Array.");
        }
        if (dataset.length === 0) {
            throw new Error("FLASHCARD_DATA dataset is empty. Rebuild data first.");
        }
        for (const card of dataset) {
            this.validateCard(card);
        }
        return true;
    }
};
