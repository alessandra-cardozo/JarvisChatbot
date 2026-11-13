
const btn = document.querySelector(".talk");
const content = document.querySelector(".content");

function speak(text) {
    if (!("speechSynthesis" in window)) {
        content.textContent = "Seu navegador não suporta voz.";
        return;
    }

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "pt-BR";
    speech.rate = 0.9;
    speech.pitch = 1;
    speech.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v =>
        v.lang.toLowerCase() === "pt-br"
    );

    if (voice) speech.voice = voice;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
}

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    content.textContent =
        "Use o Google Chrome para conversar comigo.";
} else {

    const recognition = new SpeechRecognition();

    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;

    btn.addEventListener("click", () => {
        content.textContent = "Estou ouvindo. Pode falar!";
        try {
            recognition.start();
        } catch (error) {
            console.log("Reconhecimento já está ativo.");
        }
    });

    recognition.onresult = (event) => {

        const alternatives =
            event.results[event.resultIndex];

        // Seleciona a alternativa com maior confiança
        let best = alternatives[0];

        for (let i = 1; i < alternatives.length; i++) {
            if (
                alternatives[i].confidence >
                best.confidence
            ) {
                best = alternatives[i];
            }
        }

        const transcript = best.transcript;

        content.textContent = "Você disse: " + transcript;

        takeCommand(transcript);
    };

    recognition.onerror = (event) => {
        if (event.error === "not-allowed") {
            content.textContent =
                "Permita o acesso ao microfone.";
        } else if (event.error === "no-speech") {
            content.textContent =
                "Não ouvi sua voz. Tente novamente.";
        } else {
            content.textContent =
                "Tive dificuldade para ouvir. Tente novamente.";
        }
    };

    recognition.onend = () => {
        console.log("Reconhecimento finalizado.");
    };

    function takeCommand(originalMessage) {

        let message = originalMessage
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[.,!?]/g, "")
            .trim();

        if (
            message.includes("ola") ||
            message.includes("oi jarvis") ||
            message.includes("bom dia") ||
            message.includes("boa tarde") ||
            message.includes("boa noite")
        ) {
            speak("Olá! É um prazer falar com você. Como posso ajudar?");

        } else if (
            message.includes("abrir google") ||
            message.includes("abre google") ||
            message.includes("abra o google")
        ) {
            window.open("https://www.google.com", "_blank");
            speak("Abrindo o Google.");

        } else if (
            message.includes("abrir youtube") ||
            message.includes("abre youtube") ||
            message.includes("abra o youtube")
        ) {
            window.open("https://www.youtube.com", "_blank");
            speak("Abrindo o YouTube.");

        } else if (
            message.includes("abrir facebook") ||
            message.includes("abre facebook") ||
            message.includes("abra o facebook")
        ) {
            window.open("https://www.facebook.com", "_blank");
            speak("Abrindo o Facebook.");

        } else if (
            message.includes("horas") ||
            message.includes("que hora")
        ) {
            const time = new Date().toLocaleTimeString(
                "pt-BR",
                { hour: "2-digit", minute: "2-digit" }
            );
            speak("Agora são " + time);

        } else if (
            message.includes("data de hoje") ||
            message.includes("que dia") ||
            message.includes("data")
        ) {
            const date = new Date().toLocaleDateString("pt-BR");
            speak("Hoje é dia " + date);

        } else if (
            message.startsWith("pesquisar") ||
            message.startsWith("pesquisa") ||
            message.startsWith("procura") ||
            message.startsWith("buscar") ||
            message.startsWith("busca")
        ) {
            const query = message
                .replace(/^(pesquisar|pesquisa|procura|buscar|busca)\s*/, "")
                .trim();

            if (query) {
                window.open(
                    "https://www.google.com/search?q=" +
                    encodeURIComponent(query),
                    "_blank"
                );
                speak("Pesquisando " + query + " no Google.");
            } else {
                speak("O que você gostaria que eu pesquisasse?");
            }

        } else if (message.includes("wikipedia")) {

            const query = message
                .replace("wikipedia", "")
                .trim();

            if (query) {
                window.open(
                    "https://pt.wikipedia.org/wiki/" +
                    encodeURIComponent(query),
                    "_blank"
                );
                speak("Pesquisando na Wikipédia.");
            } else {
                speak("O que você gostaria de pesquisar na Wikipédia?");
            }

        } else if (
            message.includes("obrigado") ||
            message.includes("obrigada")
        ) {
            speak("Por nada! Estou sempre à disposição.");

        } else if (
            message.includes("quem e voce") ||
            message.includes("quem e o jarvis")
        ) {
            speak("Eu sou o Jarvis, seu assistente virtual.");

        } else if (
            message.includes("tchau") ||
            message.includes("ate logo")
        ) {
            speak("Até logo! Foi um prazer ajudar você.");

        } else {
            speak(
                "Desculpe, não consegui identificar seu comando. Pode falar novamente?"
            );
        }
    }
}
