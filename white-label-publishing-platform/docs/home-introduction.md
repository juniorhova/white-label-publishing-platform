# Home pessoal — primeira entrega

Branch: `feat/home-design`. Somente revisão local: sem commit automático, push, merge ou publicação. Posts permanecem em `/posts`; a reformulação dos artigos e Resources ficam para outras etapas. O autor confirmou que ainda não tem projetos publicados: a home apresenta seus dois vídeos, sem inventar portfólio.

## Direção aprovada

Apresentação em português, foto vertical enviada pelo autor, Geist Mono e azul `#2946A3`. Fundo claro `#FAFBFF`, texto grafite, painéis `#EEF2FF`, bordas discretas. Perfis YouTube, GitHub e LinkedIn usam suas respectivas cores; no tema escuro há variações mais claras para leitura. O admin nativo permanece intacto.

A opção **Apresentação pessoal** reaproveita o grupo Hero, mídia e links existentes. Os campos próprios são necessários para manter título/descrição com semântica consistente e configurar vídeo/perfis sem editar código. As variantes antigas permanecem disponíveis. Não há conversão automática de conteúdo existente.

## Editar pelo Payload

1. Acesse Pages e abra a página `home` (Início na demonstração).
2. Na aba Hero, selecione **Apresentação pessoal**.
3. Edite Especialidade, Apresentação e Descrição. A descrição é texto de parágrafo, não um título formatado no editor.
4. Escolha a foto no campo de mídia. A imagem aprovada também acompanha o código em `public/junior-hova-portrait.png`, como fallback durável para registros antigos sem mídia populada. A imagem não recebeu filtro ou geração artificial.
5. Configure até dois links; o primeiro recebe destaque azul e o segundo contorno. Configure os perfis sociais nos campos próprios. Campos vazios não geram links fictícios.
6. Cole uma URL de vídeo no campo **Vídeo em destaque — URL do YouTube**. Não cole HTML/iframe. Formatos watch, youtu.be, shorts e embed são aceitos e normalizados para um ID de vídeo.
7. Salve rascunho e use a prévia antes de publicar. Publicar aqui, no banco local, não publica no domínio de produção.
8. Menu e rodapé continuam em Globals → Header e Footer. Na demonstração: Início, Vídeos (`/#videos`), Artigos (`/posts`) e Sobre (`/#sobre`).

Os blocos de conteúdo abaixo do Hero permanecem editáveis. A âncora `videos` marca o início deles. O bloco Content ganhou campos opcionais de apresentação (`Colunas padrão`, `Cartões de conteúdo`, `Sobre — painel em destaque`) e título de seção; os campos antigos permanecem. Nas colunas dos cartões, uma URL opcional de YouTube busca automaticamente título e thumbnail. Texto e links continuam usando os campos nativos existentes. A seção Sobre gera a âncora `sobre`.

Essas opções foram necessárias para reproduzir a composição aprovada sem criar outro editor ou coleção: destaque em duas colunas, cartões reais e painel Sobre. Conteúdo antigo sem apresentação selecionada mantém o layout padrão. A tabela de classes de largura agora usa nomes completos, preservando cada opção de coluna.

O destaque tem um campo opcional de descrição editável junto ao vídeo em Hero. O vídeo principal fica em uma coluna e título/descrição na outra; no celular as duas se empilham. A home usa cabeçalho e rodapé alinhados ao mesmo eixo, com rodapé claro e tipografia consistente; o escopo desses estilos é a página que usa a variante pessoal.

## Vídeo incorporado

- Destaque escolhido: `https://youtu.be/Pmywg8y43j0`. Segundo vídeo confirmado pelo autor: `https://youtu.be/Pre9fPpfrGQ`. Os dois estão nos cartões da demonstração.
- Consulta de título e thumbnail pelo endpoint público oEmbed do YouTube, no servidor, sem chave ou nova dependência. Cache de até uma hora e timeout de quatro segundos.
- Somente hosts/formatos reconhecidos são aceitos. A consulta usa host fixo, sem seguir redirecionamentos nem interpretar o HTML retornado pelo provedor. Thumb externa restrita ao `i.ytimg.com`.
- Falha de metadados não interrompe a home: usa título genérico e thumbnail padrão do mesmo ID, mantendo o link externo.
- A capa mostra dados reais quando disponíveis. Só ao clicar é criado um player `youtube-nocookie.com`, com `referrerPolicy` explícita. A miniatura já faz uma requisição à infraestrutura do YouTube antes do clique; isto não é uma promessa de ausência de comunicação com terceiros.
- A reprodução depende da disponibilidade do vídeo e da permissão de incorporação definida no YouTube. Há sempre uma opção de assistir no YouTube.
- Perfis confirmados: YouTube `@juniorhova`, GitHub `juniorhova`, LinkedIn `airtonhovajunior`.

## Migrações e arquivos

Três migrações novas adicionam a variante, os campos opcionais de vídeo/perfis e as apresentações do bloco Content às páginas e versões. Foram geradas pelo Payload e aplicadas do zero em PostgreSQL 16 descartável (`home_layout_review` na revisão final, loopback 55439). Nenhum banco de produção foi acessado.

A primeira migração protege o rollback enquanto houver páginas/versões usando `portfolio`. A reversão dos campos novos exige backup e perde esses valores. Não foi executado rollback no banco local.

Antes de uma publicação futura: revisar o diff, fazer backup, aplicar o processo de migração documentado e cadastrar/revisar o conteúdo no admin do ambiente de destino. O Docker existente executa migrações ao iniciar; não publicar a branch sem essa revisão.

A foto inicial versionada no repositório sobrevive a rebuilds. A demonstração também a cadastrou na biblioteca Media existente. Outras fotos enviadas pelo admin continuam sujeitas ao armazenamento atual de Media (`public/media`), que precisa de volume persistente/backup ou storage externo antes de uso editorial de produção. Este trabalho não configurou hospedagem ou Coolify.

## Verificações

- TypeScript sem erros; formatação e diff verificados.
- Lint passa com avisos preexistentes fora da nova implementação.
- 30 testes passam: os 13 existentes e 17 cenários da integração YouTube (URLs válidas/inválidas, host fixo, falhas de rede, thumbnail externa, perfis e ativação do iframe).
- Build de produção passou usando somente o banco descartável.
- Navegador: foto/título/thumbnail reais carregaram, cores sociais e URLs conferidas, sem overflow em 1440px, 375px e 320px. Foto conferida novamente no celular após decodificação completa.
- O player efetivamente reproduziu o vídeo escolhido dentro da página (elemento de vídeo ativo, `readyState: 4`).
- A etapa anterior verificou rascunho de título sem alteração da versão pública. Nesta etapa também foi confirmado: URL de vídeo inválida é recusada na publicação (400), alterações de título/vídeo em rascunho não aparecem na API/HTML públicos e a versão aprovada foi restaurada. Os novos campos foram conferidos no admin nativo pelo navegador. O fluxo completo de posts não é considerado validado por esta entrega de home.

Referências oficiais: https://developers.google.com/youtube/player_parameters e https://payloadcms.com/docs/hooks/overview .

## Correção de fidelidade visual

Após a comparação enviada pelo autor, a composição foi corrigida: foto 4:5 mais contida, destaque de vídeo em duas colunas, cartões dos dois vídeos reais, painel Sobre, cabeçalho alinhado e rodapé claro. Nenhum projeto fictício foi adicionado. Navegador verificou as fontes em todos esses elementos, dois cartões com títulos reais, presença de Sobre e ausência de overflow em 1440px, 375px e 320px. Os 30 testes e a compilação passaram novamente após a correção. O layout do menu no celular foi então ajustado para duas linhas organizadas, sem deixar a pesquisa isolada.

Marca no cabeçalho: `juniorhova.` em texto Geist Mono, com `junior` em grafite e `hova.` em azul. No tema escuro são usados tons claros. O link da marca continua apontando ao início. A imagem antiga de iniciais não é usada no cabeçalho público.

O estilo da marca foi isolado em `src/Header/wordmark.module.css`, importado diretamente pelo cabeçalho, após o autor relatar ausência das duas cores no navegador. A renderização foi reconferida: grafite/azul no claro e branco azulado/azul claro no escuro, com peso 700.

## Complemento autorizado: sobre, trajetória e roadmap

O autor confirmou ausência de artigos; menu e segundo botão da demonstração deixam de oferecer artigos por enquanto. A rota `/posts` permanece existente, sem reformulação nesta branch.

`content/home-complement.json` preserva o conteúdo editorial dos três novos blocos, aplicado somente à página local `home`: Sobre curto, trajetória inicial e resumo DevOps em oito etapas. São blocos Content nativos, sem novos componentes, campos, dependências ou migrações. Podem ser editados em Pages → Início → Layout. O JSON é referência revisável, não uma migração nem importação automática.

Fontes consultadas em 15/11/2026: https://br.linkedin.com/in/airtonhovajunior/pt e https://roadmap.sh/devops. O LinkedIn bloqueou a leitura direta; o resultado indexado do próprio perfil confirma Qubika, atuação Cloud/DevOps e uma publicação sobre mais de oito anos na Rodobens. Não disponibiliza cargos, períodos e entregas completos. Por isso esta é uma apresentação resumida das duas empresas, sem datas inventadas, cargos atribuídos ou métricas. Não equivale ao histórico completo solicitado; esse detalhamento depende do histórico do perfil.

Roadmap: síntese editorial em português com crédito/link para a fonte, sem reproduzir seu diagrama, criar calendário de semanas ou apresentar progresso pessoal. O mapa completo continua na referência original.

Verificação desta alteração de conteúdo: página local conferida visualmente em 1440, 375 e 320px, sem overflow; seções Sobre mim, Minha trajetória e Roadmap DevOps presentes. Nenhuma alteração de código de aplicação nesta etapa.

## Interações aprovadas

O autor aprovou explicitamente a linha do tempo e o mapa interativo após a descrição das interações da referência. Componentes públicos próprios são necessários porque os blocos padrão do Payload não oferecem esse comportamento; o admin continua nativo. Plano: ampliar as apresentações do Content com timeline e roadmap, campos nativos para período, fotos, categoria e tópicos; linha do tempo com identificação fixa por experiência; mapa com grupos centrais, etapas laterais, expandir/recolher, progresso local e tela cheia com alternativa ampliada. Sem datas, cargos ou fotos fictícios. Critérios: edição nativa, teclado, etapas/grupos com contadores corretos, persistência por tópico, modo ampliado fechado com Escape, nenhuma rolagem horizontal da página em 320px.

### Resultado das interações

As apresentações `timeline` e `roadmap` usam os dados do mesmo bloco Content. Em cada coluna, o primeiro título do texto é o nome da empresa/etapa. Na trajetória, preencha Período e Fotos da experiência quando houver dados reais; as fotos formam uma galeria horizontal com rolagem por toque/teclado. A identificação da empresa permanece fixa enquanto se percorre aquela experiência no desktop; no celular fica acima do texto.

No roadmap, preencha Categoria e Tópicos. Colunas da mesma categoria são agrupadas em um nó central, com etapas alternadas dos dois lados no desktop e uma sequência vertical conectada no celular. A caixa da etapa conclui/desmarca seus tópicos; conclusão parcial é indicada. As setas abrem cada etapa, e Expandir/Recolher tudo controla o conjunto. Há rolagem interna e tela cheia; se a API não estiver disponível, abre um painel ampliado com Escape e contenção do foco. Progresso é local ao navegador, identificado pelo bloco e pelos IDs dos tópicos; salvar/reordenar o conteúdo mantendo os IDs preserva a marcação. Excluir um tópico deixa de contabilizá-lo. Bloqueio de armazenamento não interrompe o uso da página.

A quarta migração, `20261115_235414_home_interactive_sections`, amplia o enum de apresentação e acrescenta campos/tabelas nativos para fotos e tópicos, incluindo versões. Foi aplicada do zero junto às anteriores em `home_interactive_review`, banco PostgreSQL local descartável. Rollback exige antes remover essas apresentações das páginas e versões; há guarda explícita. Faça backup, pois a reversão descarta tópicos/fotos/períodos novos. Os bancos locais anteriores foram preservados.

Verificação final desta implementação: TypeScript passa, 34 testes em sete arquivos passam, lint com zero erros e 13 avisos preexistentes; build de produção passou. Navegador confirmou progresso ao recarregar, conclusão da etapa, expansão/recolhimento, painel ampliado fechado com Escape, ausência de erros de página e de overflow em 1440, 375 e 320px. O histórico continua resumido por falta dos cargos/datas/fotos completos; o formato dinâmico já está disponível para preenchimento. Sem commit, push ou publicação.

## Plano semanal e materiais por tópico

Ajuste solicitado pelo autor: substituir a síntese genérica por 24 semanas, com a ideia de etapas e painel de detalhes da referência. Plano autorizado: manter o componente, acrescentar campos nativos de semana, objetivo, entrega prática e descrição/link de material por tópico; popular 24 semanas com três tópicos cada, ligadas ao roadmap.sh e documentação oficial. A divisão semanal é editorial deste site, não um calendário oficial, parceria ou sincronização com o roadmap.sh. Aceitação: semanas 01–24 visíveis, painel com trilha/descrição/prática/material, anterior/próximo, fechamento por Escape e progresso preservado por ID.

### Resultado: 24 semanas de DevOps

`content/home-complement.json` agora contém 24 semanas e 72 tópicos, em seis grupos: Fundamentos; Automação e contêineres; Entrega e infraestrutura; Nuvem e configuração; Kubernetes e plataforma; Confiabilidade e prática. O plano usa Azure como primeira opção de nuvem e encerra com um laboratório integrador. A sequência e as entregas são propostas editoriais originais, não uma promessa de formação em 24 semanas nem uma programação publicada pelo roadmap.sh.

Cada coluna do Content tem Semana, Objetivo da semana e Entrega prática. Cada tópico tem O que estudar, Nome do material e Link do material. Links aceitam HTTPS sem credenciais. O painel lateral mostra a trilha, o tópico, o objetivo e a prática da semana, material e conclusão; permite anterior/próximo, fechar e Escape, devolvendo foco ao tópico. O link principal para `https://roadmap.sh/devops` fica no cabeçalho, e os materiais apontam ao roadmap.sh ou documentação dos próprios projetos. Não há parceria declarada, incorporação do site, importação automática ou sincronização de progresso. Os links foram consultados em 15/11/2026; o manual Bash foi servido pelo site do mantenedor após bloqueio da consulta ao GNU.

Conexões curvas são recalculadas quando os nós mudam de tamanho, inclusive ao expandir tópicos e redimensionar a janela. No celular o mapa continua uma sequência vertical conectada.

Quinta migração: `20261116_001516_roadmap_weekly_materials`. Acrescenta os campos às tabelas existentes e às versões. A sequência inteira foi aplicada do zero em `home_weekly_migration_check`; a demonstração continuou em `home_interactive_review`, com atualização somente do bloco roadmap e preservação dos outros blocos da home. A troca da síntese de oito etapas pelo novo plano cria novos IDs para as semanas/tópicos; marcações do plano anterior não são transferidas. Edições posteriores devem preservar os IDs para manter o progresso. Rollback da migração descarta os novos textos, links e números de semana; exige backup.

Validação: 36 testes passam, TypeScript sem erros e lint sem erros (13 avisos preexistentes). Navegador confirmou semanas 01 e 24, 72 tópicos, material correto, anterior/próximo, fechamento por Escape, progresso após reload e zero overflow em 320 e 375px. Nenhuma alteração na trajetória nesta revisão.

## Correção após revisão do autor: introduções e links do DevOps Roadmap

O autor pediu conteúdo introdutório seguido de um link para o tópico no próprio `roadmap.sh/devops`, e relatou estilos ausentes e o painel caindo abaixo do mapa. O painel foi simplificado para introdução, link correspondente e conclusão; objetivo semanal e entrega prática continuam nos dados editoriais, mas não são exibidos. Não houve nova migração nem alteração da trajetória.

As 72 introduções foram reescritas como explicações curtas. Os links usam as páginas reais do site oficial, no formato `https://roadmap.sh/devops/<slug>@<node-id>`. Foram extraídos do mapa público e verificados: 32 seções distintas responderam HTTP 200 com seus títulos corretos. Os subtópicos locais sem nó próprio usam a seção correspondente, cujo nome aparece no link (por exemplo, os conceitos de imagem/volume direcionam à seção Docker). Não foram inventadas âncoras ou parâmetros de consulta. A atualização local preservou IDs dos blocos, colunas e tópicos.

O módulo de estilos foi renomeado para `home-interactive.module.css`, para renovar a referência ao arquivo completo após os relatos de estilos parciais na sessão de desenvolvimento. A estrutura também foi reforçada: o mapa usa uma altura limitada e três linhas (cabeçalho, área rolável, rodapé); painel e mapa compartilham a mesma área, e os conectores SVG ficam sempre fora do fluxo. O modo ampliado mantém a mesma estrutura e o conteúdo do painel tem sua própria rolagem. A validação desta correção usa uma prévia compilada em localhost:3100, sem atualização de estilos por HMR.

Regressão de navegador: `pnpm exec playwright test --config playwright.home.config.ts`, com a home configurada e o servidor local já em execução em localhost:3100 (ou `HOME_REVIEW_URL`). Verifica em 1440, 375 e 320px que o painel fica dentro do mapa, não aumenta a página ao abrir, mostra o destino oficial correto e se mantém dentro da tela no modo ampliado. O conjunto antigo de e2e do template continua separado e não é considerado validado por este comando.

Validação concluída da correção: build de produção passou; 36 testes de integração passaram, TypeScript passou e lint ficou sem erros (13 avisos preexistentes). Os três testes de regressão de navegador passaram na prévia compilada em 1440, 375 e 320px, incluindo painel contido e modo ampliado. Capturas finais desktop/celular foram inspecionadas, com introdução curta e link individual correto; nenhuma exceção de página foi observada no Chrome. Safari não foi validado diretamente. A prévia compilada permanece em localhost:3100; sem commit, push, merge ou publicação em produção.
