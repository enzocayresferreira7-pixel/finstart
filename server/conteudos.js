// Resumos educativos originais com referências oficiais para aprofundamento.
export const artigos = [
  {
    categoria: "Orçamento",
    nivel: "basico",
    titulo: "Comece pelo que entra e pelo que sai",
    texto:
      "Orçamento é um registro do dinheiro que entra e das despesas do período. Separe compromissos essenciais, escolhas pessoais e valores reservados para objetivos. Compare o planejado com o que realmente aconteceu.\n\nNa FinStart, 50/30/20 é um exemplo didático de divisão, não uma regra universal ou uma recomendação do Banco Central. Experimente os valores no simulador e ajuste o planejamento à sua realidade.",
    fontes: [
      {
        titulo: "Banco Central — Educação financeira e orçamento",
        url: "https://www.bcb.gov.br/meubc/faqs/s/educacao-financeira-sub",
        consultado_em: "2026-10-28",
      },
    ],
  },
  {
    categoria: "Reserva financeira",
    nivel: "basico",
    titulo: "Uma reserva para imprevistos",
    texto:
      "Uma reserva ajuda a enfrentar despesas inesperadas sem depender imediatamente de crédito. Seu tamanho depende das despesas, da estabilidade da renda e das necessidades de cada pessoa.\n\nPara um objetivo que pode exigir uso rápido, compreender o risco e a facilidade de resgate importa mais do que perseguir a maior taxa. Na FinStart, crie uma meta e registre os valores guardados; não há aplicação financeira real no site.",
    fontes: [
      {
        titulo: "CVM — Antes de investir",
        url: "https://www.gov.br/investidor/pt-br/investir/antes-de-investir",
        consultado_em: "2026-10-28",
      },
    ],
  },
  {
    categoria: "Juros compostos",
    nivel: "basico",
    titulo: "Tempo e constância nas simulações",
    texto:
      "Nos juros compostos, os juros de cada período passam a integrar o saldo do período seguinte. Assim, taxa e tempo atuam juntos na evolução do valor.\n\nExemplo matemático da FinStart: R$ 100 a 1% ao mês, sem aportes, tornam-se R$ 101 e depois R$ 102,01. O simulador também admite aportes no fim do mês. Suas taxas são hipóteses constantes, sem garantia de rendimento.",
    fontes: [
      {
        titulo: "Banco Central — Caderno de Educação Financeira, módulo 3",
        url: "https://www.bcb.gov.br/pre/pef/port/caderno_cidadania_financeira.pdf",
        consultado_em: "2026-10-28",
      },
    ],
  },
  {
    categoria: "Investimentos básicos",
    nivel: "basico",
    titulo: "Compare hipóteses, não promessas",
    texto:
      "Antes de comparar investimentos, diferencie risco, retorno e liquidez. Liquidez diz respeito à possibilidade de converter o investimento em dinheiro; risco envolve a incerteza sobre o resultado.\n\nUma projeção com saldo maior não significa que a alternativa é adequada para qualquer pessoa. A comparação da FinStart mantém valores e prazo iguais e muda apenas taxas hipotéticas. Ela não representa ofertas de produtos.",
    fontes: [
      {
        titulo: "CVM — Risco e relação entre risco e retorno",
        url: "https://www.gov.br/investidor/pt-br/investir/antes-de-investir/entenda-as-caracteristicas-dos-investimentos/risco-e-a-relacao-risco-x-retorno",
        consultado_em: "2026-10-28",
      },
    ],
  },
  {
    categoria: "Inflação",
    nivel: "basico",
    titulo: "Por que o mesmo dinheiro compra menos?",
    texto:
      "Inflação é o aumento dos preços de bens e serviços. Quando os preços sobem, uma quantia fixa pode comprar menos. Índices como o IPCA acompanham uma cesta de consumo, que pode ser diferente das despesas da sua família.\n\nExemplo da FinStart: se uma compra passa de R$ 100 para R$ 105, houve aumento de 5% naquele item. Isso, sozinho, não mede a inflação de toda a economia.",
    fontes: [
      {
        titulo: "IBGE — Inflação e poder de compra",
        url: "https://www.ibge.gov.br/explica/inflacao.php",
        consultado_em: "2026-10-28",
      },
    ],
  },
  {
    categoria: "Crédito e dívidas",
    nivel: "intermediario",
    titulo: "Olhe o custo total, não só a parcela",
    texto:
      "Uma prestação pequena pode vir de um contrato mais longo e gerar um total pago maior. Para comparar propostas equivalentes, observe prazo, condições e Custo Efetivo Total (CET).\n\nO CET reúne juros e outras despesas da operação. Exemplo didático: antes de escolher entre duas parcelas, anote o valor recebido, a quantidade de pagamentos e o total cobrado. A FinStart não contrata empréstimos nem calcula o CET de um contrato real.",
    fontes: [
      {
        titulo: "Banco Central — Empréstimos, financiamentos e CET",
        url: "https://www.bcb.gov.br/meubc/faqs/s/emprestimos-e-financiamentos",
        consultado_em: "2026-10-28",
      },
    ],
  },
  {
    categoria: "Juros compostos",
    nivel: "intermediario",
    titulo: "Taxa mensal e anual não são uma soma simples",
    texto:
      "Com capitalização composta, uma taxa mensal i corresponde à taxa anual (1+i)^12 − 1, considerando doze períodos iguais. Multiplicar a taxa por doze fornece uma aproximação que não inclui o efeito composto.\n\nExemplo matemático: 1% ao mês equivale a aproximadamente 12,68% ao ano. Para converter no sentido inverso, usa-se (1+taxa anual)^(1/12) − 1. A FinStart aplica essa conversão aos cenários anuais predefinidos.",
    fontes: [
      {
        titulo: "Banco Central — Caderno de Educação Financeira, módulo 3",
        url: "https://www.bcb.gov.br/pre/pef/port/caderno_cidadania_financeira.pdf",
        consultado_em: "2026-10-28",
      },
    ],
  },
  {
    categoria: "Diversificação",
    nivel: "intermediario",
    titulo: "Ter vários nomes não garante diversificação",
    texto:
      "Diversificar significa distribuir exposições, por exemplo, entre setores, classes de ativos e regiões. A finalidade é reduzir a concentração em uma mesma origem de risco. Isso não elimina a possibilidade de perdas.\n\nExercício: imagine uma carteira com cinco empresas do mesmo setor. Apesar dos cinco nomes, um problema que afete o setor pode atingir várias posições ao mesmo tempo. Analise o conjunto e não apenas a quantidade de aplicações.",
    fontes: [
      {
        titulo: "CVM — Como reduzir o risco",
        url: "https://www.gov.br/investidor/pt-br/investir/tipos-de-investimentos/etfs/como-reduzir-o-risco",
        consultado_em: "2026-10-28",
      },
    ],
  },
  {
    categoria: "Metas financeiras",
    nivel: "intermediario",
    titulo: "Transforme um objetivo em um plano mensal",
    texto:
      "Um objetivo financeiro fica mais claro quando você define valor, prazo e prioridade. O momento em que o dinheiro será necessário ajuda a avaliar que riscos e condições de resgate fazem sentido.\n\nNa FinStart, o aporte mensal divide o valor ainda necessário pelos meses restantes, com mínimo de um mês e sem supor rendimento. Para R$ 6.000 em doze meses, com R$ 1.500 guardados, o exemplo inicial indica R$ 375 por mês.",
    fontes: [
      {
        titulo: "CVM — Objetivos e adequação dos investimentos",
        url: "https://www.gov.br/investidor/pt-br/investir/antes-de-investir/defina-seus-objetivos/qual-o-melhor-investimento",
        consultado_em: "2026-10-28",
      },
    ],
  },
  {
    categoria: "Segurança financeira",
    nivel: "intermediario",
    titulo: "Como analisar uma promessa de ganho fácil",
    texto:
      "Promessas de resultados extraordinários exigem cautela. Antes de transferir recursos, confira quem oferece o investimento, quais riscos e condições são explicados e se os registros exigidos podem ser verificados nos canais oficiais.\n\nA pressão para decidir rapidamente não substitui informações confiáveis. Não interprete a presença de um nome ou logotipo conhecido como prova de autorização. Use os canais oficiais e evite compartilhar senhas e códigos recebidos.",
    fontes: [
      {
        titulo: "CVM — Cuidados ao investir",
        url: "https://www.gov.br/investidor/pt-br/investir/cuidados-ao-investir/evitando-problemas",
        consultado_em: "2026-10-28",
      },
    ],
  },
  {
    categoria: "Inflação",
    nivel: "avancado",
    titulo: "Rendimento nominal e ganho real",
    texto:
      "Rendimento nominal descreve a variação do valor em dinheiro. O ganho real compara essa variação com a inflação do mesmo intervalo; aumentar o saldo não significa necessariamente aumentar o poder de compra.\n\nExemplo matemático da FinStart: retorno nominal de 10% e inflação de 6% resultam em ganho real de aproximadamente (1,10 ÷ 1,06) − 1 = 3,77%, antes de custos e tributos. O simulador atual mostra valores nominais.",
    fontes: [
      {
        titulo: "IBGE — Inflação e poder de compra",
        url: "https://www.ibge.gov.br/explica/inflacao.php",
        consultado_em: "2026-10-28",
      },
    ],
  },
  {
    categoria: "Renda fixa",
    nivel: "avancado",
    titulo: "Por que um título pode variar antes do vencimento?",
    texto:
      "O preço de um título pode mudar durante sua vida. No Tesouro Direto, a venda antecipada considera o preço de mercado, que pode ser diferente da evolução esperada ao manter o título até o vencimento.\n\nPor isso, o nome renda fixa não significa preço constante em qualquer data de saída. Ao estudar um título, diferencie vencimento e venda antecipada e leia as regras oficiais. A FinStart não estima preços de negociação de títulos.",
    fontes: [
      {
        titulo: "Tesouro Direto — Regras de negociação e resgate",
        url: "https://www.tesourodireto.com.br/sobre-o-tesouro/regras-e-regulamento",
        consultado_em: "2026-10-28",
      },
    ],
  },
  {
    categoria: "Riscos financeiros",
    nivel: "avancado",
    titulo: "Separe risco de crédito, mercado e liquidez",
    texto:
      "Risco de crédito envolve a possibilidade de descumprimento de obrigações. Risco de mercado decorre de mudanças de preços e condições de mercado. Risco de liquidez envolve dificuldades para sair de uma posição nas condições pretendidas.\n\nUma mesma aplicação pode reunir esses riscos. Um exemplo didático é precisar vender um ativo em momento desfavorável, com poucos compradores. Avaliar apenas a taxa anunciada deixa de fora partes importantes dessa análise.",
    fontes: [
      {
        titulo: "CVM — Risco e relação entre risco e retorno",
        url: "https://www.gov.br/investidor/pt-br/investir/antes-de-investir/entenda-as-caracteristicas-dos-investimentos/risco-e-a-relacao-risco-x-retorno",
        consultado_em: "2026-10-28",
      },
    ],
  },
  {
    categoria: "Fundos e custos",
    nivel: "avancado",
    titulo: "O resultado de um fundo depende também dos custos",
    texto:
      "Um fundo reúne recursos de investidores e segue regras de funcionamento. Para analisá-lo, leia os documentos oficiais sobre estratégia, riscos, custos e condições de aplicação e resgate. As cotas podem se valorizar ou desvalorizar.\n\nTaxas reduzem o resultado que chega ao investidor. Ao estudar um ETF, por exemplo, confira os custos do fundo e os de negociação, sem comparar apenas o retorno passado. A projeção da FinStart não desconta essas despesas.",
    fontes: [
      {
        titulo: "CVM — Fundos de investimentos e suas características",
        url: "https://www.gov.br/investidor/pt-br/investir/tipos-de-investimentos/fundos-de-investimentos/o-que-sao-fundos-de-investimentos",
        consultado_em: "2026-10-28",
      },
      {
        titulo: "CVM — O que analisar antes de investir em ETFs",
        url: "https://www.gov.br/investidor/pt-br/investir/tipos-de-investimentos/etfs/o-que-analisar-antes-de-investir",
        consultado_em: "2026-10-28",
      },
    ],
  },
  {
    categoria: "Derivativos",
    nivel: "avancado",
    titulo: "Proteção, exposição e alavancagem",
    texto:
      "Derivativos são contratos relacionados a um ativo ou referência. Eles podem ser usados para proteção ou para assumir exposição, mas seu comportamento depende das condições do contrato e do mercado.\n\nA alavancagem pode ampliar perdas, e a proteção planejada pode não funcionar exatamente como o esperado. Compreender ajustes, obrigações e riscos é essencial. Este conteúdo apresenta o tema; a FinStart não recomenda operações nem oferece simulador de negociação de derivativos.",
    fontes: [
      {
        titulo: "CVM — Riscos dos derivativos",
        url: "https://www.gov.br/investidor/pt-br/investir/tipos-de-investimentos/derivativos/riscos",
        consultado_em: "2026-10-28",
      },
    ],
  },
];
