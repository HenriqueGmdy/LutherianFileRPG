// Conteúdo dos tooltips. Cada chave é usada em data-tooltip="chave" (HTML estático)
// ou gerada no JS ("skill.<id>", "attr.<id>"). Campos: title, attr (opcional), tagline (opcional), text.
export const tooltipsData = {
    // ---------- Textos redigidos a partir das regras já presentes na ficha (revisar) ----------
    level: {
        title: "Nível",
        text: "O nível do personagem, de 1 a 9. Habilidades de classe e de raça escalam com ele, e o emblema muda a cada nível."
    },
    vitality: {
        title: "Vitalidade",
        text: "A vida do personagem. A Constituição é o principal contador de vitalidade. Ao chegar a 0, o personagem cai morrendo e passa a testar o Limiar da Morte."
    },
    willpower: {
        title: "Vontade",
        text: "Reserva de energia mental do personagem, gasta ao conjurar magias. Alguns efeitos alteram o custo de vontade das magias."
    },
    stress: {
        title: "Estresse",
        text: "Mede o abalo mental do personagem, de 0 a 200. Ao atingir 100, você deve usar o botão de condição de estresse: o personagem se torna Aflito ou Virtuoso. Zerar o estresse encerra a condição."
    },

    // ---------- Status ----------
    deathThreshold: {
        title: "Limiar da Morte",
        text: "O teste final. Role a perícia de Limiar da morte a cada rodada. Para cada valor abaixo de 10, você marca uma caixa. Com as 3 marcas, seu personagem morre."
    },
    inspiration: {
        title: "Inspiração",
        text: "Seu personagem é agraciado pela benção do destino. Ele pode re-rolar um dado mal-sucedido, evitar um vexame ou anular um crítico positivo inimigo contra si usando inspiração."
    },
    stressRoll: {
        title: "Condição de estresse",
        text: "Ao atingir 100 de estresse, você deve apertar esse botão."
    },
    defense: {
        title: "Classe de defesa",
        text: "A classe de defesa subtrai o dano físico (e às vezes mágico) sofrido pelo personagem."
    },
    morale: {
        title: "Moral",
        text: "A moral é um indicativo de como os personagens são recebidos pelo mundo. Uma moral positiva indica um ser que é comumente bem recebido, enquanto uma moral negativa gera nas pessoas estranheza e desconfiança."
    },
    size: {
        title: "Tamanho",
        text: "O tamanho é indicado nas raças, e por padrão é médio."
    },
    speed: {
        title: "Deslocamento base/final",
        text: "O deslocamento costuma ser 6 qds por padrão, mas pode ser reduzido ou aumentado por condições externas."
    },
    initiative: {
        title: "Iniciativa",
        text: "A iniciativa é d20 + Destreza. O valor exibido já considera o mod. temporário e as penalidades ativas de Destreza."
    },
    threat: {
        title: "Nível de ameaça",
        text: "O quão perigoso e catalogado um personagem é para o mundo. Nível de ameaça mais alto indica perigo imediato para as pessoas."
    },

    // ---------- Atributos ----------
    "attr.strength": {
        title: "Força",
        text: "O atributo de força representa sua potência muscular e habilidade atlética. A capacidade de realizar golpes poderosos e de erguer objetos muitos pesados é medido com esse atributo."
    },
    "attr.dexterity": {
        title: "Destreza",
        text: "A destreza mede a velocidade de reação, bem como agilidade física e astúcia corporal. Um personagem com destreza alta se esquiva facilmente de ataques, bem como realiza manobras complexas com facilidade."
    },
    "attr.constitution": {
        title: "Constituição",
        text: "A constituição define a resiliência física de um personagem. Além de ser o principal contador de vitalidade do personagem, um jogador com muito deste atributo tem maior capacidade de resistir a golpes e lutar contra a morte."
    },
    "attr.psyche": {
        title: "Psique",
        text: "Apesar da magia ser custosa, o atributo de psique garante a perícia que demanda o uso pleno deste, bem como torna um personagem mais perspicaz, intelectual e lógico. O conhecimento aprendido é adquirido através desse atributo."
    },
    "attr.wisdom": {
        title: "Sabedoria",
        text: "Este atributo representa o conhecimento de vida do personagem. Conhecer técnicas de sobrevivência e de superar situações, bem como outras atividades pessoais de conhecimento requer sabedoria."
    },
    "attr.charisma": {
        title: "Carisma",
        text: "Quando a agressividade não resolve, um personagem terá que recorrer a lábia. Convencer seus adversários com conversa, bem como apresentar-se de forma amistosa vai requerer um bom valor em carisma."
    },

    // ---------- Perícias ----------
    "skill.atletismo": {
        title: "Atletismo",
        attr: "(For)",
        tagline: "Flexione os músculos. Realize manobras.",
        text: "A perícia de atletismo é utilizada quando o jogador decide pôr seu personagem no limite físico, seja nadando, correndo ou escalando. Em níveis elevados, um personagem com atletismo pode correr longas distâncias tão rápido quanto cavalos, ou nadar contra uma correnteza sem muitos problemas. Em níveis mais baixos, no entanto, uma breve disparada pode te fazer perder o fôlego, e tentar escalar pode resultar em uma queda feia."
    },
    "skill.luta": {
        title: "Luta",
        attr: "(For)",
        tagline: "Deixe o corpo tomar o controle. Faça eles se sentirem ameaçados.",
        text: "A resposta rápida e agressiva pode ser uma alternativa útil em boa parte dos casos. A luta é utilizada sempre que o embate físico é iminente, seja atacando, ou defendendo-se. Um jogador com níveis elevados de luta representa uma ameaça tangível aos seus oponentes, com golpes poderosos e assertivos. Em níveis mais baixos, você se torna facilmente vulnerável a ataques e dificilmente venceria qualquer um em uma disputa física."
    },
    "skill.vontade": {
        title: "Força de vontade",
        attr: "(Con)",
        tagline: "Mantenha a cabeça no lugar. Não deixe seu corpo ceder à pressão.",
        text: "A força de vontade é a capacidade de manter seu corpo em sincronia com a mente. Sempre que uma situação perturbar esse equilíbrio, você precisará acreditar em si mesmo. Em níveis elevados, você não cederá a ataques que te perturbam de forma alguma. Entretanto, com pouca força de vontade, seu personagem facilmente cederá ao estresse."
    },
    "skill.limiar": {
        title: "Limiar da morte",
        attr: "(Con)",
        tagline: "Respire fundo. Ainda não acabou para você.",
        text: "Sempre que a vitalidade se esvai quase por inteira, uma luta entre a vida e a morte se inicia. Enquanto agoniza no chão, seu personagem precisará de resistência para permanecer vivo até a ajuda chegar. Com nível alto em Limiar, o personagem possui maiores chances de se recuperar dos danos fatais que recebeu, conseguindo se estabilizar. Níveis inferiores, no entanto, indicam que a morte é mais certeira assim que você é atingido."
    },
    "skill.resistencia": {
        title: "Resistência",
        attr: "(Con)",
        tagline: "Aguente firme. Não deixe o mundo te matar.",
        text: "A resistência é crucial para manter a saúde estável. Para quê mirar com armas, se você aguenta alguns tiros? Ter cuidado ao ingerir coisas suspeitas não tem importância se você for muito saudável. Em níveis elevados, você aguentará boas pancadas, bem como poderá mitigar completamente esses ferimentos. Ter um nível baixo de resistência significará grandes estragos ao ser atingido, diminuindo suas chances de poder se defender."
    },
    "skill.coordenacao": {
        title: "Coordenação",
        attr: "(Des)",
        tagline: "Fique firme. Mantenha a postura impassível.",
        text: "A coordenação engloba capacidades de equilíbrio físico do personagem. Níveis elevados trarão uma percepção infalível do espaço a sua volta, permitindo que nada nesse mundo derrube-o nem o faça tropeçar. Em contrapartida, uma coordenação mais baixa tornará seu personagem facilmente atingível, desequilibrado e desastrado."
    },
    "skill.furtividade": {
        title: "Furtividade",
        attr: "(Des)",
        tagline: "Fuja dos holofotes. Acerte-os quando menos esperarem.",
        text: "Furtividade é a maior aliada dos assassinos e mestra dos procurados. A capacidade de se esconder provida em níveis superiores garante que qualquer meia-luz e objeto se torne um esconderijo perfeito para fugir da percepção de inimigos. Entretanto, com baixa furtividade, você dificilmente conseguirá se ocultar até mesmo em ambientes propícios e sequer perceberá."
    },
    "skill.navegacao": {
        title: "Navegação",
        attr: "(Des)",
        tagline: "Guie-se com convicção. Ponha a sua carroça no caminho certo.",
        text: "A navegação é a capacidade do personagem de reconhecer rapidamente o mundo à sua volta, e se guiar. Em níveis elevados, detalhes mínimos que passam despercebidos pela maioria como direção do sol ou tipo de vegetação te auxiliarão a sempre seguir o caminho correto. Em contrapartida, em níveis inferiores, seu personagem pode casualmente esquecer a diferença de leste e oeste, levando seu grupo a problemas ainda maiores."
    },
    "skill.pontaria": {
        title: "Pontaria",
        attr: "(Des)",
        tagline: "Pronto? Mire e atire.",
        text: "Se o seu foco não é o combate físico, o uso de armas a distância é indispensável, e a pontaria mais ainda. Um jogador com níveis elevados em pontaria calcula meticulosamente seus tiros até nos cenários mais caóticos. Uma pontaria mais reduzida indica, em contrapartida, que a chance de acerto com essas armas é praticamente zero."
    },
    "skill.reacao": {
        title: "Reação",
        attr: "(Des) (For) (Con)",
        tagline: "O homem mais rápido em reagir; intocável.",
        text: "A reação é o conjunto de três testes que indicam seu instinto ao tentar se defender de um golpe: Esquiva, usando o atributo de destreza; Contra-ataque, usando o atributo de força e Bloqueio, usando o atributo de Constituição. Em níveis elevados, você facilmente irá reagir adequadamente a golpes, encaixando o atributo que melhor se adequar ao seu personagem. Em contrapartida, com uma reação lenta, seu personagem será um saco de pancada ambulante, recebendo os golpes de qualquer inútil que o enfrentar."
    },
    "skill.arcanismo": {
        title: "Arcanismo",
        attr: "(Psi)",
        tagline: "Execute feitos impossíveis. Domine a magia.",
        text: "O arcanismo é a ferramenta de conjuração de magias. Um bom feiticeiro treina por anos para dominar esta perícia a fim de nunca errar uma magia sequer. Sem muito treino, no entanto, a chance das forças arcanas não serem suficientes é bem elevada, levando o personagem a falhar na execução de uma magia."
    },
    "skill.existir": {
        title: "Existir",
        attr: "(Psi)",
        tagline: "Acredite na realidade. Mantenha-se nela.",
        text: "A perícia de existir é usada como salvaguarda contra magias que botam em xeque a percepção de existência do ser. Em níveis elevados, o personagem resiste facilmente à magias que façam a realidade se dobrar ao seu redor. Em contrapartida, com um baixo valor de existir, a realidade se desmontará facilmente em torno de seu personagem, fazendo-o ser apagado da realidade."
    },
    "skill.logica": {
        title: "Lógica",
        attr: "(Psi)",
        tagline: "Manipule o poder intelectual; deduza o mundo.",
        text: "A lógica é uma grande aliada em situações que exijam utilizar a mente. Investigar, deduzir e encontrar padrões pode ser uma tarefa fácil para um personagem lógico. Com pouca desta perícia, será difícil realizar ações que demandem um raciocínio mais rebuscado, mesmo que a resolução seja óbvia."
    },
    "skill.percepcao": {
        title: "Percepção",
        attr: "(Psi)",
        tagline: "Veja, escute e fareje. Não deixe nenhum detalhe passar.",
        text: "A percepção é aliada de investigadores sensitivos. Perceber detalhes através dos sentidos é um talento nato para aqueles que possuem grandes valores nessa perícia. Em baixos níveis, a capacidade de notar algo se aproximando é seriamente prejudicada também."
    },
    "skill.interacao": {
        title: "Interação",
        attr: "(Psi)",
        tagline: "Mestre dos mecanismos. Destrua e conserte com habilidade extrema.",
        text: "A interação é relacionada a capacidade de utilizar mecanismos construídos, máquinas relacionadas ou não à magia. Com uma boa interação, compreender circuitos e manipulá-los será uma tarefa fácil para você. Com uma quantia baixa de interação, interagir com esses problemas será como tentar compreender uma língua nova."
    },
    "skill.adestramento": {
        title: "Adestramento",
        attr: "(Sab)",
        tagline: "Controle os animais, faça com que te obedeçam.",
        text: "O adestramento pode ser utilizado para amansar ou sugerir uma ação para animais e bestas. Normalmente essa perícia é usada apenas em animais selvagens, mas pode ser requisitada quando animais estão nervosos ou fora de controle."
    },
    "skill.enciclopedia": {
        title: "Enciclopédia",
        attr: "(Sab)",
        tagline: "Manipule o poder intelectual bruto; saiba de tudo.",
        text: "A enciclopédia é o poder de conhecer de tudo (ou parecer que sabe). Com níveis elevados, você se recordará de conhecimentos antigos com detalhes incríveis, além de ganhar muito prestígio pelo grande arsenal intelectual que você terá. Com uma capacidade reduzida, no entanto, será difícil se recordar até mesmo de fenômenos recentes, tendo você de se abster de conhecimento raso."
    },
    "skill.medicina": {
        title: "Medicina",
        attr: "(Sab)",
        tagline: "Salve seus aliados, reconstrua a carne.",
        text: "Medicina é um teste de cura com artifícios físicos. Além disso, sempre que um aliado estiver morrendo, este é o único teste que poderá salvá-lo. Com uma boa medicina, você será um bom curandeiro repentino, ajudando seus aliados a fugir da morte. Em contrapartida, com um valor reduzido de medicina, você poderá prejudicar seus aliados ao tentar ajudá-los."
    },
    "skill.religiao": {
        title: "Religião",
        attr: "(Sab) (Car)",
        tagline: "Louve e seja louvado. Controle as massas ignorantes.",
        text: "A capacidade de conhecer a religião é muito importante no mundo de Lutherian. Em um mundo decadente, todos procuram alívio com base em promessas infundadas e planos etéreos. Com uma boa base religiosa, você poderá se aproveitar facilmente da fé das pessoas, reforçando suas crenças. Um ser com menos religião, no entanto, pode facilmente ser manipulado por esta, ou talvez sequer compreenda a razão de crer em algo."
    },
    "skill.sobrevivencia": {
        title: "Sobrevivência",
        attr: "(Sab)",
        tagline: "Aprenda a se virar. Seja um com a natureza.",
        text: "A sobrevivência garante capacidades de manejar-se de forma adequada em ambientes hostis. Com níveis elevados, essa perícia garantirá uma manipulação da natureza avançada, bem como utilizar recursos obsoletos para outros fins."
    },
    "skill.autoridade": {
        title: "Autoridade",
        attr: "(Car)",
        tagline: "Intimide o público. Imponha-se.",
        text: "A autoridade lhe permite se impor no meio dos demais, demonstrando dominância e exigindo respeito, além de lhe permitir compreender rapidamente a hierarquia de onde você está. Em níveis elevados, mínimas desfeitas contra você te botará em uma posição para quebrar os joelhos de seus opositores. Com níveis inferiores, no entanto, você comumente será alvo de vexames e não conseguirá ser levado a sério facilmente."
    },
    "skill.compostura": {
        title: "Compostura",
        attr: "(Car)",
        tagline: "Endireite-se e mantenha a postura impassível.",
        text: "A compostura te ajuda a perceber e ocultar suas vulnerabilidades; ao passo que te permite explorar a dos outros. Acertar onde dói com palavras pode ser mais devastador ou reconfortante do que lâminas e ataduras. Com níveis inferiores, você será uma porta emocional, incapaz de manejar suas palavras com delicadeza."
    },
    "skill.drama": {
        title: "Drama",
        attr: "(Car)",
        tagline: "Seja um ator; minta e detecte mentiras.",
        text: "Fingindo que o mundo é o seu palco, um bom dramático fará com que histórias mirabolantes, feitos incríveis e pessoas nunca antes vistas se tornem realidade quando saem de sua boca. Quando o drama é inferior, você será o que acredita, e sequer desconfiará até seus últimos dias."
    },
    "skill.empatia": {
        title: "Empatia",
        attr: "(Car)",
        tagline: "Alivie a tensão. Diga o que querem ouvir.",
        text: "A empatia pode ser utilizada de forma genuína ou não. Independente, ela é uma ferramenta poderosa para aliviar o estresse de seus aliados, além de criar laços e elevar a moral dos aliados. Um ser pouco empático pode causar o efeito inverso, obviamente."
    },
    "skill.uniao": {
        title: "União",
        attr: "(Car)",
        tagline: "Conecte-se à sua equipe. Entenda sua cultura.",
        text: "A união é uma perícia que serve para qualquer atributo, dependendo de quê exatamente você está ajudando. Sempre que você resolver auxiliar sua equipe, você aumenta a moral, alivia os estresses e reforça laços. A interação em equipe também é efetiva com essa perícia. Com pouca união, claramente, você estará sujeito a enfrentar todos os males do mundo sozinho."
    }
};
