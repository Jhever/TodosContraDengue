function toggleMenu() {
    const menu = document.getElementById('config-menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function botao_perfil() {
    // Redireciona para a página de perfil
    window.location.href = 'perfil.html'; // Caminho correto da sua página de perfil
}

function logout() {
    // Verifica se o usuário está logado
    const token = localStorage.getItem('token'); // ou sessionStorage.getItem('token');
    if (token) {
        // Lógica para sair da conta
        localStorage.removeItem('token');
        fetch('/api/logout', { 
            method: 'POST', 
            headers: { 
                'Authorization': `Bearer ${token}` 
            }
        })
        .then(response => {
            if (response.ok) {
                alert('Você saiu da conta!');
            } else {
                alert('Erro ao sair da conta. Tente novamente.');
            }
        })
        .finally(() => {
            // Redireciona para a página de login
            window.location.href = './index.html'; // Caminho correto da sua página de login
        });
    } else {
        alert('Você não está logado.');
        window.location.href = './index.html'; // Redireciona mesmo se não houver token
    }
}

// Carregar perguntas
async function loadPerguntas() {
    try {
        const response = await fetch('http://localhost:3000/perguntas', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const perguntas = await response.json();
        const perguntaLista = document.getElementById('perguntas-lista');

        perguntaLista.innerHTML = ''; // Limpa a lista

        perguntas.forEach(pergunta => {
            const div = document.createElement('div');
            div.textContent = pergunta.titulo; // Certifique-se de que isso corresponda à estrutura do seu objeto de perguntas
            perguntaLista.appendChild(div);
        });
    } catch (err) {
        console.error('Erro ao carregar perguntas', err);
    }
}

// Enviar nova pergunta
document.getElementById('formulario-perguntas').addEventListener('submit', async function (event) {
    event.preventDefault();

    const perguntaTitulo = document.getElementById('pergunta-titulo').value; // Atualize para o campo correto
    const perguntaConteudo = document.getElementById('pergunta-conteudo').value; // Atualize para o campo correto

    try {
        const response = await fetch('http://localhost:3000/perguntas', {
            method: 'POST', // Mude para POST se você estiver criando uma nova pergunta
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo: perguntaTitulo, conteudo: perguntaConteudo })
        });

        if (response.ok) {
            alert('Pergunta enviada com sucesso!');
            loadPerguntas(); // Atualiza a lista de perguntas
        } else {
            console.error('Erro ao enviar a pergunta');
            alert('Erro ao enviar a pergunta. Tente novamente.');
        }
    } catch (err) {
        console.error('Erro ao conectar ao servidor', err);
        alert('Erro ao conectar ao servidor. Tente novamente.');
    }
});

// Carregar perguntas ao iniciar
loadPerguntas();
