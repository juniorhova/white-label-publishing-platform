# Deploy automático pelo webhook do GitHub

O webhook manual deste projeto usa o Content type `application/json` no GitHub.
O evento `push` gerado ao integrar um PR na `main` deve iniciar o deploy da
aplicação correspondente no Coolify, configurada para acompanhar essa branch.

Depois de alterar o webhook, valide com um novo merge:

1. Em GitHub → Settings → Webhooks → Recent Deliveries, confira a entrega do
   evento `push` para `refs/heads/main` e a resposta do Coolify.
2. No Coolify, confirme que um deploy foi iniciado e que o commit usado é o novo
   commit da `main`. Uma entrega aceita não garante que o build terminou.
3. Após o deploy, abra `/admin` em uma janela anônima e confirme que o formulário
   de login aparece. A correção do registro de componentes S3 já está na `main`.

Não registre a URL privada do webhook, tokens ou segredos neste documento.
