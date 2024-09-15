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
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }) // Use 'password' corretamente
        });
        
        const data = await response.json();

        if (data.success) {
            window.location.href = '/pagina_inicial';
        } else {
            document.getElementById('mensagem-erro').innerText = "Acesso Negado, Senha ou e-mail inválido.";
        }
    } catch (error) {
        document.getElementById('mensagem-erro').innerText = 'Erro ao conectar ao servidor';
    }
});

// Botão para criar conta
document.getElementById('criar-conta').addEventListener('click', function () {
    window.location.href = '/criar_conta';
});

// Botão para esqueci senha
document.getElementById('esqueci-senha').addEventListener('click', function () {
    window.location.href = '/esqueci_senha';
});
