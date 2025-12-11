// Login dos funcionários de estoque
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value.trim();
        
        // Elemento para exibir mensagens (criado dinamicamente se não existir)
        let mensagemDiv = document.getElementById('mensagem-login');
        if (!mensagemDiv) {
            mensagemDiv = document.createElement('div');
            mensagemDiv.id = 'mensagem-login';
            mensagemDiv.style.marginTop = '15px';
            mensagemDiv.style.textAlign = 'center';
            mensagemDiv.style.fontWeight = 'bold';
            mensagemDiv.style.padding = '10px';
            mensagemDiv.style.borderRadius = '4px';
            loginForm.appendChild(mensagemDiv);
        }
        
        // Validação básica
        if (!email || !senha) {
            mensagemDiv.innerText = "Por favor, preencha todos os campos!";
            mensagemDiv.style.color = "red";
            return;
        }
        
        // Consulta no Firebase
        database.ref('FuncionariosEstoque').once('value')
            .then(snapshot => {
                const funcionarios = snapshot.val();
                let funcionarioEncontrado = null;
                let funcionarioId = null;
                
                // Procura pelo funcionário com email e senha correspondentes
                if (funcionarios) {
                    for (let cpf in funcionarios) {
                        const funcionario = funcionarios[cpf];
                        if (funcionario.email === email && funcionario.senha === senha) {
                            funcionarioEncontrado = funcionario;
                            funcionarioId = cpf;
                            break;
                        }
                    }
                }
                
                if (funcionarioEncontrado) {
                    // Login bem-sucedido
                    mensagemDiv.innerText = "Login realizado com sucesso! Redirecionando...";
                    mensagemDiv.style.color = "#2F3A56";
                    
                    // Salva dados do funcionário no localStorage para usar em outras páginas
                    localStorage.setItem('usuarioLogado', JSON.stringify({
                        nome: funcionarioEncontrado.nome,
                        cpf: funcionarioId,
                        email: funcionarioEncontrado.email,
                        area: funcionarioEncontrado.area,
                        idFuncionario: funcionarioEncontrado.idFuncionario,
                        turno: funcionarioEncontrado.turno,
                        tipo: 'estoque'
                    }));
                    
                    // Redireciona após 2 segundos
                    setTimeout(() => {
                        window.location.href = "PAGINAINICIAL.html"; 
                    }, 2000);
                    
                } else {
                    // Login falhou
                    mensagemDiv.innerText = "Email ou senha incorretos! Verifique suas credenciais.";
                    mensagemDiv.style.color = "red";
                }
            })
            .catch(error => {
                mensagemDiv.innerText = "Erro ao conectar com o banco de dados: " + error.message;
                mensagemDiv.style.color = "red";
                console.error("Erro no login:", error);
            });
    });

});
    
// Função para recuperação de senha (simplificada)
function recuperarSenha(email) {
    database.ref('FuncionariosEstoque').once('value')
        .then(snapshot => {
            const funcionarios = snapshot.val();
            let funcionarioEncontrado = null;
            
            if (funcionarios) {
                for (let cpf in funcionarios) {
                    const funcionario = funcionarios[cpf];
                    if (funcionario.email === email.trim()) {
                        funcionarioEncontrado = funcionario;
                        break;
                    }
                }
            }
            
            if (funcionarioEncontrado) {
                alert(`Sua senha é: ${funcionarioEncontrado.senha}\n\nPor motivos de segurança, recomendamos que você altere sua senha após o login.`);
            } else {
                alert("Email não encontrado no sistema!");
            }
        })
        .catch(error => {
            alert("Erro ao buscar informações: " + error.message);
        });
}

// Verifica se o usuário já está logado ao carregar a página
function verificarLogin() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (usuarioLogado) {
        const usuario = JSON.parse(usuarioLogado);
        if (usuario.tipo === 'estoque') {
            // Se já estiver logado, redireciona diretamente
            window.location.href = "PAGINAINICIAL.html";
        }
    }
}

// Chama a verificação ao carregar
verificarLogin();