
const btn = document.querySelector(".talk");
const content = document.querySelector(".content");

// Normaliza o texto para facilitar o reconhecimento das frases
function normalize(text) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[.,!?;:]/g, "")
        .replace(/\s+/g, " ")
        .replace(/\bjarvis\b/g, "")
        .trim();
}

// Faz o JARVIS falar
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

// Abre um site
function openSite(url, message) {
    window.open(url, "_blank");
    speak(message);
}

// Reconhecimento de voz
const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

if (!SpeechRecognition) {

    content.textContent =
        "Seu navegador não suporta reconhecimento de voz. Use o Google Chrome.";

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

        const alternatives = event.results[event.resultIndex];

        // Usa a primeira transcrição, que é a principal opção do navegador
        const transcript = alternatives[0].transcript;

        content.textContent = "Você disse: " + transcript;

        takeCommand(transcript);
    };

    recognition.onerror = (event) => {

        if (event.error === "not-allowed") {
            content.textContent = "Permita o acesso ao microfone.";

        } else if (event.error === "no-speech") {
            content.textContent = "Não ouvi sua voz. Tente novamente.";

        } else {
            content.textContent =
                "Tive dificuldade para ouvir. Tente novamente.";
        }
    };

    recognition.onend = () => {
        console.log("Reconhecimento finalizado.");
    };

    // Interpreta os comandos e perguntas
    function takeCommand(originalMessage) {

        const message = normalize(originalMessage);

        if (!message) {
            speak("Não consegui ouvir sua pergunta. Pode repetir?");
            return;
        }

        // SAUDAÇÕES
        if (
            message === "oi" ||
            message.includes("ola") ||
            message.includes("bom dia") ||
            message.includes("boa tarde") ||
            message.includes("boa noite")
        ) {
            speak("Olá! É um prazer falar com você. Como posso ajudar?");
        }

        // DATA DE AMANHÃ
        else if (
            message.includes("amanha") ||
            message.includes("dia seguinte")
        ) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            const date = tomorrow.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            });

            speak("Amanhã será " + date);
        }

        // DATA DE HOJE
        else if (
            message.includes("hoje") ||
            message.includes("que dia") ||
            message.includes("qual a data") ||
            message.includes("qual e a data") ||
            message.includes("data de hoje")
        ) {
            const today = new Date();

            const date = today.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            });

            speak("Hoje é " + date);
        }

        // HORÁRIO
        else if (
            message.includes("horas") ||
            message.includes("que hora") ||
            message.includes("horario")
        ) {
            const time = new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit"
            });

            speak("Agora são " + time);
        }

        // GOOGLE
        else if (
            message.includes("google") &&
            (
                message.includes("abrir") ||
                message.includes("abre") ||
                message.includes("entrar") ||
                message.includes("acessar") ||
                message.includes("ir para") ||
                message.includes("ir no")
            )
        ) {
            openSite("https://www.google.com", "Abrindo o Google.");
        }

        // YOUTUBE
        else if (
            message.includes("youtube") &&
            (
                message.includes("abrir") ||
                message.includes("abre") ||
                message.includes("entrar") ||
                message.includes("acessar") ||
                message.includes("ir para") ||
                message.includes("ir no")
            )
        ) {
            openSite("https://www.youtube.com", "Abrindo o YouTube.");
        }

        // FACEBOOK
        else if (
            message.includes("facebook") &&
            (
                message.includes("abrir") ||
                message.includes("abre") ||
                message.includes("entrar") ||
                message.includes("acessar") ||
                message.includes("ir para") ||
                message.includes("ir no")
            )
        ) {
            openSite("https://www.facebook.com", "Abrindo o Facebook.");
        }

        // PESQUISAR NO GOOGLE
        else if (
            /^(pesquisar|pesquisa|pesquise|procura|procure|buscar|busca|busque)\b/.test(message)
        ) {
            const query = message.replace(
                /^(pesquisar|pesquisa|pesquise|procura|procure|buscar|busca|busque)\s*/,
                ""
            ).trim();

            if (query) {
                openSite(
                    "https://www.google.com/search?q=" +
                    encodeURIComponent(query),
                    "Vou pesquisar " + query + " no Google."
                );
            } else {
                speak("O que você gostaria que eu pesquisasse?");
            }
        }

        // WIKIPÉDIA
        else if (message.includes("wikipedia")) {

            const query = message.replace("wikipedia", "").trim();

            if (query) {
                openSite(
                    "https://pt.wikipedia.org/wiki/" +
                    encodeURIComponent(query),
                    "Pesquisando na Wikipédia."
                );
            } else {
                speak("O que você gostaria de pesquisar na Wikipédia?");
            }
        }

        // AGRADECIMENTOS
        else if (
            message.includes("obrigado") ||
            message.includes("obrigada") ||
            message.includes("muito obrigado") ||
            message.includes("muito obrigada")
        ) {
            speak("Por nada! Estou sempre à disposição.");
        }

        // IDENTIDADE
        else if (
            message.includes("quem e voce") ||
            message.includes("quem e o jarvis") ||
            message.includes("seu nome")
        ) {
            speak("Eu sou o Jarvis, seu assistente virtual. Estou aqui para ajudar você.");
        }

        // DESPEDIDA
        else if (
            message.includes("tchau") ||
            message.includes("ate logo") ||
            message.includes("ate mais")
        ) {
            speak("Até logo! Foi um prazer conversar com você.");
        }

        // PERGUNTA OU COMANDO NÃO CADASTRADO
        else {
            content.textContent =
                "Vou procurar na internet: " + originalMessage;

            speak("Ainda não sei responder diretamente a essa pergunta. Vou procurar para você no Google.");

            window.open(
                "https://www.google.com/search?q=" +
                encodeURIComponent(originalMessage),
                "_blank"
            );
        }
    }
}

