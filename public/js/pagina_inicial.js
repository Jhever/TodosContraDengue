// Carregar perguntas
async function loadPerguntas() {
    try {
        const response = await fetch('http://localhost:3000/perguntas', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ perguntas })
        });        
        const perguntas = await response.json();
        const perguntaLista = document.getElementById('perguntas-lista');

        perguntasLista.innerHTML = ''; // Limpa a lista

        perguntsa.forEach(perguntas => {
            const div = document.createElement('div');
            div.textContent = perguntas.perguntas;
            perguntasLista.appendChild(div);
        });
    } catch (err) {
        console.error('Erro ao carregar perguntas', err);
    }
}

// Enviar nova pergunta
document.getElementById('formulario-perguntas').addEventListener('submit', async function (event) {
    event.preventDefault();

    const perguntas = document.getElementById('perguntas').value;

    try {
        const response = await fetch('http://localhost:3000/perguntas', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ perguntas })
        });

        if (response.ok) {
            loadPerguntas(); // Atualizar a lista de perguntas
        } else {
            console.error('Erro ao enviar a perguntas');
        }
    } catch (err) {
        console.error('Erro ao conectar ao servidor', err);
    }
});

// Carregar perguntas ao iniciar
loadPerguntas();
