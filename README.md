# test-coding-agent

Une petite API NestJS de gestion de tâches, qui sert de **projet de test** au [coding agent](https://github.com/fpasquet/coding-agent) : l'agent y implémente des tickets et ouvre des pull requests.

Le projet est volontairement simple, avec quelques défauts connus, décrits dans les tickets du dépôt : une tâche introuvable qui répond `200`, une création sans validation, une liste sans pagination.

## L'API

Les tâches sont gardées en mémoire : elles disparaissent à l'arrêt de l'application.

| Méthode  | Route        | Rôle                                                     |
| -------- | ------------ | -------------------------------------------------------- |
| `GET`    | `/tasks`     | Liste les tâches, dans l'ordre de création.              |
| `GET`    | `/tasks/:id` | Lit une tâche.                                           |
| `POST`   | `/tasks`     | Crée une tâche : `{ "title": "…", "description": "…" }`. |
| `PATCH`  | `/tasks/:id` | Modifie une tâche : `title`, `description`, `done`.      |
| `DELETE` | `/tasks/:id` | Supprime une tâche.                                      |

## Développer

Node.js 24 ou plus.

```bash
npm install
npm run start:dev     # http://localhost:3000/tasks
npm test              # tests unitaires (Vitest)
npm run test:e2e      # tests e2e (Vitest + supertest)
npm run lint          # oxlint
npm run build
```

Le code des tâches est dans `src/tasks/` ; les tests unitaires sont à côté du code (`*.spec.ts`), les tests e2e dans `test/`.
