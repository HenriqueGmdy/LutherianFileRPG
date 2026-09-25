export const racesData = {
    "human": {
        name: "Humano",
        body: {
            height: "Um humano adulto mede entre 1.40m e 2m.",
            weight: "Um humano adulto costuma pesar entre 50 e 110kg.",
            age: "Um humano pode viver até cerca de 100 anos."
        },
        advantage: "Melhoria latente: Humanos podem adquirir ou receber habilidades através de estudo ou treinamento com muita facilidade. A cada nível de melhoria, role 1d20. Se o resultado for igual ou superior a 14, seu personagem adquire uma nova técnica da lista de técnicas correspondente ao seu nível ou inferior.",
        curse: "Destino falho: Todos os humanos são vulneráveis às forças que regem a realidade, e principalmente, o véu. Testes de resistência contra magias de encantamento ou maldições possuem vantagem contra você."
    },
    "basilisk": {
        name: "Basilisco",
        body: {
            height: "Um basilisco adulto mede entre 1.70m e 2.50m.",
            weight: "Um basilisco adulto costuma pesar entre 95 e 180kg, devido às suas escamas pesadas.",
            age: "Um basilisco pode viver até cerca de 200 anos."
        },
        defenseBase: { attributes: ["strength", "constitution"], bonus: 1 },
        advantage: "Resistência ofídica: Essa raça ganha Classe de Defesa quando está sem nenhuma armadura igual a Mod. Força + Mod. Constituição + 1.",
        curse: "Presságio imunológico: Basiliscos sofrem o dobro de dano de condições duradouras, como envenenamento, além de sofrerem o dobro da penalidade de doenças."
    },
    "gray": {
        name: "Cinzento",
        body: {
            height: "Um cinzento adulto mede entre 1.35m e 1.70m.",
            weight: "Um cinzento adulto costuma pesar entre 45 e 90kg.",
            age: "Um cinzento pode viver até cerca de 450 anos."
        },
        advantage: "Afinidade mágica: Cinzentos possuem uma estranha relação com a magia, e por serem muito mais conectados a ela, não são tão punidos pelo véu. Uma vez por descanso, ao falhar em uma magia, você pode anular seu Paradoxo.",
        curse: "Vínculo transitório: Sua natureza desapegada quebra as leis do véu e causa um distúrbio quando você porta um anátema. Você recebe apenas metade do bônus de qualquer anátema, mas também se torna capaz de se desvincular dele com um teste de Força de Vontade DT16."
    },
    "constructs": {
        name: "Constructo",
        body: {
            height: "Um constructo pode ter basicamente qualquer tamanho.",
            weight: "Um constructo costuma pesar muito mais de 100kg, dependendo do seu tamanho.",
            age: "Um constructo vive até que seu núcleo seja destruído."
        },
        advantage: "Imunidade férrea: Você é completamente imune a condições como sangramento e envenenamento, e não precisa nem sofre de penalidades por falta de descanso ou fome.",
        curse: "Resquício da centelha: Seu núcleo morre, e você sabe disso. Você sofre +3 de dano de todas as fontes mágicas. Ao cair a 0 de VitA por magia, você cai com uma falha."
    },
    "goblins": {
        name: "Goblin",
        body: {
            height: "Um goblin mede entre 1 metro e 1.30m.",
            weight: "Um goblin costuma pesar entre 40 e 70kg.",
            age: "Um goblin pode viver até cerca de 50 anos."
        },
        advantage: "Premonição cautelosa: Goblins possuem vantagem em testes para detectar ou perceber armadilhas, e não precisam de uma fogueira para descansarem adequadamente.",
        curse: "Impulso Tribal: Ao entrar em combate, o goblin ganha a condição Confuso até o fim do combate se não for um dos 3 primeiros a atacar."
    },
    "resonant": {
        name: "Ressonante",
        body: {
            height: "A altura de um ressonante é definida pela raça que ele assume.",
            weight: "O peso de um ressonante é definido pela raça que ele assume.",
            age: "Ressonantes vivem indefinidamente, mas assumem a idade de seus antigos corpos."
        },
        lockedDeathFails: 1,
        advantage: "Observação espectral: Ressonantes enxergam plenamente em um grau a menos de escuridão exceto por escuridão mágica, além de não receberem estresse pela escuridão.",
        curse: "Ressonância: Você é um ressonante. Assuma a maldição da raça que você escolher como modelo (Exceto constructos). Além disso, ao cair em morrendo, você possui desvantagem em testes de Limiar da Morte e se morrer seu corpo desaparece completamente."
    }
};