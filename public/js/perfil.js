document.addEventListener('DOMContentLoaded', () => {
    const botaoPerfil = document.getElementById('botao-perfil');
    if (botaoPerfil) {
        botaoPerfil.addEventListener('click', botao_perfil);
    }

    carregarDadosUsuario();
});

// Função para exibir a seção de perfil
function botao_perfil() {
    window.location.href = 'perfil.html'; // Redireciona para a página de perfil
}

// Função para buscar dados do usuário
async function carregarDadosUsuario() {
    try {
        const response = await fetch('http://localhost:3000/usuarios/dados-usuario');

        if (!response.ok) {
            throw new Error(`Erro: ${response.status} ${response.statusText}`);
        }
        const dados = await response.json();

        if (response.ok) {
            document.getElementById('email').value = dados.email;
            document.getElementById('telefone').value = dados.telefone;
            document.getElementById('sexo').value = dados.sexo;
            document.getElementById('cidade').value = dados.cidade;
            document.getElementById('bairro').value = dados.bairro;
            document.getElementById('rua').value = dados.rua;
            document.getElementById('numero').value = dados.numero;
            document.getElementById('tipoUsuario').value = dados.tipoUsuario; // Não editável
            document.getElementById('nome').value = dados.nome;

            // Desabilitar todos os campos, exceto 'tipoUsuario'
            const fields = document.querySelectorAll('input');
            fields.forEach(field => {
                if (field.id !== 'tipoUsuario') {
                    field.disabled = true;
                }
            });
        } else {
            document.getElementById('mensagem-erro').innerText = dados.message || "Erro ao buscar dados.";
        }
    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
    }
}

// Editar perfil
const editarPerfilBtn = document.getElementById('editar-perfil');
if (editarPerfilBtn) {
    editarPerfilBtn.addEventListener('click', () => {
        const fields = document.querySelectorAll('input');
        fields.forEach(field => {
            if (field.id !== 'tipoUsuario') {
                field.disabled = !field.disabled;
            }
        });
    });
}

// Trocar senha
const trocarSenhaBtn = document.getElementById('trocar-senha');
if (trocarSenhaBtn) {
    trocarSenhaBtn.addEventListener('click', async () => {
        const senhaAntiga = prompt("Digite sua senha antiga:");
        if (senhaAntiga) {
            const novaSenha = prompt("Digite sua nova senha:");
            const confirmarSenha = prompt("Confirme sua nova senha:");

            if (novaSenha === confirmarSenha) {
                try {
                    const response = await fetch('http://localhost:3000/usuarios/trocar-senha', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ senhaAntiga, novaSenha })
                    });
                    const data = await response.json();
                    alert(data.message);
                } catch (error) {
                    console.error('Erro ao trocar senha:', error);
                }
            } else {
                alert("As senhas não coincidem.");
            }
        }
    });
}

// Upload da foto de perfil
const fotoInput = document.getElementById('foto');
if (fotoInput) {
    fotoInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('foto', file);
            
            try {
                const response = await fetch('http://localhost:3000/usuarios/upload-foto', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                alert(data.message);
            } catch (error) {
                console.error('Erro ao fazer upload da foto:', error);
                alert('Erro ao fazer upload da foto.');
            }
        }
    });
}

// Enviar dados atualizados
const perfilForm = document.getElementById('perfil-form'); // Certifique-se de que o ID do formulário está correto
if (perfilForm) {
    perfilForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Previne o envio padrão do formulário

        const formData = new FormData(perfilForm);
        try {
            const response = await fetch('http://localhost:3000/usuarios/atualizar-perfil', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                alert('Perfil atualizado com sucesso!');
                await carregarDadosUsuario(); // Recarrega os dados atualizados
            } else {
                alert(data.message || 'Erro ao atualizar o perfil.');
            }
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            alert('Erro ao conectar ao servidor.');
        }
    });
}
