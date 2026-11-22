# Job de migration antes da aplicação

## O que este PR entrega

`compose.production.yaml` prepara dois serviços da **mesma imagem construída**:

1. `migrate`: executa o CLI nativo Payload e termina com código zero somente quando
   todas as migrations desta imagem estão registradas no banco. Sem restart ou HTTP.
2. `web`: depende de `migrate` com `service_completed_successfully`; verifica o
   registro de migrations e inicia Next.js. Reiniciar web não executa migrations.

O executor usa um advisory lock de sessão PostgreSQL, mantido enquanto o CLI roda.
Outro executor aguarda até 60 segundos (`MIGRATION_LOCK_TIMEOUT_MS`, máximo 600000)
antes de falhar. Falha de migration, interrupção ou perda da conexão do lock impedem
sucesso. O processo filho recebe encerramento se o lock for perdido. Um marcador
Payload de schema push de desenvolvimento (`batch=-1`) é recusado antes de chamar o
CLI: não há confirmação automática de operações potencialmente destrutivas.

O teste de prontidão consulta o histórico, não tenta adivinhar/reparar o schema.
Não marca migrations manualmente como concluídas. Migrations extras de uma versão
mais nova são permitidas para rollback de código, desde que sejam compatíveis.
Nomes de migrations e arquivos do registro precisam corresponder; falha bloqueia.

`pg` foi declarado como dependência direta na versão já presente no projeto: o
runner precisa de uma conexão separada para manter o lock entre as transações do
CLI. Não há biblioteca adicional de migrations nem acesso ao Docker socket no app.

## Transição segura: nenhuma mudança de produção neste PR

A aplicação atual foi consultada em modo leitura e usa Dockerfile, com base
`/white-label-publishing-platform`. Um hook **pre-deployment do Dockerfile executa
no container antigo**, não é um job com a imagem nova e pode nem rodar no primeiro
deploy. Por isso não usar esse hook para aplicar novas migrations.

Até a ativação autorizada do Compose, o CMD padrão continua compatível: migration
sob lock → Next.js. Assim um merge/deploy automático no build pack antigo não passa
a iniciar código novo sem schema. A separação passa a valer ao selecionar o novo
arquivo Compose no Coolify. Não configurar `pnpm start` sozinho antes dessa troca.

### Ativar no Coolify — exige autorização de produção

1. Fazer backup do PostgreSQL, registrar imagem e configuração atuais. Pausar
   deploys concorrentes e coordenar o merge (webhook pode fazer deploy automático).
   Validar primeiro em aplicação/banco de homologação separados. Não apontar previews
   para o banco de produção.
2. Na aplicação do portfólio, mudar Build strategy para **Docker Compose**; manter
   Base Directory `/white-label-publishing-platform` e selecionar
   `/compose.production.yaml` como Compose Location. Usar modo normal, não Raw.
   Não substituir o compose local de PostgreSQL (`docker-compose.yml`).
3. Revisar o Compose que o Coolify gera: mesmos envs atuais, S3, Entra, Turnstile,
   secrets do build, rede externa do banco e proxy (`COOLIFY_NETWORK`, padrão
   `coolify`). Ambos os serviços precisam chegar ao PostgreSQL existente. Não há
   banco novo, volume novo de dados nem porta pública adicional nesse arquivo.
4. Associar os domínios atuais exclusivamente ao serviço **web**, porta interna
   3000. Preservar origem HTTP local e HTTPS na Cloudflare, túnel, aliases e regras
   existentes. Não mexer no painel Coolify nem no webhook.
5. Definir Custom Build Command: `docker compose build --pull`.
   Definir Custom Start Command: `docker compose up --force-recreate -d`.
   O Coolify injeta os caminhos do Compose gerado e env-file. **Force recreate é
   obrigatório:** até redeploy do mesmo commit deve criar um job novo, sem reutilizar
   um container migrate que terminou numa implantação anterior. Não usar `--no-deps`
   nem `--no-recreate`. A imagem é local à aplicação e compartilhada pelos serviços;
   não permitir builds/deploys simultâneos da mesma aplicação sobre a tag `release`.
6. O campo `exclude_from_hc: true` é uma extensão Coolify: confirmar que ele a
   consome/remove ao gerar o Compose e exclui migrate da saúde geral. Compose puro
   rejeita esse campo. Para testes locais, remover **somente** esse campo numa cópia
   temporária e passar `--project-directory` com a pasta da aplicação; não usar
   essa cópia como fonte no Coolify. Não alterar o healthcheck web para ignorar falhas.
7. Disparar o deploy autorizado: imagem construída → migrate termina 0 → web
   verifica histórico e inicia → healthcheck HTTP 200. Confirmar pelo inspect que
   ambos usam o mesmo image ID. Uma migration com exit não-zero deve impedir a nova
   web de iniciar; nunca contornar a dependência para fazer o deploy ficar verde.

Trocar de build pack/topologia pode interromper a instância antiga. Compose não é
promessa de rolling update ou zero downtime; agendar janela para essa primeira
troca. A compatibilidade do schema continua obrigatória mesmo com o job separado.

### Operação e rollback

- Restart de web: somente verificação + servidor, sem executar CLI migrate.
- Deploy/redeploy: criar job novo; Payload pula as migrations já registradas.
- Falha: ver o log do job. Corrigir a causa; não apagar o histórico, aceitar schema
  push nem rodar down destrutivo para desbloquear. Backup é pré-requisito, não rollback
  automático. CLI ainda deve ser usado apenas pelo wrapper em deploys de produção.
- Rollback de código: manter schema compatível e dados. Reimplantar a imagem anterior
  com a configuração anterior, restaurar estratégia/domínios se necessário. Não
  executar migrations down. Conteúdo com blocos novos exige atenção ao renderizador
  antigo antes de um rollback: manter o leitor compatível ou preservar/exportar os
  artigos novos. Compatibilidade de tabelas não garante compatibilidade de conteúdo.
- O lock evita execução concorrente de runners que usam esta convenção; não serializa
  comandos SQL externos, CLI bruto ou mudanças manuais de banco. Proibir deploys em
  paralelo; se houver outro executor legítimo, ele deve adotar o mesmo lock.

Comandos disponíveis: `pnpm migrate:release`, `pnpm migrate:check` e
`pnpm start:checked`. O último não aplica migrations; precisa do job já concluído.

Referências:
https://coolify.io/docs/applications/builds/dockerfile e
https://coolify.io/docs/applications/builds/docker-compose.

## Evidências locais

- TypeScript passou; 75 testes passaram; lint com zero erros e 13 avisos anteriores.
- Imagem Docker completa construída no Node 22.17.0 Alpine, com secrets fictícios.
- Banco vazio: check recusou startup; job aplicou migrations; check/repetição passaram.
- Lock ocupado recusou segundo runner; marcador real PostgreSQL `batch=-1` foi
  recusado sem prompt (o driver retorna esse campo numeric como string).
- Compose normalizado localmente, removendo somente a extensão Coolify de saúde:
  job e web usaram o mesmo image ID; o job terminou antes do início de web; healthcheck
  respondeu 200; restart web apenas verificou histórico, sem repetir job.
- Falha controlada no job retornou exit 1 e impediu iniciar a nova web. Containers e
  rede desse teste foram removidos. Nenhum teste acessou banco de produção.

A normalização e os comandos customizados gerados pelo Coolify real ainda precisam
ser confirmados na homologação antes de ativar a estratégia na aplicação de produção.
