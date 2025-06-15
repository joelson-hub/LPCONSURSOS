document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for table of contents
    document.querySelectorAll('.table-of-contents a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetElement = document.querySelector(this.getAttribute('href'));
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Collapsible sections for tips/macetes
    document.querySelectorAll('.collapsible-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            header.classList.toggle('active');
            if (content.style.display === 'block') {
                content.style.display = 'none';
            } else {
                content.style.display = 'block';
            }
        });
    });

    // Gemini API integration for Text Reviewer
    const textInput = document.getElementById('text-input');
    const reviewButton = document.getElementById('review-button');
    const loadingIndicator = document.getElementById('loading-indicator');
    const responseArea = document.getElementById('response-area');
    const reviewedText = document.getElementById('reviewed-text');

    reviewButton.addEventListener('click', async () => {
        const inputText = textInput.value.trim();

        if (inputText === '') {
            alert('Por favor, insira um texto para rever.');
            return;
        }

        loadingIndicator.style.display = 'block';
        responseArea.style.display = 'none';
        reviewedText.textContent = ''; // Clear previous reviewed text

        try {
            // Prompt for the LLM
            const prompt = `Revise o seguinte texto em português de Portugal para corrigir erros gramaticais, melhorar a clareza e a fluidez. Retorne apenas o texto revisado.:\n\n"${inputText}"`;

            let chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });

            const payload = { contents: chatHistory };
            const apiKey = "AIzaSyAd8MFfaVlrBYrIX01LatFeHSnEuUznUIY"; // Replace with your actual Gemini API Key
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            console.log('Full Gemini response for Reviewer:', result); // Log for debugging

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                reviewedText.textContent = text;
                responseArea.style.display = 'block';
            } else {
                // If the expected structure is not found, check for promptFeedback (safety filters)
                if (result.promptFeedback && result.promptFeedback.safetyRatings && result.promptFeedback.safetyRatings.length > 0) {
                    const blockedReason = result.promptFeedback.safetyRatings.map(rating => `${rating.category}: ${rating.probability}`).join(', ');
                    reviewedText.textContent = `A revisão não pôde ser gerada devido a filtros de segurança. Razões: ${blockedReason}`;
                } else {
                    reviewedText.textContent = 'Não foi possível obter uma revisão. A estrutura da resposta da API Gemini foi inesperada.';
                }
                responseArea.style.display = 'block';
                console.error('Unexpected Gemini response structure for Reviewer:', result);
            }
        } catch (error) {
            reviewedText.textContent = 'Ocorreu um erro ao rever o texto. Verifique a sua ligação à internet ou tente novamente. Detalhes do erro na consola.';
            responseArea.style.display = 'block';
            console.error('Error calling Gemini API for Reviewer:', error);
        } finally {
            loadingIndicator.style.display = 'none';
        }
    });

    // Gemini API integration for Concept Explorer
    const conceptInput = document.getElementById('concept-input');
    const exploreConceptButton = document.getElementById('explore-concept-button');
    const conceptLoadingIndicator = document.getElementById('concept-loading-indicator');
    const conceptResponseArea = document.getElementById('concept-response-area');
    const conceptExplanation = document.getElementById('concept-explanation');

    exploreConceptButton.addEventListener('click', async () => {
        const inputConcept = conceptInput.value.trim();

        if (inputConcept === '') {
            alert('Por favor, insira um conceito gramatical para explorar.');
            return;
        }

        conceptLoadingIndicator.style.display = 'block';
        conceptResponseArea.style.display = 'none';
        conceptExplanation.textContent = '';

        try {
            const prompt = `Forneça uma explicação clara e concisa sobre o conceito gramatical "${inputConcept}" em português de Portugal. Inclua pelo menos dois exemplos práticos para ilustrar o conceito. Formate a resposta de forma que a explicação e os exemplos sejam facilmente distinguíveis.`;

            let chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });

            const payload = { contents: chatHistory };
            const apiKey = "AIzaSyAd8MFfaVlrBYrIX01LatFeHSnEuUznUIY"; // Replace with your actual Gemini API Key
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            console.log('Full Gemini response for Explorer:', result); // Log for debugging

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                conceptExplanation.innerHTML = text.replace(/\n/g, '<br>'); // Replace newlines with <br> for HTML display
                conceptResponseArea.style.display = 'block';
            } else {
                // If the expected structure is not found, check for promptFeedback (safety filters)
                if (result.promptFeedback && result.promptFeedback.safetyRatings && result.promptFeedback.safetyRatings.length > 0) {
                    const blockedReason = result.promptFeedback.safetyRatings.map(rating => `${rating.category}: ${rating.probability}`).join(', ');
                    conceptExplanation.textContent = `A explicação não pôde ser gerada devido a filtros de segurança. Razões: ${blockedReason}`;
                } else {
                    conceptExplanation.textContent = 'Não foi possível obter uma explicação para este conceito. A estrutura da resposta da API Gemini foi inesperada.';
                }
                conceptResponseArea.style.display = 'block';
                console.error('Unexpected Gemini response structure for Explorer:', result);
            }
        } catch (error) {
            conceptExplanation.textContent = 'Ocorreu um erro ao explorar o conceito. Verifique a sua ligação à internet ou tente novamente. Detalhes do erro na consola.';
            conceptResponseArea.style.display = 'block';
            console.error('Error calling Gemini API for Explorer:', error);
        } finally {
            conceptLoadingIndicator.style.display = 'none';
        }
    });
});
