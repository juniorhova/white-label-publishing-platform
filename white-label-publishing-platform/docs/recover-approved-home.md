# Recuperar a home aprovada após o deploy

A home pública busca uma página publicada com slug `home` no Payload. Publicar componentes e campos novos não altera o conteúdo existente. Sem esse registro, `/` retorna 404.

## Correção

A migração `20261116_020000_publish_approved_home` publica uma única vez o conteúdo aprovado em `content/home-approved.json`:

- Se `home` não existe, cria a página publicada com apresentação pessoal, os dois vídeos, Sobre, trajetória resumida e as 24 semanas do roadmap.
- Se encontra a apresentação original publicada (`lowImpact` e texto “Building reliable platforms”), salva primeiro uma versão do conteúdo antigo no histórico nativo e aplica a nova home.
- Se encontra uma home pessoal, personalizada ou em rascunho, preserva esse conteúdo. Não força a publicação de mudanças editoriais.
- Preenche o menu principal apenas se estiver vazio ou contiver somente Home/Início. Menus personalizados são preservados. Preenche o rodapé somente quando vazio.
- Não cria usuários, posts ou registros de Media. Não exclui páginas ou outros conteúdos. Todas as chamadas usam a transação da migração.

A foto inicial já acompanha o código. O upload do Hero passa a ser opcional na apresentação pessoal; os tipos de Hero que exigiam uma imagem continuam validando sua presença. A migração limpa a mídia antiga do Hero para usar a foto aprovada incluída no projeto. Não depende de um arquivo de upload do ambiente local.

Header e Footer passam a usar cache limitado à requisição. Assim, os dados antigos não ficam presos em cache preenchido durante o build antes da migração de inicialização.

## Aplicar

O Dockerfile existente inicia com `pnpm migrate && pnpm start`. Após revisar e integrar o PR de correção, o próximo deploy que usar esse comando aplicará a publicação antes de iniciar o site. O pacote de conteúdo é copiado explicitamente para a imagem de execução.

Não é necessário criar outra home manualmente para esse caso. Se houver uma home personalizada ou em rascunho antes do deploy, a migração a preservará; nesse caso a decisão editorial precisa ser feita no admin. A migração não recria automaticamente páginas apagadas depois de sua aplicação: ela só executa uma vez, como as outras migrações.

Depois do deploy, conferir `/`, os menus, a foto, os vídeos e o roadmap em uma janela anônima. O painel permite continuar editando a página normalmente.

## Recuperação de conteúdo

O conteúdo original substituído fica em Pages → Home → Versions. Rollback automático desta migração é recusado para não sobrescrever alterações editoriais posteriores; restaure a versão desejada pelo Payload ou despublique a nova página conscientemente. Antes de um rollback de esquema, faça backup do banco e restaure também a apresentação antiga compatível com o esquema anterior.

## Verificação local

- Migrações aplicadas do zero em PostgreSQL descartável `home_publish_review`, incluindo criação da home em banco sem páginas.
- Teste nativo adicional: conversão da home original em transação, versão antiga retida, outra página preservada, repetição sem duplicar registros e nenhum usuário/Media criado.
- 43 testes de integração passaram; TypeScript sem erros. Lint sem erros, com os 13 avisos preexistentes.

O diagnóstico do domínio foi somente pela página/API pública. Não foram usados credenciais, painel Coolify ou conexão com banco de produção.

Validação final: build de produção passou. A prévia recuperada respondeu HTTP 200, carregou a foto incluída e exibiu Início/Vídeos/Sobre, os dois vídeos e o roadmap. Os três testes de navegador passaram em 1440, 375 e 320px. A correção está na branch `fix/restore-approved-home`; o domínio de produção só recebe a nova publicação após integrar esse PR e executar um novo deploy.
