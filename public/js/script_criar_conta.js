document.getElementById('formulario-criar-conta').addEventListener('submit', async function (event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const telefone = document.getElementById('telefone').value;
    const sexo = document.getElementById('sexo').value;
    const cidade = document.getElementById('cidade').value;
    const bairro = document.getElementById('bairro').value;
    const rua = document.getElementById('rua').value;
    const numero = document.getElementById('numero').value;
    const tipoUsuario = document.getElementById('tipoUsuario').value; 

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
            window.location.href = '/index.html';  // Caminho relativo ao servidor
        }
        
    } catch (err) {
        console.error('Erro ao criar conta:', err);
        console.error(err.stack); 
        res.status(500).send('Erro ao criar conta.');
    }
});
