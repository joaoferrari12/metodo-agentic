# metodo-agentic

**Um método de trabalho para pôr software em produção com o Claude Code, em sete skills instaláveis.**

O que torna um agente de IA útil numa base de código de verdade não é o código que ele escreve. É o que
você põe em volta para confiar no que sai: plano com PRONTO que se confere, script que recusa publicar
quando uma regra quebra, bateria de teste que registra o certo e o errado, documentação que não envelhece
calada, e ritmo medido no git em vez de descrito com adjetivo.

[English](README.md)

## Instalar

```text
/plugin marketplace add joaoferrari12/metodo-agentic
/plugin install metodo-agentic@joaoferrari12
```

As skills carregam sob demanda: o Claude escolhe uma quando o pedido casa com a descrição dela, ou você
chama pelo nome (`/metodo-agentic:refusing-guard`). As skills estão em inglês.

## As skills

| Skill | O que faz | Vem com |
|---|---|---|
| [`plan-run`](plugin/skills/plan-run/SKILL.md) | Abre uma *corrida*: um escopo grande construído direto, com um registro curto escrito antes (PRONTO por item, commodity contra decisão de verdade, o que só a pessoa pode fazer) | molde do registro, exemplo |
| [`refusing-guard`](plugin/skills/refusing-guard/SKILL.md) | Troca o "lembre de…" por um script que recusa o commit ou a publicação, visto vermelho antes de valer | `publish-guard.mjs`, molde de pre-commit |
| [`right-and-wrong-battery`](plugin/skills/right-and-wrong-battery/SKILL.md) | Cenários do fluxo inteiro por tipo de pessoa, determinísticos, com relatório de tudo o que está certo **e** errado | `battery.mjs`, 4 cenários de exemplo |
| [`point-dont-repeat`](plugin/skills/point-dont-repeat/SKILL.md) | Fato que muda mora num arquivo só; um verificador recusa fato repetido, link morto e arquivo de estado inchado | `check-docs.mjs`, molde de configuração |
| [`run-verdict`](plugin/skills/run-verdict/SKILL.md) | Fecha com veredito em três baldes: fecha, defeito (conserta agora), escopo novo (próxima corrida) | molde do veredito |
| [`cloud-session-hook`](plugin/skills/cloud-session-hook/SKILL.md) | Faz a sessão do Claude Code na web e no celular começar pronta, sem fazer nada no computador | `session-start.sh`, trecho de settings |
| [`measure-pace`](plugin/skills/measure-pace/SKILL.md) | Duração da corrida pelo git (registro commitado → último commit que o cita), minutos por item, corridas por dia | `pace.mjs` |

Todo script é Node puro, sem dependência, de propósito: verificador que precisa instalar para de rodar.

## De onde veio

Construí enquanto punha no ar, sozinho, um SaaS multiempresa para pequenos negócios de serviço, com o
Claude Code digitando a maior parte, desde julho de 2026. Os números, medidos nos repositórios desse
produto em 03/10/2026:

| | | Como foi medido |
|---|---:|---|
| Registros de decisão | 208 | `ls docs/adr \| grep -c ADR-` |
| Migrações de banco | 133 | contagem dos arquivos de migração |
| Arquivos de teste | 305 | arquivos de teste do app web |
| Commits em setembro de 2026 | 1.231 | `git log --since=2026-09-01 --until=2026-10-01`, três repositórios |
| Minutos por item, um agente sozinho | 4 a 12 | `measure-pace` |
| Minutos por item, com um segundo agente no terminal | 14 a 17 | `measure-pace` |

Cada skill abre com o incidente que a tornou necessária. Os exemplos foram reescritos com negócios
inventados; nenhum código, esquema ou dado do produto está neste repositório, e uma guarda
(`tools/check-leaks.mjs`) recusa qualquer commit que traria isso para cá.

## Medir

`plugin/evals/` tem um caso por skill: um pedido realista que não diz o nome da skill, a conferência de
que ela disparou e uma régua curta para a resposta. Com o Claude Code 2.1.269 ou mais novo:

```bash
claude plugin eval plugin
```

Roda cada caso com e sem o plugin e mostra a diferença. Gasta a cota do plano ou crédito de API.

Última rodada (03/10/2026, Claude Code 2.1.285, 3 execuções por caso, `--judge-model sonnet`, cerca de US$ 4
a preço de tabela): **21 de 21 passam com o plugin, 11 de 21 sem ele**, e a skill certa disparou em 21 de 21.
As duas rodadas anteriores ensinaram uma coisa: com a pasta vazia, as skills faziam o Claude parar e pedir o
projeto em vez de responder, então os pedidos agora trazem o próprio contexto.

## Licença

Ainda não escolhida. Até existir um arquivo `LICENSE`, todos os direitos são reservados.
