# Migração do portfólio para juniorhova.com

## Escopo e autorização

Preparação em `feat/portfolio-domain-migration`, a partir de `origin/main`
`354cf40`. Nenhuma mudança de infraestrutura, segredo, conteúdo, redirect ou
produção foi executada por este PR. **Merge e cutover exigem autorização separada.**
O webhook GitHub → Coolify está configurado: integrar até um PR apenas documental
pode iniciar um deploy automático da main com as variáveis atuais. Coordenar o
merge; não alterar variáveis de domínio antes da janela autorizada.

Resultado esperado: `https://juniorhova.com` como origem pública; os três aliases
`hovait.com.br`, `www.hovait.com.br` e `www.juniorhova.com` respondem 301 para ela,
preservando caminho e query. Coolify e outros subdomínios permanecem intactos.

## Inspeção da main e decisão

A configuração existente já suporta a troca por ambiente. Nenhum domínio novo é
fixado no código e nenhum schema ou conteúdo precisa ser migrado automaticamente.
Desenvolvimento mantém `http://localhost:3000`. Não foi encontrada pasta GSD
`.planning` nem a skill `.agents/skills/payload/SKILL.md` referenciada pelo AGENTS;
o plano editorial existente foi consultado e não contém fase ativa deste cutover.

| Área | Comportamento e consequência |
| --- | --- |
| URL pública | `src/utilities/getURL.ts`: servidor prioriza `NEXT_PUBLIC_SERVER_URL`, depois Vercel, depois localhost. No browser usa `window.location`. Usar URL HTTPS sem barra final. |
| Build e runtime | Dockerfile exporta a URL de um BuildKit secret para `next build` e `next-sitemap`; o container também precisa da mesma variável. `NEXT_PUBLIC_*` é incorporada no bundle: reiniciar sozinho não basta; gerar imagem nova. |
| Sitemap/robots | `next-sitemap.config.cjs` gera arquivos no postbuild. Rotas `pages-sitemap.xml` e `posts-sitemap.xml` usam a URL e cache do Next. Validar os três sitemaps e robots após rebuild; não reaproveitar cache persistente antigo. |
| SEO | Layout usa `metadataBase`; `generateMeta.ts`/`mergeOpenGraph.ts` geram imagens absolutas com a URL configurada. Não existe canonical explícito (`alternates.canonical`) hoje; mudar domínio não adiciona canonical nem corrige limitações SEO preexistentes, como og:url genérico. |
| Imagens | Media/S3 fornece caminhos `/api/media/file/...`, aceitos por `localPatterns`; retrato/favicons são locais. `next.config.ts` resolve remotePatterns por Vercel/`__NEXT_PRIVATE_ORIGIN`/localhost, não pela variável pública. Isso já ocorre no domínio antigo: validar imagens absolutas existentes; não ampliar hosts preventivamente. |
| Links | Plugins SEO, preview e URLs geradas usam helpers de URL; links relativos acompanham o hostname. Links absolutos gravados no CMS não são reescritos automaticamente; inventariar Pages/Posts/Header/Footer/Media antes da transição. |
| Payload | `cors` aceita `getServerSideURL()` somente. Sem `serverURL` ou `csrf` personalizados. Não presumir edição/admin cross-origin enquanto dois domínios coexistem; usar o admin na origem configurada. |
| Login local | Users usa cookie Secure em produção e SameSite=Lax, sem Domain customizado. Sessões são do hostname; novo domínio exige login novo. Preservar PAYLOAD_SECRET, banco e usuários. Guard de senha depende das allowlists e de o Entra estar ativo. Confirmar acesso local de recuperação antes de mudar. |
| Entra | Ativo se tenant/client/secret estão presentes. `ENTRA_REDIRECT_URI` explícita ganha; senão deriva da URL pública. State/nonce/PKCE são cookies HttpOnly, Secure, Lax e path `/`, sem Domain. Callback valida state, nonce e PKCE; cria sessão Payload e redireciona ao admin da URL pública. Iniciar no antigo e retornar no novo falha por ausência dos cookies. |

Os achados de DNS, certificados, túnel e Coolify abaixo foram fornecidos pelo
proprietário; não foram auditados via acesso privilegiado neste PR. Entra ativo,
URIs cadastradas, allowlists, recuperação local e políticas de Access ainda devem
ser confirmados em produção, sem imprimir valores de segredos.

## Sequência de produção — executar somente após autorização

### 1. Preparar e registrar rollback

- Registrar imagem/commit atual, domínios/rotas e valores anteriores da URL pública
  e callback em local protegido. Fazer backup do PostgreSQL; preservar bucket S3,
  suas credenciais e objetos. Não trocar PAYLOAD_SECRET nem apagar uploads.
- Confirmar no Coolify quais variáveis existem em build/runtime (incluindo Shared
  Variables), sem expor seus valores. Registrar se Entra está ativo e as URIs Web
  da aplicação correta no Entra. Testar login local autorizado de recuperação.
- Se Entra ativo, adicionar **antes** `https://juniorhova.com/api/auth/entra/callback`
  como redirect URI Web, mantendo `https://hovait.com.br/api/auth/entra/callback`.
  Se inativo, não ativar SSO como parte da migração.
- Revisar links absolutos antigos no CMS, SEO e referências externas. Preservar
  snapshot antes de editar qualquer conteúdo. Confirmar uma página interna
  publicada para teste (por exemplo `/posts`, e um artigo se existir).

### 2. Preparar hostnames em paralelo, sem 301

- Na zona Cloudflare juniorhova.com, adicionar DNS do apex e www para o túnel
  existente `oci-coolify-001`, pelo mecanismo de published routes/DNS do túnel.
  Manter a zona antiga, MX/TXT e rotas existentes.
- Adicionar `juniorhova.com` e `www.juniorhova.com` ao túnel saudável, usando a
  **mesma origem HTTP local do proxy** usada pelo portfólio antigo (não apontar
  para localhost:3000 do host por suposição). Preservar Host para o proxy rotear.
- No Coolify, projeto `hovait-tech-portifolio`, ambiente `production`, aplicação
  `white-label-publishing-platform:main`, manter porta interna 3000 e incluir os
  novos hosts em paralelo no padrão existente `http://...`, conservando
  `http://hovait.com.br`. Adicionar `http://www.hovait.com.br` se for necessário
  atendê-lo antes das regras de borda; hoje ele retorna 404 por falta dessa rota.
- HTTPS termina na Cloudflare com certificado válido; origem local continua HTTP.
  Não mudar o modo TLS global sem necessidade. Verificar SSL/HTTPS dos quatro
  hostnames e eventuais regras Cloudflare Access/WAF para o site e admin.
- Não alterar `coolify.hovait.com.br`, o caminho liberado do webhook, demais
  aplicações do túnel, DNS de e-mail nem a autenticação do painel Coolify.
- Validar chegada da home/mídia no novo host. Nesta fase URL/SEO ainda apontam ao
  antigo; o admin/SSO deve continuar sendo usado no antigo até o próximo passo.

### 3. Trocar origem pública e reconstruir

- Na janela autorizada, pausar edições e evitar iniciar fluxos SSO no domínio
  antigo; permitir concluir os que já começaram antes da troca.
- Definir `NEXT_PUBLIC_SERVER_URL=https://juniorhova.com` no Coolify **para build
  e runtime**. Não usar barra final, nem colocar o endereço HTTP da origem local.
- Se Entra ativo: definir `ENTRA_REDIRECT_URI=https://juniorhova.com/api/auth/entra/callback`
  no runtime (e build se atualmente configurado assim). Manter a URI antiga
  cadastrada no Entra. O callback só consome a configuração atual; URIs antigas
  registradas não tornam válidos fluxos iniciados no hostname errado.
- Gerar novo build e deploy da main no Coolify, forçando rebuild se ele tentar
  reutilizar imagem do mesmo commit. Confirmar o commit e sucesso do healthcheck.
  Não basta restart: sitemap/robots e URL pública do cliente são artefatos do build.
- Verificar que as rotas dinâmicas de sitemap não conservam URLs antigas em cache;
  se necessário usar uma imagem/cache Next limpa e limpar somente os caches
  públicos correspondentes na Cloudflare. Não apagar banco ou mídia.

### 4. Validar antes de ativar redirects

Registrar resultado e URL testada, sem tokens/cookies/senhas:

- Home e página interna: HTTP 200, navegação, links relativos/absolutos, fotos,
  vídeo e favicons; sem loop, conteúdo misto ou chamadas involuntárias ao antigo.
- Media: abrir URL existente no novo domínio e fazer upload/download de PDF
  descartável pelo admin. Confirmar S3 privado e link no domínio público.
- `/sitemap.xml`, `/pages-sitemap.xml`, `/posts-sitemap.xml` e `/robots.txt`:
  origens novas, nenhum link hovait.com.br. Inspecionar HTML de home e página
  interna: metadata, OG e imagens absolutas; canonical explícito não é implementado.
- `/admin`: formulário visível, login local autorizado, `/api/users/me`, edição,
  salvar rascunho, preview, publicar alteração de teste e desfazer; logout e novo
  login. Confirmar ausência de falhas CORS/CSRF/cookies e rascunhos não públicos.
- Se Entra ativo: começar **no novo hostname**, completar SSO e retorno ao
  `/admin`, validar sessão e logout. Não testar apenas o redirecionamento inicial.
- Aprovar esses resultados antes dos 301. Se falhar, interromper e usar rollback.

### 5. Ativar 301 somente nos aliases públicos

Na Cloudflare, regras Single Redirect (ação 301, **Preserve query string** ligado):

| Zona | Expressão de hostname exato | Destino dinâmico |
| --- | --- | --- |
| hovait.com.br | `(http.host eq "hovait.com.br") or (http.host eq "www.hovait.com.br")` | `concat("https://juniorhova.com", http.request.uri.path)` |
| juniorhova.com | `http.host eq "www.juniorhova.com"` | `concat("https://juniorhova.com", http.request.uri.path)` |

Manter DNS desses aliases proxied/roteados para que a Cloudflare execute as regras
antes da origem. Não usar wildcard por zona nem regra para todos os subdomínios.
Não redirecionar o apex juniorhova.com para si próprio. Revisar prioridades e
regras HTTPS existentes para evitar loops/cadeias. Não usar redirects de páginas
no Payload para substituir essas regras de hostname.

Testar HTTP e HTTPS para cada alias com `/posts?ref=migracao&x=1`: status 301 e
Location `https://juniorhova.com/posts?ref=migracao&x=1`, seguido de resposta válida.
Testar raiz, caminho inexistente e URL de mídia. Confirmar que Coolify continua
com sua própria proteção e webhook, sem redirecionar ao portfólio. Confirmar
resolução de MX/TXT intacta. Atualizar perfis e ferramentas de busca após aprovação.

## Estado final e rollback

Final: URL pública/callback novos, dados/bucket/porta e túnel preservados; aliases
com 301 exato. Remover a URI antiga do Entra somente após período de observação e
encerramento da janela de rollback, em ação separada. Administradores fazem login
novo no domínio novo; cookies não são transferidos entre domínios.

Rollback, se qualquer validação falhar:

1. Desabilitar primeiro somente as novas regras 301 nas duas zonas; manter DNS e
   rotas paralelas. Navegadores podem ter guardado 301: validar com sessão limpa.
2. Restaurar URL pública e callback anteriores no Coolify; restaurar também os
   escopos build/runtime. Confirmar URI antiga ainda registrada no Entra.
3. Rebuild/redeploy com configuração anterior ou reimplantar imagem anterior
   compatível **e** seu runtime anterior. Apenas reverter este PR documental não
   troca variáveis nem desfaz regras. Limpar caches públicos afetados.
4. Validar home, mídia, sitemaps e novo login local/Entra no antigo. Não reutilizar
   state/cookies de login iniciados no novo. Recuperar links CMS do snapshot se
   foram editados. Não apagar recursos novos até entender a falha; nenhum rollback
   de schema é necessário para este PR.

## Verificação da preparação

Os comandos e resultados desta branch estão registrados no PR. Os testes locais
não comprovam DNS/Tunnel/SSL, IAM/S3 real, URIs Entra ou login em produção: toda a
lista da etapa 4 permanece um requisito do cutover autorizado separadamente.
