// Envia dados ao Realtime Database
document.getElementById('form').addEventListener('submit', function(e) {
    e.preventDefault();

    const cpf = document.getElementById('cpf').value.trim();
    
    if (!cpf) {
        document.getElementById('mensagem').innerText = "Erro: CPF do funcionário é obrigatório!";
        document.getElementById('mensagem').style.color = "red";
        return;
    }

    const funcionario = {
        nome: document.getElementById('nome').value,
        cpf: cpf,
        area: document.getElementById('categoria').value,
        idFuncionario: document.getElementById('id').value,
        email: document.getElementById('email').value,
        senha: document.getElementById('senha').value,
        turno: document.getElementById('turno').value,
        dataCadastro: new Date().toISOString()
    };

    // VERIFICA se o campo hidden existe, se não existir, cria
    if (!document.getElementById('funcionarioId')) {
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.id = 'funcionarioId';
        hiddenInput.name = 'funcionarioId';
        document.getElementById('form').appendChild(hiddenInput);
    }
    
    const funcionarioId = document.getElementById('funcionarioId').value;
    const mensagem = document.getElementById('mensagem');

    if (funcionarioId) {
        // Atualização
        database.ref('FuncionariosProducao/' + funcionarioId).update(funcionario)
            .then(() => {
                mensagem.innerText = "Funcionário atualizado com sucesso!";
                mensagem.style.color = "#2F3A56";
                document.getElementById('form').reset();
                document.getElementById('btnEnviar').innerText = "Cadastrar Funcionário";
                document.getElementById('btnCancelarEdicao').style.display = "none";
                document.getElementById('funcionarioId').value = "";
                carregarListaFuncionarios();
            })
            .catch(error => {
                mensagem.innerText = "Erro ao atualizar: " + error.message;
                mensagem.style.color = "red";
            });
    } else {
        // Cadastro novo - usa o CPF como ID
        database.ref('FuncionariosProducao/' + cpf).set(funcionario)
            .then(() => {
                mensagem.innerText = "Funcionário de produção cadastrado com sucesso! CPF: " + cpf;
                mensagem.style.color = "#2F3A56";
                document.getElementById('form').reset();
                carregarListaFuncionarios();
            })
            .catch(error => {
                mensagem.innerText = "Erro ao cadastrar: " + error.message;
                mensagem.style.color = "red";
            });
    }
});

// Listar funcionários
document.getElementById('btnConsultar').addEventListener('click', function() {
    carregarListaFuncionarios();
});

// Função para carregar lista de funcionários
function carregarListaFuncionarios() {
    const lista = document.getElementById('listaFuncionarios');
    lista.style.display = 'block'; // MOSTRA a lista
    lista.innerHTML = "<p>Carregando...</p>";

    const ref = database.ref('FuncionariosProducao');
    ref.once('value')
        .then(snapshot => {
            const dados = snapshot.val();
            lista.innerHTML = "";
            
            if (!dados) {
                lista.innerHTML = "<p>Nenhum funcionário de produção cadastrado.</p>";
                return;
            }

            for (let cpf in dados) {
                const f = dados[cpf];
                const card = document.createElement('div');
                card.className = "funcionario-card";
                card.innerHTML = `
                    <strong>CPF:</strong> ${cpf}<br>
                    <strong>Nome:</strong> ${f.nome || 'N/A'}<br>
                    <strong>ID Funcionário:</strong> ${f.idFuncionario || 'N/A'}<br>
                    <strong>Área:</strong> ${f.area || 'N/A'}<br>
                    <strong>Email:</strong> ${f.email || 'N/A'}<br>
                    <strong>Turno:</strong> ${f.turno || 'N/A'}<br>
                    <strong>Data Cadastro:</strong> ${new Date(f.dataCadastro).toLocaleDateString() || 'N/A'}<br>
                    <button onclick="editarFuncionario('${cpf}')">Editar</button>
                    <button onclick="excluirFuncionario('${cpf}')">Excluir</button>
                `;
                lista.appendChild(card);
            }
        })
        .catch(error => {
            lista.innerHTML = "<p>Erro ao carregar dados: " + error.message + "</p>";
        });
}

// Editar funcionário
function editarFuncionario(cpf) {
    database.ref('FuncionariosProducao/' + cpf).once('value')
        .then(snapshot => {
            const f = snapshot.val();
            if (f) {
                // Cria campo hidden se não existir
                if (!document.getElementById('funcionarioId')) {
                    const hiddenInput = document.createElement('input');
                    hiddenInput.type = 'hidden';
                    hiddenInput.id = 'funcionarioId';
                    hiddenInput.name = 'funcionarioId';
                    document.getElementById('form').appendChild(hiddenInput);
                }
                
                document.getElementById('funcionarioId').value = cpf;
                document.getElementById('nome').value = f.nome || '';
                document.getElementById('cpf').value = f.cpf || cpf;
                document.getElementById('categoria').value = f.area || '';
                document.getElementById('id').value = f.idFuncionario || '';
                document.getElementById('email').value = f.email || '';
                document.getElementById('senha').value = f.senha || '';
                document.getElementById('turno').value = f.turno || '';
                
                document.getElementById('btnEnviar').innerText = "Atualizar Funcionário";
                document.getElementById('btnCancelarEdicao').style.display = "inline";
                document.getElementById('mensagem').innerText = "Editando funcionário: " + (f.nome || "Funcionário");
                document.getElementById('mensagem').style.color = "#2F3A56";
                
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        })
        .catch(error => {
            console.error("Erro ao carregar funcionário:", error);
        });
}

// Excluir funcionário
function excluirFuncionario(cpf) {
    if (confirm('Tem certeza que deseja excluir o funcionário CPF ' + cpf + '?')) {
        database.ref('FuncionariosProducao/' + cpf).remove()
            .then(() => {
                document.getElementById('mensagem').innerText = "Funcionário " + cpf + " excluído com sucesso!";
                document.getElementById('mensagem').style.color = "#2F3A56";
                carregarListaFuncionarios();
            })
            .catch(error => {
                document.getElementById('mensagem').innerText = "Erro ao excluir: " + error.message;
                document.getElementById('mensagem').style.color = "red";
            });
    }
}

// Cancelar edição
document.getElementById('btnCancelarEdicao').addEventListener('click', function() {
    document.getElementById('form').reset();
    if (document.getElementById('funcionarioId')) {
        document.getElementById('funcionarioId').value = "";
    }
    document.getElementById('btnEnviar').innerText = "Cadastrar Funcionário";
    document.getElementById('btnCancelarEdicao').style.display = "none";
    document.getElementById('mensagem').innerText = "Edição cancelada.";
    document.getElementById('mensagem').style.color = "#2F3A56";
});

// Adicionar botão de envio dinâmico
window.addEventListener('DOMContentLoaded', function() {
    // Verifica se o botão de envio já existe
    if (!document.getElementById('btnEnviar')) {
        const submitBtn = document.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.id = 'btnEnviar';
        }
    }
});