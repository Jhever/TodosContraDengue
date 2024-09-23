document.getElementById('formulario-criar-conta').addEventListener('submit', async function (event) {
    event.preventDefault();

    // Obter valores dos campos
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const senhaConfirmacao = document.getElementById('senhaConfirmacao').value;
    const telefone = document.getElementById('telefone').value;
    const sexo = document.querySelector('input[name="genero"]:checked')?.value;
    const cidade = document.getElementById('cidade').value;
    const bairro = document.getElementById('bairro').value;
    const rua = document.getElementById('rua').value;
    const numero = document.getElementById('numero').value;
    const tipoUsuario = document.getElementById('tipoUsuario').value;
    const nome = document.getElementById('nome').value;

    // Verificar se a senha e a confirmação de senha coincidem
    if (senha !== senhaConfirmacao) {
        document.getElementById('mensagem').textContent = 'As senhas não coincidem!';
        return;
    }

    try {
        // Enviar requisição ao servidor para criar a conta
        const response = await fetch('http://localhost:3000/criar-conta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome, email, senha, telefone, sexo, cidade, bairro, rua, numero, tipoUsuario
            })
        });

        const mensagem = await response.text();
        document.getElementById('mensagem').textContent = mensagem;

        if (response.ok) {
            // Redirecionar para a página de login
            window.location.href = './index.html';
        }
        
    } catch (err) {
        console.error('Erro ao criar conta:', err);
        document.getElementById('mensagem').textContent = 'Erro ao criar conta. Tente novamente.';
    }
});
