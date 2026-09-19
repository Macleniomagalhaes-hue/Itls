/*
   IPPLS – Instituto Politécnico Privado Lucrécio dos Santos
   js/main.js

   1. Menu móvel
   2. Cabeçalho e secção atual ao rolar
   3. Animação de entrada (.reveal)
   4. Ano do rodapé
 */
(() => {
  'use strict';

  const cabecalho = document.querySelector('.navegacao');
  const botao = document.getElementById('botao-menu');
  const menu = document.getElementById('menu-principal');
  const overlay = document.getElementById('menu-overlay');
  const ligacoes = menu ? [...menu.querySelectorAll('a')] : [];

  /* ---------- 1. Menu móvel ---------- */

  // Mesmo valor do breakpoint do menu completo em css/styles.css
  const menuCompleto = window.matchMedia('(min-width: 1200px)');

  if (botao && menu) {
    const estaAberto = () => document.body.classList.contains('menu-aberto');

    const abrir = () => {
      document.body.classList.add('menu-aberto');
      botao.setAttribute('aria-expanded', 'true');
      botao.setAttribute('aria-label', 'Fechar menu de navegação');
      ligacoes[0]?.focus();
    };

    const fechar = () => {
      document.body.classList.remove('menu-aberto');
      botao.setAttribute('aria-expanded', 'false');
      botao.setAttribute('aria-label', 'Abrir menu de navegação');
    };

    botao.addEventListener('click', () => (estaAberto() ? fechar() : abrir()));
    overlay?.addEventListener('click', fechar);
    ligacoes.forEach((ligacao) => ligacao.addEventListener('click', fechar));

    document.addEventListener('keydown', (evento) => {
      if (!estaAberto()) return;

      // Esc fecha o menu e devolve o foco ao botão
      if (evento.key === 'Escape') {
        fechar();
        botao.focus();
        return;
      }

      // Com o menu aberto, o Tab circula só entre o botão e as ligações
      if (evento.key === 'Tab') {
        const focaveis = [botao, ...ligacoes];
        const primeiro = focaveis[0];
        const ultimo = focaveis[focaveis.length - 1];

        if (evento.shiftKey && document.activeElement === primeiro) {
          evento.preventDefault();
          ultimo.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
          evento.preventDefault();
          primeiro.focus();
        }
      }
    });

    // Ao passar para o menu completo, garante que o painel fica fechado
    menuCompleto.addEventListener('change', (evento) => {
      if (evento.matches) fechar();
    });
  }

  /* ---------- 2. Cabeçalho e secção atual ao rolar ---------- */

  // Cada ligação do menu emparelhada com a secção a que aponta
  const alvos = ligacoes
    .map((ligacao) => ({ ligacao, secao: document.querySelector(ligacao.hash) }))
    .filter((alvo) => alvo.secao);

  let ligacaoAtual = null;

  const marcarSecaoAtual = () => {
    if (!alvos.length) return;

    // Linha de leitura a 35% da altura do ecrã
    const linha = window.innerHeight * 0.35;
    let atual = alvos[0];

    alvos.forEach((alvo) => {
      if (alvo.secao.getBoundingClientRect().top <= linha) atual = alvo;
    });

    // No fim da página, a última secção do menu fica ativa
    const fimDaPagina =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (fimDaPagina) atual = alvos[alvos.length - 1];

    if (atual.ligacao === ligacaoAtual) return;

    ligacaoAtual?.removeAttribute('aria-current');
    atual.ligacao.setAttribute('aria-current', 'location');
    ligacaoAtual = atual.ligacao;
  };

  const aoRolar = () => {
    cabecalho?.classList.toggle('rolado', window.scrollY > 8);
    marcarSecaoAtual();
  };

  // requestAnimationFrame evita trabalho repetido dentro do mesmo frame
  let agendado = false;
  window.addEventListener(
    'scroll',
    () => {
      if (agendado) return;
      agendado = true;
      requestAnimationFrame(() => {
        agendado = false;
        aoRolar();
      });
    },
    { passive: true }
  );
  window.addEventListener('resize', aoRolar, { passive: true });
  aoRolar();

  /* ---------- 3. Animação de entrada (.reveal) ---------- */

  const itens = document.querySelectorAll('.reveal');

  // Só esconde os elementos se o navegador conseguir voltar a mostrá-los
  if ('IntersectionObserver' in window && itens.length) {
    document.documentElement.classList.add('js');

    const observador = new IntersectionObserver(
      (entradas, obs) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;
          entrada.target.classList.add('visivel');
          obs.unobserve(entrada.target);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    itens.forEach((item) => observador.observe(item));
  }

  /* ---------- 4. Ano do rodapé ---------- */

  document.querySelectorAll('[data-ano]').forEach((elemento) => {
    elemento.textContent = new Date().getFullYear();
  });
})();
