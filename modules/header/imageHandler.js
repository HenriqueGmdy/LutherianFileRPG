import { CONFIG } from '../../core/config.js';
import { reportSave } from '../../core/saveIndicator.js';

export function initImageHandler(options = {}) {
    // Permite configurar múltiplos slots de imagem no futuro passando seletores, 
    // mas já começa configurando a principal por padrão.
    const boxId = options.boxId || "imageUploadBox";
    const inputId = options.inputId || "charImageInput";
    const displayId = options.displayId || "charImageDisplay";
    const placeholderId = options.placeholderId || "imagePlaceholderText";
    const storageKey = options.storageKey || CONFIG.STORAGE_KEYS.IMAGE;

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
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Selecione um arquivo de imagem válido.');
            imageInput.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = event => compressImage(event.target.result, file.type)
            .then(imageData => {
                setImageVisuals(imageData, imageDisplay, placeholderText);

                try {
                    localStorage.setItem(storageKey, imageData);
                    reportSave(true, 'imagem');
                } catch (error) {
                    console.error('Não foi possível salvar a imagem:', error);
                    reportSave(false, 'imagem');
                    alert('A imagem foi carregada, mas não pôde ser salva no navegador.');
                }
            })
            .catch(error => {
                console.error('Não foi possível processar a imagem:', error);
                alert('Não foi possível processar essa imagem.');
            });

        reader.onerror = () => alert('Não foi possível ler o arquivo de imagem.');
        reader.readAsDataURL(file);
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

function compressImage(source, mimeType) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            const maxDimension = 1200;
            const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(image.width * scale));
            canvas.height = Math.max(1, Math.round(image.height * scale));

            const context = canvas.getContext('2d');
            if (!context) {
                reject(new Error('Canvas indisponível.'));
                return;
            }

            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL(mimeType === 'image/png' ? 'image/png' : 'image/jpeg', 0.82));
        };
        image.onerror = () => reject(new Error('Imagem inválida.'));
        image.src = source;
    });
}