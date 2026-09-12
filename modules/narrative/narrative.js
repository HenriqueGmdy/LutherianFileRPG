export function initNarrative() {
    const narrativeTextArea = document.getElementById("narrativeNotes");

    if (!narrativeTextArea) return;

    // Exemplo de comportamento opcional para o bloco de narrativa
    narrativeTextArea.addEventListener("focus", () => {
        // Você pode adicionar comportamentos específicos aqui se precisar
    });

    console.log("Módulo de Narrativa inicializado com sucesso.");
}