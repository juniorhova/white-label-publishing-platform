# Identidade do admin Junior Hova

A identidade visual usa os pontos nativos `admin.components.graphics.Logo/Icon`,
`admin.meta`, `beforeLogin` e `beforeDashboard`. O formulário de autenticação,
recuperação de senha, coleções, navegação e editor continuam sendo os do Payload.
Não há nova tela de login nem alteração em cookies, permissões, S3 ou callback SSO.

- Marca juniorhova. e ícone JH com o azul do portfólio e adaptação ao tema escuro.
- Títulos do navegador com sufixo Junior Hova e descrição própria do painel.
- Boas-vindas editoriais em português no lugar dos textos/links do template.
- Botão Microsoft preservado e traduzido; mensagens nativas seguem o idioma atual.
- O bloco de exemplo que oferecia popular o banco com conteúdo fictício foi
  substituído por uma orientação curta e link para o portfólio.

Ao mudar componentes, execute `pnpm generate:importmap` e versione o resultado.
Depois do merge o webhook pode iniciar deploy automático. Validar login local,
Microsoft se configurado, navegação e temas em produção após autorização.
