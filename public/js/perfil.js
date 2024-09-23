document.addEventListener('DOMContentLoaded', async () => {
    console.log("Página de perfil carregada."); 

    const perfilForm = document.getElementById('form-perfil');

    try {
        const response = await fetch('http://localhost:3000/dados-usuario');
        const dados = await response.json();
        
        if (response.ok) {
            document.getElementById('email').value = dados.email;
            document.getElementById('telefone').value = dados.telefone;
            document.getElementById('sexo').value = dados.sexo;
            document.getElementById('cidade').value = dados.cidade;
            document.getElementById('bairro').value = dados.bairro;
            document.getElementById('rua').value = dados.rua;
            document.getElementById('numero').value = dados.numero;
            document.getElementById('tipoUsuario').value = dados.tipoUsuario;
            document.getElementById('nome').value = dados.nome;
        } else {
            document.getElementById('mensagem-erro').innerText = dados.message || "Erro ao buscar dados.";
        }
    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
    }

    // Editar perfil
    document.getElementById('editar-perfil').addEventListener('click', () => {
        const fields = perfilForm.querySelectorAll('input');
        fields.forEach(field => field.disabled = !field.disabled);
    });

    // Trocar senha
    document.getElementById('trocar-senha').addEventListener('click', async () => {
        const novaSenha = prompt("Digite sua nova senha:");
        if (novaSenha) {
            try {
                const response = await fetch('http://localhost:3000/trocar-senha', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ novaSenha })
                });
                const data = await response.json();
                alert(data.message);
            } catch (error) {
                console.error('Erro ao trocar senha:', error);
            }
        }
    });

    // Upload da foto de perfil
    document.getElementById('foto').addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('foto', file);
            
            try {
                const response = await fetch('http://localhost:3000/upload-foto', {
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

    // Enviar dados atualizados
    perfilForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Previne o envio padrão do formulário

        const formData = new FormData(perfilForm);
        try {
            const response = await fetch('http://localhost:3000/atualizar-perfil', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                alert('Perfil atualizado com sucesso!');
            } else {
                alert(data.message || 'Erro ao atualizar o perfil.');
            }
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            alert('Erro ao conectar ao servidor.');
        }
    });
});
