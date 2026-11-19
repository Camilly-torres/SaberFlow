import os
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Session
from passlib.context import CryptContext

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./saberflow.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- MODELOS ---
class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    senha_hash = Column(String, nullable=False)
    meta_diaria = Column(Integer, default=3)

class Disciplina(Base):
    __tablename__ = "disciplinas"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    nome = Column(String, nullable=False)
    topicos = relationship("Topico", back_populates="disciplina", cascade="all, delete-orphan")

class Topico(Base):
    __tablename__ = "topicos"
    id = Column(Integer, primary_key=True, index=True)
    disciplina_id = Column(Integer, ForeignKey("disciplinas.id"), nullable=False)
    titulo = Column(String, nullable=False)
    data_estudo_inicial = Column(DateTime, default=datetime.utcnow)
    disciplina = relationship("Disciplina", back_populates="topicos")
    ciclos = relationship("CicloRevisao", back_populates="topico", cascade="all, delete-orphan")

class CicloRevisao(Base):
    __tablename__ = "ciclos_revisao"
    id = Column(Integer, primary_key=True, index=True)
    topico_id = Column(Integer, ForeignKey("topicos.id"), nullable=False)
    intervalo_dias = Column(Integer, nullable=False)
    data_prevista = Column(DateTime, nullable=False)
    data_realizada = Column(DateTime, nullable=True)
    status = Column(String, default="Pendente")
    topico = relationship("Topico", back_populates="ciclos")

Base.metadata.create_all(bind=engine)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- SCHEMAS ---
class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str

class LoginRequest(BaseModel):
    email: EmailStr
    senha: str

class RedefinirSenhaRequest(BaseModel):
    email: EmailStr
    nova_senha: str

class MetaUpdate(BaseModel):
    meta_diaria: int

class DisciplinaCreateSchema(BaseModel):
    nome: str
    usuario_id: int
    topico_titulo: str
    data_inicial: Optional[str] = None
    ciclos: List[int] = [1, 7, 15, 30]

class DisciplinaUpdateSchema(BaseModel):
    nome: str
    topico_titulo: str
    data_inicial: Optional[str] = None
    ciclos: List[int] = [1, 7, 15, 30]

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI(title="SaberFlow API", version="1.1.0")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

# --- AUTENTICAÇÃO ---
@app.post("/auth/cadastro")
def cadastrar(user: UsuarioCreate, db: Session = Depends(get_db)):
    if db.query(Usuario).filter(Usuario.email == user.email).first():
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")
    novo = Usuario(nome=user.nome, email=user.email, senha_hash=pwd_context.hash(user.senha))
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return {"id": novo.id, "nome": novo.nome, "email": novo.email, "meta_diaria": novo.meta_diaria}

@app.post("/auth/login")
def login(dados: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == dados.email).first()
    if not user or not pwd_context.verify(dados.senha, user.senha_hash):
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos.")
    return {"id": user.id, "nome": user.nome, "email": user.email, "meta_diaria": user.meta_diaria}

@app.put("/auth/redefinir-senha")
def redefinir_senha(dados: RedefinirSenhaRequest, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == dados.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="E-mail não encontrado.")
    user.senha_hash = pwd_context.hash(dados.nova_senha)
    db.commit()
    return {"mensagem": "Senha redefinida com sucesso!"}

# --- USUÁRIO ---
@app.put("/usuarios/{usuario_id}/meta")
def atualizar_meta(usuario_id: int, dados: MetaUpdate, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    user.meta_diaria = dados.meta_diaria
    db.commit()
    return {"meta_diaria": user.meta_diaria}

# --- DISCIPLINAS & TÓPICOS ---
@app.post("/disciplinas/")
def criar_disciplina_completa(dados: DisciplinaCreateSchema, db: Session = Depends(get_db)):
    nova_disc = Disciplina(nome=dados.nome, usuario_id=dados.usuario_id)
    db.add(nova_disc)
    db.commit()
    db.refresh(nova_disc)

    data_base = datetime.strptime(dados.data_inicial, "%Y-%m-%d") if dados.data_inicial else datetime.utcnow()
    novo_topico = Topico(titulo=dados.topico_titulo, disciplina_id=nova_disc.id, data_estudo_inicial=data_base)
    db.add(novo_topico)
    db.commit()
    db.refresh(novo_topico)

    for dias in dados.ciclos:
        db.add(CicloRevisao(topico_id=novo_topico.id, intervalo_dias=dias, data_prevista=data_base + timedelta(days=dias)))
    db.commit()
    return {"id": nova_disc.id, "nome": nova_disc.nome}

@app.get("/disciplinas/{usuario_id}")
def listar_disciplinas(usuario_id: int, db: Session = Depends(get_db)):
    discs = db.query(Disciplina).filter(Disciplina.usuario_id == usuario_id).all()
    resultado = []
    for d in discs:
        topico = d.topicos[0] if d.topicos else None
        ciclos_ativos = sorted(list({c.intervalo_dias for t in d.topicos for c in t.ciclos}))
        resultado.append({
            "id": d.id,
            "nome": d.nome,
            "topico_titulo": topico.titulo if topico else "",
            "data_inicial": topico.data_estudo_inicial.strftime("%Y-%m-%d") if topico and topico.data_estudo_inicial else datetime.utcnow().strftime("%Y-%m-%d"),
            "total_topicos": len(d.topicos),
            "ciclos_ativos": ciclos_ativos if ciclos_ativos else [1, 7, 15, 30]
        })
    return resultado

@app.put("/disciplinas/{disc_id}")
def editar_disciplina(disc_id: int, dados: DisciplinaUpdateSchema, db: Session = Depends(get_db)):
    db_disc = db.query(Disciplina).filter(Disciplina.id == disc_id).first()
    if not db_disc:
        raise HTTPException(status_code=404, detail="Disciplina não encontrada.")
    
    db_disc.nome = dados.nome
    data_base = datetime.strptime(dados.data_inicial, "%Y-%m-%d") if dados.data_inicial else datetime.utcnow()

    if db_disc.topicos:
        topico = db_disc.topicos[0]
        topico.titulo = dados.topico_titulo
        topico.data_estudo_inicial = data_base

        # ATUALIZA CICLOS PENDENTES 
        ciclos_existentes = {c.intervalo_dias: c for c in topico.ciclos}
        for dias, ciclo_obj in list(ciclos_existentes.items()):
            if dias not in dados.ciclos and ciclo_obj.status == "Pendente":
                db.delete(ciclo_obj)
            elif dias in dados.ciclos and ciclo_obj.status == "Pendente":
                ciclo_obj.data_prevista = data_base + timedelta(days=dias)

        for dias in dados.ciclos:
            if dias not in ciclos_existentes:
                db.add(CicloRevisao(topico_id=topico.id, intervalo_dias=dias, data_prevista=data_base + timedelta(days=dias)))

    db.commit()
    return {"mensagem": "Disciplina atualizada com sucesso!"}

@app.delete("/disciplinas/{disc_id}")
def excluir_disciplina(disc_id: int, db: Session = Depends(get_db)):
    db_disc = db.query(Disciplina).filter(Disciplina.id == disc_id).first()
    if not db_disc:
        raise HTTPException(status_code=404, detail="Disciplina não encontrada.")
    db.delete(db_disc)
    db.commit()
    return {"mensagem": "Disciplina excluída com sucesso."}

# --- REVISÕES E HISTÓRICO ---
@app.get("/revisoes/{usuario_id}")
def listar_revisoes(usuario_id: int, db: Session = Depends(get_db)):
    resultados = (
        db.query(CicloRevisao, Topico, Disciplina)
        .join(Topico, CicloRevisao.topico_id == Topico.id)
        .join(Disciplina, Topico.disciplina_id == Disciplina.id)
        .filter(Disciplina.usuario_id == usuario_id)
        .all()
    )
    hoje_data = datetime.utcnow().date()
    pendentes, historico = [], []

    for ciclo, topico, disc in resultados:
        prev_data = ciclo.data_prevista.date()
        if ciclo.status == "Pendente":
            if prev_data < hoje_data:
                status_calc = "Atrasado"
            elif prev_data == hoje_data:
                status_calc = "Hoje"
            else:
                status_calc = "Pendente"
        else:
            status_calc = "Concluída"

        item = {
            "ciclo_id": ciclo.id,
            "disciplina": disc.nome,
            "topico": topico.titulo,
            "intervalo_dias": ciclo.intervalo_dias,
            "data_prevista": ciclo.data_prevista.strftime("%d/%m/%Y"),
            "data_realizada": ciclo.data_realizada.strftime("%d/%m/%Y") if ciclo.data_realizada else None,
            "status": status_calc
        }
        if ciclo.status == "Pendente":
            pendentes.append(item)
        else:
            historico.append(item)

    return {"pendentes": pendentes, "historico": historico}

@app.put("/revisoes/concluir/{ciclo_id}")
def concluir_revisao(ciclo_id: int, db: Session = Depends(get_db)):
    ciclo = db.query(CicloRevisao).filter(CicloRevisao.id == ciclo_id).first()
    if not ciclo:
        raise HTTPException(status_code=404, detail="Revisão não encontrada.")
    ciclo.status = "Concluída"
    ciclo.data_realizada = datetime.utcnow()
    db.commit()
    return {"mensagem": "Revisão concluída!"}

@app.put("/revisoes/adiar/{ciclo_id}")
def adiar_revisao(ciclo_id: int, db: Session = Depends(get_db)):
    ciclo = db.query(CicloRevisao).filter(CicloRevisao.id == ciclo_id).first()
    if not ciclo:
        raise HTTPException(status_code=404, detail="Revisão não encontrada.")
    ciclo.data_prevista = ciclo.data_prevista + timedelta(days=7)
    db.commit()
    return {"mensagem": "Revisão adiada em 7 dias!"}