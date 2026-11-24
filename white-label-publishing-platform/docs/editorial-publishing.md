# Artigos e materiais de apoio

## Editar e publicar

Continue em **Posts** no admin nativo. O conteúdo tem blocos **Material PDF**
(selecione um PDF de Media) e **Atividade interativa** (checklist ou pipeline com
explicações). Vídeo do YouTube é opcional. Blocos interativos usam estado da visita,
sem progresso compartilhado; não executam código enviado por visitantes.

Pages → Home continua editável. A seção Artigos recentes mostra automaticamente
até três posts publicados por data. Para publicar um vídeo no site, crie ou edite
seu artigo em **Posts** e preencha o campo **Vídeo do YouTube**. O card usa a
thumbnail do vídeo e abre o artigo, onde o visitante pode reproduzi-lo. Cards de
artigos sem vídeo exibem texto. Valores antigos de vídeo da home são mantidos no
Payload para compatibilidade, e a home reúne as publicações na seção de artigos.
Artigos relacionados podem ser escolhidos no admin ou sugeridos por categoria
(ou por data quando não há categoria).

`/posts` filtra por categoria e busca título/descrição, com paginação. O artigo tem
sumário navegável com seção ativa e busca de trechos no conteúdo já carregado.
O campo de busca do índice não é busca global nem altera o texto publicado.

## Importação sem montar o artigo manualmente

O arquivo Markdown deve estar dentro da pasta do manifesto. Use a REST API autenticada do próprio site, nunca uma migration para conteúdo.
Crie `artigo.json` e `artigo.md` na mesma pasta. Exemplo de manifesto:

```json
{
  "title": "Entendendo um pipeline",
  "slug": "entendendo-um-pipeline",
  "markdownFile": "artigo.md",
  "description": "Da validação à entrega.",
  "categoryIds": [1],
  "blocks": {
    "material": { "type": "pdf", "mediaId": 2, "title": "Guia de prática" },
    "pipeline": {
      "type": "pipeline",
      "title": "Explore as etapas",
      "items": [
        { "label": "Teste", "explanation": "Verifica o comportamento antes de entregar." },
        { "label": "Deploy", "explanation": "Disponibiliza a versão validada." }
      ]
    }
  }
}
```

IDs acima são exemplos: substitua por categorias/Media existentes. O Markdown aceita
parágrafos, títulos, listas, links, imagens Markdown, ênfase e código cercado por
três crases. Linguagens: typescript/ts, javascript/js, css, bash, json, yaml, python,
text. HTML/MDX não é executado. Para incluir blocos, use marcadores em linha própria:

```text
## Exercício

{{block:pipeline}}

{{block:material}}
```

Para checklist, troque `type` por `checklist` com os mesmos itens. Os blocos são
convertidos para o formato do editor, portanto continuam editáveis no portal.
Evite imagens externas no Markdown: prefira a biblioteca e blocos de mídia no admin
para compatibilidade com otimização de imagens e disponibilidade dos arquivos.

Defina `IMPORT_SITE_URL` com a origem HTTPS e `IMPORT_PAYLOAD_TOKEN` com um JWT de
sessão de administrador Payload, obtido pelo login normal ou REST `/api/users/login`
com o usuário local autorizado. SSO pode usar o JWT da sessão existente. Não use
access key S3 nem token Entra no lugar do JWT Payload. Não grave tokens/credenciais
no manifesto, histórico do shell, Git ou logs. A ferramenta não acessa seu banco
local nem exige credenciais do banco de produção.

```bash
pnpm import:post /caminho/artigo.json
pnpm import:post /caminho/artigo.json --apply
```

Primeiro comando é simulação autenticada e não escreve; segundo cria rascunho.
Para publicar conscientemente: acrescente `--apply --publish`. Depois de criar,
revise em Posts → Preview, edite se necessário e publique normalmente.

Se slug já existir, retorna conflito e `updatedAt`. Revise o artigo existente e
adicione `expectedUpdatedAt` ao manifesto com o valor exato antes de atualizar.
Não tente atualizar enquanto outra pessoa edita: a comparação protege contra
versões já alteradas, mas não substitui uma trava de edição multiusuário.
Uma atualização completa substitui texto/categorias/descrição/vídeo do manifesto;
campos não importados, como autor e relacionados, continuam no banco.
Simule novamente antes de `--apply`. Atualizar como rascunho preserva a publicação
anterior até você publicar a nova versão. Histórico nativo de Versions permanece.
A importação não faz upload de arquivos automaticamente: envie-os em Media primeiro.

## Artigo das 27 entrevistas internacionais

O manifesto está em `content/articles/27-entrevistas-internacionais.json`.
Importe-o como rascunho pelo fluxo acima. O vídeo `coPH1HBW85A` habilita o
formulário STAR logo após o título **Monte seu prompt de entrevista**. Se o título
for removido ou renomeado no editor, o formulário aparece no fim do conteúdo.
O formulário monta e copia o texto no navegador. As respostas ficam na sessão
da página e não são enviadas ao site.

## PDFs no S3

O bloco aceita somente `application/pdf`, validado também no servidor. O link aponta
para `/api/media/file/<nome>?download=true` no seu domínio; o adaptador S3 transmite
o arquivo e o atributo de download do link solicita salvar o arquivo ao navegador. Arquivos continuam públicos para leitura,
mesmo quando referenciados por rascunhos. Não envie documentos privados. Reutiliza as
credenciais S3 do Coolify e não exige outro bucket.

## Comentários e reações

Comentários aparecem em **Comentários** no admin e entram como Aguardando aprovação.
Somente Aprovado aparece no artigo público. Nome/texto são públicos após aprovação.
Reações disponíveis: gostei, foi útil, aprendi algo. Cada navegador pode escolher
uma reação por artigo; mudar a escolha atualiza o registro. Cookie apagado/outro
navegador pode contar como visitante novo: não é uma identidade verificada.
O identificador armazenado é HMAC, não IP. Há limite de cinco comentários por hora
por cookie; a validação Turnstile é obrigatória para cada envio e mitiga automação,
mas não garante ausência de spam humano. Moderar e remover dados indevidos no admin.
São exibidos os 50 comentários aprovados mais recentes, sem sistema de contas/leitores.

Configurar um widget Turnstile para seu domínio e obter chaves separadamente:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: chave pública, build **e** runtime no Coolify.
- `TURNSTILE_SECRET_KEY`: segredo, somente runtime.

Rebuild/redeploy após configurar a chave pública. Não foram criados recursos
Cloudflare por este PR. Sem as duas chaves, comentários aprovados/contagens continuam
visíveis, mas novos envios ficam desativados. O servidor verifica origem exata,
token, hostname e action `post-interaction`; tokens são de uso único. Não há bypass
de produção por variável de teste. Validar o widget real no domínio após deploy.

## Deploy e rollback

Revisar a migração nova e fazer backup PostgreSQL antes do merge/deploy. O CMD
compatível aplica migrations sob lock e depois inicia o Next.js; o fluxo separado
está em [Job de release](release-migrations.md). A migration aplica campos e tabelas novas; não publica
artigos nem altera dados existentes. Merge na main pode disparar deploy automático.

Validar: rascunho oculto, simulação sem escrita, importação de rascunho, publicação
na home/listagem, PDF real via S3, filtros, mobile, sumário/busca, widget e moderação.
Conteúdo de testes deve ser descartável; não usar seeds/migrations para publicar.
Para rollback de aplicação, conservar tabelas/colunas novas e histórico; não executar
down destrutivo em produção. Desativar novos envios removendo a configuração privada
do Turnstile e reimplantar a imagem anterior se necessário. Exportar os novos blocos
antes de voltar a uma versão que não sabe renderizá-los.

## Verificação local desta entrega

- `pnpm exec tsc --noEmit` e build de produção com banco descartável.
- `pnpm exec vitest run --exclude tests/int/api.int.spec.ts`: testes editoriais,
  autorização, proteção de rascunhos, conflitos de importação, PDF e verificação.
- `pnpm lint` e formatação/diff. O teste API legado que depende de sua própria
  configuração de banco não é usado contra produção.
- `pnpm exec playwright test --config playwright.editorial.config.ts`: requer
  prévia local já iniciada e `EDITORIAL_TEST_EMAIL`/`EDITORIAL_TEST_PASSWORD` de
  administrador do banco descartável. O teste recusa hostname externo, cria seus
  artigos/comentários e os remove ao terminar. Executa desktop/mobile sequencialmente
  para não disputar sessões do mesmo usuário de teste.
- Foi validado também o comando CLI em simulação, o download do PDF e a preservação
  da versão publicada após importar uma nova versão em rascunho.

A aba dos artigos usa o título do conteúdo/SEO com a marca Junior Hova e canonical
correspondente. Ao excluir um artigo pelo Payload, os comentários e reações dele
são removidos na mesma operação. Não há importação/públicação de exemplos reais no
banco de produção. A proteção e o widget Turnstile reais, o download no S3 real e
os callbacks de login existentes exigem verificação no domínio após deploy.
