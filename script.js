document.getElementById('formulario-login').addEventListener('submit', async function (event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Validação de e-mail e senha
    if (email === "" || password === "") {
        document.getElementById('mensagem-erro').innerText = "E-mail e senha são obrigatórios.";
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha: password })
        });
        
        const data = await response.json();

        if (response.ok) { // Verifica se a resposta foi bem-sucedida
            window.location.href = './pagina_inicial.html';
        } else {
            document.getElementById('mensagem-erro').innerText = data.message || "Acesso Negado, Senha ou e-mail inválido.";
        }
    } catch (error) {
        document.getElementById('mensagem-erro').innerText = 'Erro ao conectar ao servidor';
    }
});

//esconder a senha
function show() {
    var p = document.getElementById('password');
    p.setAttribute('type', 'text');
}

function hide() {
    var p = document.getElementById('password');
    p.setAttribute('type', 'password');
}

var pwShown = 0;

document.getElementById("eye").addEventListener("click", function () {
    if (pwShown == 0) {
        pwShown = 1;
        show();
    } else {
        pwShown = 0;
        hide();
    }
}, false);

// Botão para criar conta
document.getElementById('criar-conta').addEventListener('click', function () {
    window.location.href = './criar_conta.html';
});

// Botão para esqueci senha
document.getElementById('esqueci-senha').addEventListener('click', function () {
    window.location.href = './esqueci_senha.html';
});
