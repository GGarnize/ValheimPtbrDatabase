# Valheim PT-BR Database

[![Atualizar base do Valheim](https://github.com/GGarnize/ValheimPtbrDatabase/actions/workflows/update-valheim-data.yml/badge.svg)](https://github.com/GGarnize/ValheimPtbrDatabase/actions/workflows/update-valheim-data.yml)

Banco de dados pesquisável de itens do **Valheim**, com nomes oficiais em português do Brasil e comandos de spawn prontos para copiar.

## Recursos

- Pesquisa por nome em português, nome em inglês, prefab ou token.
- Ícones dos itens disponibilizados pelo Jötunn.
- Exibição de nome PT-BR, English Name, Prefab, Token e Type.
- Ajuste de quantidade antes de copiar o comando.
- Geração do comando `spawn <Prefab> <quantidade>`.
- Interface responsiva para computador e celular.
- Base atualizada automaticamente pelo GitHub Actions.

## Como usar

1. Digite parte do nome do item, prefab ou token no campo de pesquisa.
2. Localize o item desejado na lista.
3. Escolha a quantidade.
4. Use o botão de copiar para obter um comando como:

```text
spawn SwordIron 1
```

O comando deve ser usado no console do Valheim com os comandos de desenvolvedor habilitados.

## Fontes dos dados

A base é gerada a partir dos arquivos públicos do projeto [Jötunn](https://valheim-modding.github.io/Jotunn/):

- [Lista de itens e prefabs](https://valheim-modding.github.io/Jotunn/data/objects/item-list.html)
- [Localização Portuguese_Brazilian](https://valheim-modding.github.io/Jotunn/data/localization/translations/Portuguese_Brazilian.html)

O script cruza os prefabs e tokens do Jötunn com a localização oficial em português do Brasil e grava o resultado em `dist/items.json`.

## Atualização automática

O workflow [Atualizar base do Valheim](https://github.com/GGarnize/ValheimPtbrDatabase/actions/workflows/update-valheim-data.yml) é executado diariamente às **07:17, horário de São Paulo**.

A rotina:

1. consulta novamente as fontes do Jötunn;
2. gera a lista de itens;
3. compara o resultado com a base publicada;
4. cria um commit somente quando houver alterações;
5. permite que o Railway faça um novo deploy automaticamente.

Também é possível iniciar a atualização manualmente pela aba **Actions** do GitHub.

## Tecnologias

- HTML, CSS e JavaScript sem framework
- Node.js para geração dos dados
- GitHub Actions para atualização automática
- Caddy como servidor web
- Docker para empacotamento
- Railway para hospedagem pública

## Estrutura do projeto

```text
.
├── .github/
│   └── workflows/
│       └── update-valheim-data.yml
├── dist/
│   ├── index.html
│   └── items.json
├── scripts/
│   └── update-data.mjs
├── Caddyfile
├── Dockerfile
└── README.md
```

## Executar localmente

### Com Docker

```bash
docker build -t valheim-ptbr-database .
docker run --rm -p 3000:3000 -e PORT=3000 valheim-ptbr-database
```

Abra [http://localhost:3000](http://localhost:3000).

O endpoint [http://localhost:3000/health](http://localhost:3000/health) pode ser usado como verificação de saúde.

### Atualizar somente os dados

É necessário ter Node.js 18 ou superior:

```bash
node scripts/update-data.mjs
```

Se a fonte não tiver mudado, o arquivo `dist/items.json` não será regravado.

## Publicar no Railway

1. Crie um projeto no Railway usando **Deploy from GitHub repo**.
2. Selecione este repositório ou um fork.
3. O Railway detectará o `Dockerfile` automaticamente.
4. Em **Settings → Networking**, gere um domínio público.

Não é necessário configurar variáveis de ambiente. Novos commits na branch `main` acionam um novo deploy quando o serviço está com o deploy automático habilitado.

## Aviso

Este é um projeto comunitário e não oficial. Valheim é uma marca da Iron Gate AB. Os dados podem levar algum tempo para refletir mudanças recentes do jogo ou do Jötunn.
