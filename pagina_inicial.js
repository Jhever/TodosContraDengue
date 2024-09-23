function toggleMenu() {
    const menu = document.getElementById('settingsMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function viewProfile() {
    // Redireciona para a página de perfil
    window.location.href = 'perfil.html'; // Altere para o caminho correto da sua página de perfil
}

function logout() {
    // Verifica se o usuário está logado
    const token = localStorage.getItem('token'); // ou sessionStorage.getItem('token');
    if (token) {
        // Lógica para sair da conta
        localStorage.removeItem('token');
        fetch('/api/logout', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } })
        .then(response => {
            if (response.ok) {
                alert('Você saiu da conta!');
                } else {
                     alert('Erro ao sair da conta. Tente novamente.');
                 }
                })
            .finally(() => {
            // Redireciona para a página de login
                window.location.href = './index.html'; // Altere para o caminho correto da sua página de login
            });
    } else {
        alert('Você não está logado.');
        window.location.href = './index.html'; // Redireciona mesmo se não houver token
    }
}

function perfil() {
    // Lógica para mostrar o perfil do usuário
    alert('Exibindo perfil!');
}

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

        perguntaLista.innerHTML = ''; // Limpa a lista

        perguntas.forEach(pergunta => {
            const div = document.createElement('div');
            div.textContent = pergunta.perguntas;
            perguntaLista.appendChild(div);
        });
    } catch (err) {
        console.error('Erro ao carregar perguntas', err);
    }
}

// Enviar nova pergunta
document.getElementById('formulario-pergunta').addEventListener('submit', async function (event) {
    event.preventDefault();

    const pergunta = document.getElementById('perguntas').value;

    try {
        const response = await fetch('http://localhost:3000/perguntas', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pergunta })
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
