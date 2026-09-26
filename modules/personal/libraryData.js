// Conteúdo inicial da lista global (usado só na primeira vez). São itens de exemplo para
// verificar o fluxo; substitua pelos itens reais do sistema.
const example = (label, count, withDescription) =>
    Array.from({ length: count }, (_, index) => ({
        name: `${label} ${index + 1}`,
        ...(withDescription ? { desc: `Descrição de exemplo de ${label} ${index + 1}.` } : {})
    }));

export const librarySeeds = {
    proficiencies: example('Proficiência', 5, false),
    talents: example('Talento', 5, true),
    languages: example('Idioma', 5, false),
    diseases: example('Doença', 5, true),
    traits: example('Traço', 5, true)
};
