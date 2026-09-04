const attributeGroups = [
    {
        attrCondition: { id: "weakened", name: "Enfraquecido" },
        attributes: [
            { id: "strength", name: "Força" },
            { id: "dexterity", name: "Destreza" }
        ]
    },
    {
        attrCondition: { id: "unwell", name: "Indisposto" },
        attributes: [
            { id: "constitution", name: "Constituição" },
            { id: "charisma", name: "Carisma" }
        ]
    },
    {
        attrCondition: { id: "miserable", name: "Miserável" },
        attributes: [
            { id: "psyche", name: "Psique" },
            { id: "wisdom", name: "Sabedoria" }
        ]
    }
];

const container = document.getElementById("attributesContainer");

// 2. Renderiza a estrutura na tela automaticamente
attributeGroups.forEach(group => {
    const attr1 = group.attributes[0];
    const attr2 = group.attributes[1];
    const cond = group.attrCondition;

    container.innerHTML += `
        <div class="attributeGroup">
            <!-- Atributo 1 -->
            <div class="attributeRow">
                <div class="attribute-left">
                    <label for="${attr1.id}">${attr1.name}:</label>
                    <input type="number" id="${attr1.id}" min="-3" max="3" value="0">
                </div>
                <div class="attribute-right">
                    <label for="temp_${attr1.id}">Mod. temporário:</label>
                    <input type="number" id="temp_${attr1.id}" min="-2" max="2" value="0">
                    <span id="dices_${attr1.id}" class="diceToRoll">3d6</span>
                </div>
            </div>

            <!-- Atributo 2 -->
            <div class="attributeRow">
                <div class="attribute-left">
                    <label for="${attr2.id}">${attr2.name}:</label>
                    <input type="number" id="${attr2.id}" min="-3" max="3" value="0">
                </div>
                <div class="attribute-right">
                    <label for="temp_${attr2.id}">Mod. temporário:</label>
                    <input type="number" id="temp_${attr2.id}" min="-2" max="2" value="0">
                    <span id="dices_${attr2.id}" class="diceToRoll">3d6</span>
                </div>
            </div>

            <!-- Condição -->
            <div class="conditionBox">
                <input type="checkbox" id="${cond.id}" class="conditionCheckbox">
                <label for="${cond.id}"><strong>${cond.name}</strong></label>
            </div>
        </div>
    `;
});

attributeGroups.forEach(group => {
    const checkbox = document.getElementById(group.attrCondition.id);

    checkbox.addEventListener("change", function() {
        group.attributes.forEach(attr => {
            const inputAttribute = document.getElementById(attr.id);
            let valorAtual = parseInt(inputAttribute.value);

            if (checkbox.checked) {
                inputAttribute.value = valorAtual - 1;
            } else {
                inputAttribute.value = valorAtual + 1;
            }
        });
    });
});

