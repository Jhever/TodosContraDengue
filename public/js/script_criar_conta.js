document.getElementById('formulario-criar-conta').addEventListener('submit', async function (event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const telefone = document.getElementById('telefone').value;
    const sexo = document.getElementById('sexo').value;
    const cidade = document.getElementById('cidade').value;
    const bairro = document.getElementById('bairro').value;
    const rua = document.getElementById('rua').value;
    const numero = document.getElementById('numero').value; // Corrigido de numero_casa para numero
    const tipoUsuario = document.getElementById('tipoUsuario').value; // Corrigido de tipo_usuario para tipoUsuario

    try {
        const response = await fetch('http://localhost:3000/criar-conta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email, senha, telefone, sexo, cidade, bairro, rua, numero, tipoUsuario
            })
        });

        const mensagem = await response.text();
        document.getElementById('mensagem').textContent = mensagem;

        if (response.ok) {
            // Redirecionar para a página de login ou outra página de sucesso
            window.location.href = '/login';
        }
    } catch (error) {
        document.getElementById('mensagem').textContent = 'Erro ao criar conta';
    }
});
