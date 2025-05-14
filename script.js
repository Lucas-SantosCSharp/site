let pedidos = [];

function adicionarPedido() {
  const numeroPedido = document.getElementById('numeroPedido').value.trim();
  const dataPedido = document.getElementById('dataPedido').value;
  const vencimentoPedido = document.getElementById('vencimentoPedido').value;

  if (!numeroPedido || !dataPedido || !vencimentoPedido) {
    alert('Preencha todos os campos!');
    return;
  }

  const pedidoExistente = pedidos.some(p => p.numeroPedido.toLowerCase() === numeroPedido.toLowerCase());

  if (pedidoExistente) {
    alert(`Erro: O pedido número "${numeroPedido}" já foi adicionado.`);
    return;
  }

  pedidos.push({
    numeroPedido,
    dataPedido,
    vencimentoPedido,
    status: 'Pendente',
    dataFinalizacao: null
  });

  document.getElementById('numeroPedido').value = "";
  document.getElementById('dataPedido').value = "";
  document.getElementById('vencimentoPedido').value = "";

  salvarDados();
  atualizarListas();
}

function atualizarListas() {
  const listaPedidos = document.getElementById('listaPedidos');
  const listaFinalizados = document.getElementById('listaFinalizados');
  const filtro = document.getElementById('filtroBusca').value.toLowerCase();

  listaPedidos.innerHTML = "";
  listaFinalizados.innerHTML = "";

  const hoje = new Date().toISOString().split('T')[0];
  let pedidosHoje = 0;
  let pedidosVencidos = 0;

  pedidos.sort((a, b) => new Date(a.vencimentoPedido) - new Date(b.vencimentoPedido));

  pedidos.forEach((pedido, index) => {
    if (pedido.numeroPedido.toLowerCase().includes(filtro)) {
      const li = document.createElement('li');
      li.innerHTML = `Pedido: <strong>${pedido.numeroPedido}</strong> | Data: ${pedido.dataPedido} | Vencimento: ${pedido.vencimentoPedido}`;

      if (filtro && pedido.numeroPedido.toLowerCase() === filtro) {
        li.style.border = "3px solid #4B8DFF";
        li.style.backgroundColor = "#e6f0ff";
        li.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      if (pedido.dataPedido === hoje) pedidosHoje++;
      if (pedido.vencimentoPedido < hoje && pedido.status === 'Pendente') {
        li.classList.add('vencido');
        li.innerHTML += ' (VENCIDO)';
        pedidosVencidos++;
      }

      if (pedido.status === 'Pendente') {
        const btn = document.createElement('button');
        btn.textContent = 'Finalizar';
        btn.className = 'finalizar';
        btn.onclick = () => {
          if (confirm('Deseja realmente finalizar este pedido?')) {
            finalizarPedido(index);
          }
        };
        li.appendChild(btn);
        listaPedidos.appendChild(li);
      } else {
        li.innerHTML += ` | Finalizado em: ${pedido.dataFinalizacao}`;
        listaFinalizados.appendChild(li);
      }
    }
  });

  document.getElementById('pedidosHoje').textContent = pedidosHoje;
  document.getElementById('pedidosVencidos').textContent = pedidosVencidos;

  desenharCalendario();
}

function finalizarPedido(index) {
  const agora = new Date();
  const dataHora = `${agora.toLocaleDateString()} ${agora.toLocaleTimeString()}`;
  pedidos[index].status = 'Finalizado';
  pedidos[index].dataFinalizacao = dataHora;
  salvarDados();
  atualizarListas();
}

function desenharCalendario() {
  const grade = document.getElementById('gradeCalendario');
  const mesSelecionado = document.getElementById('mesSelecionado').value || new Date().toISOString().slice(0, 7);
  const [ano, mes] = mesSelecionado.split('-');
  const primeiroDia = new Date(ano, mes - 1, 1);
  const ultimoDia = new Date(ano, mes, 0);
  const diasNoMes = ultimoDia.getDate();

  grade.innerHTML = "";

  for (let d = 1; d <= diasNoMes; d++) {
    const diaDiv = document.createElement('div');
    diaDiv.className = 'dia';
    diaDiv.textContent = d;
    const dataFormatada = `${d}/${mes}/${ano}`;
    diaDiv.onclick = () => mostrarPedidosDoDia(dataFormatada);

    const temFinalizacao = pedidos.some(p =>
      p.status === 'Finalizado' && p.dataFinalizacao.startsWith(dataFormatada)
    );

    if (temFinalizacao) diaDiv.classList.add('dia-finalizado');

    grade.appendChild(diaDiv);
  }
}

function mostrarPedidosDoDia(dataSelecionada) {
  const historico = document.getElementById('historicoPedidos');
  historico.innerHTML = `<h3>Pedidos finalizados em ${dataSelecionada}:</h3>`;

  const pedidosDoDia = pedidos.filter(p =>
    p.status === 'Finalizado' && p.dataFinalizacao.startsWith(dataSelecionada)
  );

  if (pedidosDoDia.length === 0) {
    historico.innerHTML += "<p>Nenhum pedido finalizado nesse dia.</p>";
  } else {
    const ul = document.createElement('ul');
    pedidosDoDia.forEach(p => {
      const horaFinalizacao = p.dataFinalizacao.split(' ')[1];
      const vencimento = new Date(p.vencimentoPedido);
      const dataFinal = new Date(p.dataFinalizacao.split(' ')[0].split('/').reverse().join('-'));
      const foraDoPrazo = dataFinal > vencimento;

      const li = document.createElement('li');
      li.textContent = `Pedido ${p.numeroPedido} finalizado às ${horaFinalizacao}${foraDoPrazo ? " ⚠️ (FORA do prazo)" : ""}`;
      if (foraDoPrazo) {
        li.style.color = 'red';
        li.style.fontWeight = 'bold';
      }
      ul.appendChild(li);
    });
    historico.appendChild(ul);
  }
}

function salvarDados() {
  localStorage.setItem('pedidos', JSON.stringify(pedidos));
}

window.onload = () => {
  const salvos = localStorage.getItem('pedidos');
  if (salvos) {
    pedidos = JSON.parse(salvos);
  }
  document.getElementById('mesSelecionado').value = new Date().toISOString().slice(0, 7);
  atualizarListas();
};
