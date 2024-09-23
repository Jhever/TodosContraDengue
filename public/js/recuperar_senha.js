document.addEventListener('DOMContentLoaded', () => {
    const recuperarSenhaForm = document.getElementById('recuperar-senha-form');
    if (recuperarSenhaForm) {
        recuperarSenhaForm.addEventListener('submit', enviarNovaSenha);
    }
});

// Função para enviar nova senha
async function enviarNovaSenha(event) {
    event.preventDefault(); // Previne o envio padrão do formulário

    async function enviarNovaSenha() {
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
    
        try {
            const response = await fetch('http://localhost:3000/usuarios/recuperar-senha', {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email }),
            });
    
            const data = await response.json();
            alert(data.message);
        } catch (error) {
            console.error('Erro ao enviar nova senha:', error);
            alert('Erro ao enviar nova senha.');
        }
    }
}
    