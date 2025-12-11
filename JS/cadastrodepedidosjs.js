// Envia dados ao Realtime Database
document.getElementById('form').addEventListener('submit', function(e) {
    e.preventDefault();

    const pedido = {
        nomeProduto: document.getElementById('produto').value,
        codigoProduto: document.getElementById('codigo').value,
        categoria: document.getElementById('categoria').value,
        marcaFabricante: document.getElementById('marca').value,
        faixaEtaria: document.getElementById('faixa-etaria').value,
        precoVenda: document.getElementById('preco').value,
        qtdEstoque: document.getElementById('estoque').value,
        material: document.getElementById('material').value,
        descricao: document.getElementById('descricao').value
    };

    const pedidoId = document.getElementById('produtoId').value;
    const mensagem = document.getElementById('mensagem');

    if (pedidoId) {
        // Atualização
        database.ref('Pedidos/' + pedidoId).update(pedido)
            .then(() => {
                mensagem.innerText = "Pedido atualizado com sucesso!";
                mensagem.style.color = "#2F3A56";
                document.getElementById('form').reset();
                document.getElementById('btnEnviar').innerText = "Cadastrar Produto";
                document.getElementById('btnCancelarEdicao').style.display = "none";
                document.getElementById('produtoId').value = "";
                carregarListaPedidos();
            })
            .catch(error => {
                mensagem.innerText = "Erro ao atualizar: " + error.message;
                mensagem.style.color = "red";
            });
    } else {
        // Cadastro novo
        database.ref('Pedidos').push(pedido)
            .then(() => {
                mensagem.innerText = "Pedido cadastrado com sucesso!";
                mensagem.style.color = "#2F3A56";
                document.getElementById('form').reset();
                carregarListaPedidos();
            })
            .catch(error => {
                mensagem.innerText = "Erro ao cadastrar: " + error.message;
                mensagem.style.color = "red";
            });
    }
});

// Listar pedidos
document.getElementById('btnConsultar').addEventListener('click', function() {
    carregarListaPedidos();
});

// Função para carregar lista de pedidos
function carregarListaPedidos() {
    const lista = document.getElementById('listaProdutos');
    lista.innerHTML = "<p>Carregando...</p>";

    const ref = database.ref('Pedidos');
    ref.once('value')
        .then(snapshot => {
            const dados = snapshot.val();
            lista.innerHTML = "";
            
            if (!dados) {
                lista.innerHTML = "<p>Nenhum pedido cadastrado.</p>";
                return;
            }

            for (let id in dados) {
                const p = dados[id];
                const card = document.createElement('div');
                card.className = "produto-card";
                card.innerHTML = `
                    <strong>Nome:</strong> ${p.nomeProduto || 'N/A'}<br>
                    <strong>Código:</strong> ${p.codigoProduto || 'N/A'}<br>
                    <strong>Categoria:</strong> ${p.categoria || 'N/A'}<br>
                    <strong>Marca:</strong> ${p.marcaFabricante || 'N/A'}<br>
                    <strong>Faixa Etária:</strong> ${p.faixaEtaria || 'N/A'}<br>
                    <strong>Preço:</strong> R$ ${p.precoVenda || 'N/A'}<br>
                    <strong>Estoque:</strong> ${p.qtdEstoque || 'N/A'}<br>
                    <strong>Material:</strong> ${p.material || 'N/A'}<br>
                    <strong>Descrição:</strong> ${p.descricao || 'N/A'}<br>
                    <button onclick="editarPedido('${id}')">Editar</button>
                    <button onclick="excluirPedido('${id}')">Excluir</button>
                `;
                lista.appendChild(card);
            }
        })
        .catch(error => {
            lista.innerHTML = "<p>Erro ao carregar dados: " + error.message + "</p>";
        });
}

// Editar pedido
function editarPedido(id) {
    database.ref('Pedidos/' + id).once('value')
        .then(snapshot => {
            const p = snapshot.val();
            if (p) {
                document.getElementById('produtoId').value = id;
                document.getElementById('produto').value = p.nomeProduto || '';
                document.getElementById('codigo').value = p.codigoProduto || '';
                document.getElementById('categoria').value = p.categoria || '';
                document.getElementById('marca').value = p.marcaFabricante || '';
                document.getElementById('faixa-etaria').value = p.faixaEtaria || '';
                document.getElementById('preco').value = p.precoVenda || '';
                document.getElementById('estoque').value = p.qtdEstoque || '';
                document.getElementById('material').value = p.material || '';
                document.getElementById('descricao').value = p.descricao || '';
                
                document.getElementById('btnEnviar').innerText = "Atualizar Pedido";
                document.getElementById('btnCancelarEdicao').style.display = "inline";
                document.getElementById('mensagem').innerText = "Editando pedido: " + (p.nomeProduto || "Produto");
                document.getElementById('mensagem').style.color = "#2F3A56";
                
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        })
        .catch(error => {
            console.error("Erro ao carregar pedido:", error);
        });
}

// Excluir pedido
function excluirPedido(id) {
    if (confirm('Tem certeza que deseja excluir este pedido?')) {
        database.ref('Pedidos/' + id).remove()
            .then(() => {
                document.getElementById('mensagem').innerText = "Pedido excluído com sucesso!";
                document.getElementById('mensagem').style.color = "#2F3A56";
                carregarListaPedidos();
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
    document.getElementById('produtoId').value = "";
    document.getElementById('btnEnviar').innerText = "Cadastrar Produto";
    document.getElementById('btnCancelarEdicao').style.display = "none";
    document.getElementById('mensagem').innerText = "Edição cancelada.";
    document.getElementById('mensagem').style.color = "#2F3A56";
});

