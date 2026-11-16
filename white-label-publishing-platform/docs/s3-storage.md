# Arquivos no S3 com links no domínio do site

Implementação: adaptador oficial `@payloadcms/storage-s3` 3.86.0 na coleção Media.
O admin nativo continua igual. Uploads e exclusões exigem login; os materiais da
coleção Media são públicos para leitura. Não envie documentos confidenciais.

## Configurar no Coolify

Crie um bucket dedicado ao site na AWS, mantendo **Block Public Access** ativado
e **Object Ownership: Bucket owner enforced**. Não é necessário configurar ACL,
CloudFront, VPN, CORS do bucket ou API Gateway: o servidor comunica com o S3 por
HTTPS usando requisições assinadas. Ele precisa de saída HTTPS para a AWS.

Nas Environment Variables da aplicação, configure para **build e runtime**:

| Variável | Valor |
| --- | --- |
| `S3_ENABLED` | `true` |
| `S3_BUCKET` | Nome do bucket dedicado |
| `S3_REGION` | Região, por exemplo `us-east-1` |
| `S3_ACCESS_KEY_ID` | Chave de acesso de uma identidade restrita ao bucket |
| `S3_SECRET_ACCESS_KEY` | Segredo correspondente |

Marque as credenciais como secret/protected. Não use prefixo `NEXT_PUBLIC_`, não
cole credenciais no Git nem em logs. O Dockerfile recebe esses valores durante o
build por BuildKit secrets; o Coolify também precisa injetá-los no container em
runtime. Depois faça um novo deploy. Configuração parcial interrompe a
inicialização em vez de usar armazenamento local silenciosamente.

Exemplo de política IAM para a identidade da aplicação (substitua o nome):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::SEU-BUCKET/*"
    }
  ]
}
```

O exemplo usa a criptografia padrão SSE-S3. Uma chave KMS própria exige permissões
KMS adicionais. Ative versionamento se desejar recuperar objetos substituídos ou
excluídos; versões antigas também ocupam armazenamento.

## Publicar e baixar

1. Abra **Media → Create New** no Payload e envie um PDF.
2. Copie a URL do arquivo e use-a no campo de link de uma página ou artigo.
3. O endereço será `/api/media/file/nome-do-arquivo.pdf`, servido pelo seu próprio
   domínio. O Payload transmite o conteúdo do S3, sem redirecionar para a AWS e
   sem persistir o upload no disco da OCI. O processamento usa memória temporária.
4. Para scripts, prefira um ZIP para distribuir arquivos executáveis como material
   de download. PDFs podem abrir no visualizador do navegador; isso não significa
   que estão armazenados no servidor do site.

O banco PostgreSQL guarda os metadados; os bytes ficam no S3. O tráfego de cada
download passa por AWS → OCI → visitante. Gratuidade depende das franquias de
requisições, armazenamento e transferência da sua conta.

## Arquivos anteriores e verificação

Ativar o adaptador não transfere arquivos antigos. **Antes de ativar em produção**,
preserve `public/media` do container/volume atual e copie todos os arquivos,
incluindo miniaturas, para a raiz do bucket com os mesmos nomes. Não altere o
bucket depois de começar a publicar sem migrar também os objetos.

Verifique após configurar: upload pelo admin; objeto presente no bucket; download
anônimo pela URL do site retornando o mesmo arquivo; acesso direto anônimo ao S3
negado; imagem/miniatura funcionando; persistência depois de reiniciar o container.
Teste apenas com um arquivo descartável antes de publicar materiais reais.
Mantenha backup do banco: perder metadados também prejudica os links do Payload.

Sem variáveis S3, o ambiente de desenvolvimento mantém o comportamento local
anterior. Não há alteração do schema do banco nem migração de conteúdo automática.

Referências: https://payloadcms.com/docs/upload/storage-adapters e
https://docs.aws.amazon.com/AmazonS3/latest/userguide/MakingRequests.html.
