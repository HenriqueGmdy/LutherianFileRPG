// Lista de atributos com seus IDs e nomes
const listaAtributos = [
    { id: "strength", name: "Força" },
    { id: "dexterity", name: "Destreza" },
    { id: "constitution", name: "Constituição" },
    { id: "charisma", name: "Carisma" },
    { id: "psyche", name: "Psique" },
    { id: "wisdom", name: "Sabedoria" }
];

// Seleciona o container onde os atributos serão injetados
const containerAtributos = document.getElementById("attributesContainer");

listaAtributos.forEach(attr => {
    containerAtributos.innerHTML += `
        <div class="attributes">
            <label for="${attr.id}">${attr.name}:</label>
            <input type="number" id="${attr.id}" min="-3" max="3" value="0">

            <label for="temp_${attr.id}"> mod. Temporários:</label>
            <input type="number" id="temp_${attr.id}" min="-2" max="2" value="0">
            
            <span id="dices_${attr.id}" class="diceToRoll">3d6</span>
        </div>
    `;
});

// A lista das condições e quais IDs de atributos elas afetam
const listConditions = [
    { id: "weakened", nome: "Enfraquecido (For. e Des.)", attrs: ["strength", "dexterity"] },
    { id: "unwell", nome: "Indisposto (Const. e Car.)", attrs: ["constitution", "charisma"] },
    { id: "miserable", nome: "Miserável (Psi. e Sab.)", attrs: ["psyche", "wisdom"] }
];

// Seleciona o container onde as condições serão injetadas
const containerAttrConditions = document.getElementById("attributesConditionsContainer");

listConditions.forEach(cond => {
    containerAttrConditions.innerHTML += `
        <div class="condition-box">
            <input type="checkbox" id="${cond.id}" class="condition-checkbox">
            <label for="${cond.id}">${cond.nome}</label>
        </div>
    `;
});

// Adiciona o evento de mudança para cada checkbox de condição
listConditions.forEach(cond => {
    const checkbox = document.getElementById(cond.id);

    checkbox.addEventListener("change", function() {
        cond.attrs.forEach(attrId => {
            const inputAttribute = document.getElementById(attrId);
            let valorAtual = parseInt(inputAttribute.value);

            if (checkbox.checked) {
                inputAttribute.value = valorAtual - 1;
            } else {
                inputAttribute.value = valorAtual + 1;
            }
        });
    });
});