
const btn = document.querySelector('.talk');
const content = document.querySelector('.content');

// Configuração da voz do JARVIS
function speak(text) {

    if (!('speechSynthesis' in window)) {
        alert("Seu navegador não suporta síntese de voz.");
        return;
    }

    const text_speak = new SpeechSynthesisUtterance(text);

    text_speak.lang = "pt-BR";
    text_speak.rate = 1;
    text_speak.volume = 1;
    text_speak.pitch = 1;

    const voices = window.speechSynthesis.getVoices();

    const brazilianVoice = voices.find(voice =>
        voice.lang.toLowerCase() === "pt-br"
    );

    if (brazilianVoice) {
        text_speak.voice = brazilianVoice;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(text_speak);
}

// Reconhecimento de voz
const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

if (!SpeechRecognition) {

    content.textContent =
        "Seu navegador não suporta reconhecimento de voz. Utilize o Google Chrome.";

} else {

    const recognition = new SpeechRecognition();

    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;

    // Mensagem inicial
    window.addEventListener('load', () => {
        speak("Olá! Eu sou o Jarvis, seu assistente virtual. Como posso ajudar você?");
    });

    // Reconhecimento do que você fala
    recognition.onresult = (event) => {

        const transcript =
            event.results[event.resultIndex][0].transcript;

        content.textContent = "Você disse: " + transcript;

        takeCommand(transcript);
    };

    // Tratamento de erros
    recognition.onerror = (event) => {

        if (event.error === "not-allowed") {
            content.textContent = "Permita o acesso ao microfone.";
        } else {
            content.textContent =
                "Não consegui entender. Tente novamente.";
        }
    };

    // Botão do microfone
    btn.addEventListener('click', () => {

        content.textContent = "Estou ouvindo você...";

        try {
            recognition.start();
        } catch (error) {
            console.log("Reconhecimento já iniciado.");
        }
    });

    // Interpretação dos comandos
    function takeCommand(message) {

        message = message.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        if (
            message.includes("ola") ||
            message.includes("bom dia") ||
            message.includes("boa tarde") ||
            message.includes("boa noite")
        ) {

            speak("Olá! É um prazer falar com você. Como posso ajudar?");

        } else if (message.includes("abrir google")) {

            window.open("https://www.google.com", "_blank");
            speak("Abrindo o Google.");

        } else if (message.includes("abrir youtube")) {

            window.open("https://www.youtube.com", "_blank");
            speak("Abrindo o YouTube.");

        } else if (message.includes("abrir facebook")) {

            window.open("https://www.facebook.com", "_blank");
            speak("Abrindo o Facebook.");

        } else if (message.includes("horas")) {

            const time = new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit"
            });

            speak("Agora são " + time);

        } else if (message.includes("data")) {

            const date = new Date().toLocaleDateString("pt-BR");

            speak("Hoje é dia " + date);

        } else if (message.includes("pesquisar")) {

            const query = message.replace("pesquisar", "").trim();

            if (query) {

                window.open(
                    "https://www.google.com/search?q=" +
                    encodeURIComponent(query),
                    "_blank"
                );

                speak("Pesquisando " + query + " no Google.");

            } else {

                speak("O que você gostaria de pesquisar?");
            }

        } else if (message.includes("wikipedia")) {

            const query = message.replace("wikipedia", "").trim();

            window.open(
                "https://pt.wikipedia.org/wiki/" +
                encodeURIComponent(query),
                "_blank"
            );

            speak("Pesquisando na Wikipédia.");

        } else if (
            message.includes("obrigado") ||
            message.includes("obrigada")
        ) {

            speak("Por nada! Estou sempre à disposição.");

        } else if (message.includes("quem e voce")) {

            speak("Eu sou o Jarvis, seu assistente virtual.");

        } else if (message.includes("tchau")) {

            speak("Até logo! Foi um prazer ajudar você.");

        } else {

            speak("Desculpe, não entendi seu comando. Pode repetir, por favor?");
        }
    }
}

