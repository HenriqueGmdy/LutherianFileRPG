
const listaAtributos = [
    { id: "strength", name: "Força" },
    { id: "dexterity", name: "Destreza" },
    { id: "constitution", name: "Constituição" },
    { id: "charisma", name: "Carisma" },
    { id: "psyche", name: "Psique" },
    { id: "wisdom", name: "Sabedoria" }
];

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