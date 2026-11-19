# SaberFlow — Plataforma de Estudos e Revisões

Plataforma web full-stack desenvolvida para otimizar o aprendizado e a memorização por meio da técnica de revisão espaçada, com ciclos automáticos de revisão, gestão de estudos e organização de flashcards.

## Links da Aplicação
- Front-end (GitHub Pages): https://camilly-torres.github.io/SaberFlow/
- Back-end / API (Render): https://saberflow-api-lpna.onrender.com
- Documentação Interativa (Swagger UI): https://saberflow-api-lpna.onrender.com/docs
- Repositório no GitHub: https://github.com/Camilly-torres/SaberFlow

Observação: Como a API está hospedada no plano gratuito do Render, a primeira requisição após um período sem uso pode demorar alguns segundos para iniciar o serviço.

## Tecnologias Utilizadas
- Back-end: Python, FastAPI, Uvicorn, SQLAlchemy, Pydantic, email-validator, Passlib (1.7.4) e Bcrypt (4.0.1).
- Banco de dados: PostgreSQL (com `psycopg[binary]`) em produção e SQLite para uso local.
- Front-end: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5 e Font Awesome.
- Hospedagem e deploy: Render (API e banco de dados) e GitHub Pages (front-end).

## Execução Local
Para rodar o projeto na máquina, basta clonar o repositório `https://github.com/Camilly-torres/SaberFlow.git`, entrar na pasta `SaberFlow`, criar e ativar um ambiente virtual Python (`.venv`) e instalar as dependências com `pip install -r requirements.txt`. A configuração do banco de dados deve ser feita sem versionar credenciais reais no repositório (usando variável de ambiente `DATABASE_URL` para PostgreSQL ou banco SQLite local `saberflow.db`), com criação automática das tabelas pelo SQLAlchemy ao iniciar a aplicação. Em seguida, sobe-se o servidor com `uvicorn main:app --reload` (acessível em `http://127.0.0.1:8000` e Swagger em `http://127.0.0.1:8000/docs`) e abre-se o `index.html` no navegador ou via Live Server no VS Code, ajustando temporariamente a `API_URL` no `app.js` para `http://127.0.0.1:8000` durante os testes locais e retornando para `https://saberflow-api-lpna.onrender.com` antes de publicar no GitHub Pages.

## Estrutura do Projeto e Análise do Código
- `main.py`: Define a aplicação FastAPI, modelos do banco de dados com SQLAlchemy, validação de dados com Pydantic, hash de senhas e rotas da API.
- `requirements.txt`: Lista de bibliotecas e dependências Python do projeto.
- `index.html`, `style.css` e `app.js`: Interface web e integração com os endpoints do back-end.
- `.gitignore`: Evita o versionamento de arquivos locais, cache e dados sensíveis.