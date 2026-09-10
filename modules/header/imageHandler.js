export function initImageHandler(options = {}) {
    // Permite configurar múltiplos slots de imagem no futuro passando seletores, 
    // mas já começa configurando a principal por padrão.
    const boxId = options.boxId || "imageUploadBox";
    const inputId = options.inputId || "charImageInput";
    const displayId = options.displayId || "charImageDisplay";
    const placeholderId = options.placeholderId || "imagePlaceholderText";
    const storageKey = options.storageKey || "lutherian_char_image";

    const imageBox = document.getElementById(boxId);
    const imageInput = document.getElementById(inputId);
    const imageDisplay = document.getElementById(displayId);
    const placeholderText = document.getElementById(placeholderId);

    if (!imageBox || !imageInput) return;

    // Abre o explorador de arquivos ao clicar na caixa
    imageBox.addEventListener("click", () => {
        imageInput.click();
    });

    // Processa o arquivo selecionado
    imageInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const base64Image = event.target.result;
                
                setImageVisuals(base64Image, imageDisplay, placeholderText);
                localStorage.setItem(storageKey, base64Image);
            };
            reader.readAsDataURL(file);
        }
    });

    // Carrega a imagem salva anteriormente do localStorage ao iniciar
    const savedImage = localStorage.getItem(storageKey);
    if (savedImage) {
        setImageVisuals(savedImage, imageDisplay, placeholderText);
    }
}

// Função auxiliar interna para alternar a exibição visual
function setImageVisuals(src, displayElement, placeholderElement) {
    if (displayElement) {
        displayElement.src = src;
        displayElement.style.display = "block";
    }
    if (placeholderElement) {
        placeholderElement.style.display = "none";
    }
}