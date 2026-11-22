# Publicação e leitura — escopo aprovado

Base: main aaf4c81, árvore limpa, branch feat/editorial-publishing. AGENTS e plano
editorial consultados. Não há fase GSD ativa nem skill Payload local disponível.
O pedido atual autoriza as funcionalidades antes adiadas de comentários e reações.

Entrega: importador Markdown autenticado (simulação padrão, rascunho, sem sobrescrita
implícita); bloco PDF vinculado a Media; artigos recentes automáticos na home;
listagem filtrável e pesquisável; artigo com vídeo, sumário/posição, busca local,
blocos educativos (checklist e pipeline), relacionados; comentários moderados e
reações persistentes com validação de origem e Turnstile antes de escrever.

Reutilizar o admin e editor nativos. Criar somente blocos e UI pública necessários:
seleção de material, navegação de leitura e interação do visitante não são providas
pelos componentes atuais. Nenhuma publicação nem alteração de produção automática.

Aceite: rascunhos não aparecem na home/listagem/interações públicas; PDF selecionado
realmente é PDF e usa URL do site; categorias e paginação preservadas; sumário usa
âncoras únicas; busca e interações funcionam por teclado; importação padrão não
escreve e atualização exige versão esperada; comentários nunca publicados sem
aprovação; proteção ausente bloqueia submissões; schema com migração; testes,
build e navegador local antes de commit/PR.
