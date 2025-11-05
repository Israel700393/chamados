// API Backend para Sistema de Chamados - FUNDAÇÃO UNISELVA
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'uniselva-chamados-secret-2024';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Data files
const DATA_DIR = './data';
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CHAMADOS_FILE = path.join(DATA_DIR, 'chamados.json');

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// Initialize default data
async function initializeData() {
    await ensureDataDir();

    // Initialize users if file doesn't exist
    try {
        await fs.access(USERS_FILE);
    } catch {
        const defaultUsers = {
            'breno': {
                senha: await bcrypt.hash('admin123', 10),
                nome: 'Breno',
                setor: 'NPD',
                email: 'breno@uniselva.org.br',
                role: 'admin',
                ativo: true
            },
            'felix': {
                senha: await bcrypt.hash('npd2024', 10),
                nome: 'felix',
                setor: 'NPD',
                email: 'felix.suporte@uniselva.org.br',
                role: 'tecnico',
                ativo: true
            },
            'beto.jr': {
                senha: await bcrypt.hash('beto1425', 10),
                nome: 'Beto jr',
                setor: 'NPD',
                email: 'beto.jr@uniselva.org.br',
                role: 'admin',
                ativo: true
            },
            'andre.santos': {
                senha: await bcrypt.hash('123456', 10),
                nome: 'Andre Santos',
                setor: 'NPD',
                email: 'maria.santos@uniselva.org.br',
                role: 'admin',
                ativo: true
            },
            'israel.rangel': {
                senha: await bcrypt.hash('israel123', 10),
                nome: 'Israel Rangel',
                setor: 'Projetos',
                email: 'israel.peres@uniselva.org.br',
                role: 'user',
                ativo: true
            }
        };

        await fs.writeFile(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
    }

    // Initialize chamados if file doesn't exist
    try {
        await fs.access(CHAMADOS_FILE);
    } catch {
        await fs.writeFile(CHAMADOS_FILE, JSON.stringify([], null, 2));
    }
}

//  Helper functions
async function readUsers() {
    try {
        const data = await fs.readFile(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        return {};
    }
}

async function readChamados() {
    try {
        const data = await fs.readFile(CHAMADOS_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

async function saveChamados(chamados) {
    await fs.writeFile(CHAMADOS_FILE, JSON.stringify(chamados, null, 2));
}

// Middleware de autenticação
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token de acesso requerido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
}

// Generate unique IDs
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function generateProtocolo() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    return `UNISELVA-${year}${month}${day}-${time}${random}`;
}

// Routes

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { usuario, senha } = req.body;

        if (!usuario || !senha) {
            return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
        }

        const users = await readUsers();
        const user = users[usuario];

        if (!user || !user.ativo) {
            return res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
        }

        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) {
            return res.status(401).json({ error: 'Senha incorreta' });
        }

        const token = jwt.sign(
            {
                username: usuario,
                nome: user.nome,
                setor: user.setor,
                role: user.role,
                email: user.email
            },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            user: {
                username: usuario,
                nome: user.nome,
                setor: user.setor,
                role: user.role,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Criar novo chamado
app.post('/api/chamados', authenticateToken, async (req, res) => {
    try {
        const {
            titulo,
            descricao,
            categoria,
            prioridade,
            setor,
            telefone
        } = req.body;

        // Validação
        if (!titulo || !descricao || !categoria || !prioridade || !setor) {
            return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
        }

        const chamados = await readChamados();

        const novoChamado = {
            id: generateId(),
            protocolo: generateProtocolo(),
            titulo: titulo.trim(),
            descricao: descricao.trim(),
            categoria,
            prioridade,
            setor,
            telefone: telefone || '',
            usuario: req.user.username,
            nomeUsuario: req.user.nome,
            emailUsuario: req.user.email,
            status: 'aberto',
            dataAbertura: new Date().toISOString(),
            dataUltimaAtualizacao: new Date().toISOString(),
            historico: [{
                data: new Date().toISOString(),
                acao: 'Chamado criado',
                usuario: req.user.nome,
                detalhes: 'Chamado aberto pelo usuário'
            }]
        };

        chamados.push(novoChamado);
        await saveChamados(chamados);

        res.status(201).json({
            message: 'Chamado criado com sucesso',
            chamado: novoChamado
        });

    } catch (error) {
        console.error('Erro ao criar chamado:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Listar chamados
app.get('/api/chamados', authenticateToken, async (req, res) => {
    try {
        const chamados = await readChamados();

        // Se for NPD, pode ver todos os chamados
        // Caso contrário, só vê os próprios chamados
        const chamadosFiltrados = req.user.setor === 'NPD'
            ? chamados
            : chamados.filter(c => c.usuario === req.user.username);

        // Ordenar por data (mais recentes primeiro)
        chamadosFiltrados.sort((a, b) => new Date(b.dataAbertura) - new Date(a.dataAbertura));

        res.json(chamadosFiltrados);

    } catch (error) {
        console.error('Erro ao listar chamados:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Buscar chamado por ID
app.get('/api/chamados/:id', authenticateToken, async (req, res) => {
    try {
        const chamados = await readChamados();
        const chamado = chamados.find(c => c.id === req.params.id);

        if (!chamado) {
            return res.status(404).json({ error: 'Chamado não encontrado' });
        }

        // Verificar permissão
        if (req.user.setor !== 'NPD' && chamado.usuario !== req.user.username) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        res.json(chamado);

    } catch (error) {
        console.error('Erro ao buscar chamado:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Atualizar status do chamado (apenas NPD)
app.patch('/api/chamados/:id/status', authenticateToken, async (req, res) => {
    try {
        if (req.user.setor !== 'NPD') {
            return res.status(403).json({ error: 'Apenas a equipe NPD pode alterar o status' });
        }

        const { status, observacao } = req.body;
        const statusValidos = ['aberto', 'andamento', 'aguardando', 'resolvido', 'fechado'];

        if (!statusValidos.includes(status)) {
            return res.status(400).json({ error: 'Status inválido' });
        }

        const chamados = await readChamados();
        const chamadoIndex = chamados.findIndex(c => c.id === req.params.id);

        if (chamadoIndex === -1) {
            return res.status(404).json({ error: 'Chamado não encontrado' });
        }

        const chamado = chamados[chamadoIndex];
        const statusAnterior = chamado.status;

        chamado.status = status;
        chamado.dataUltimaAtualizacao = new Date().toISOString();

        // Adicionar ao histórico
        chamado.historico.push({
            data: new Date().toISOString(),
            acao: `Status alterado de "${statusAnterior}" para "${status}"`,
            usuario: req.user.nome,
            detalhes: observacao || 'Sem observações'
        });

        chamados[chamadoIndex] = chamado;
        await saveChamados(chamados);

        res.json({
            message: 'Status atualizado com sucesso',
            chamado
        });

    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Adicionar comentário ao chamado
app.post('/api/chamados/:id/comentarios', authenticateToken, async (req, res) => {
    try {
        const { comentario } = req.body;

        if (!comentario || !comentario.trim()) {
            return res.status(400).json({ error: 'Comentário é obrigatório' });
        }

        const chamados = await readChamados();
        const chamadoIndex = chamados.findIndex(c => c.id === req.params.id);

        if (chamadoIndex === -1) {
            return res.status(404).json({ error: 'Chamado não encontrado' });
        }

        const chamado = chamados[chamadoIndex];

        // Verificar permissão
        if (req.user.setor !== 'NPD' && chamado.usuario !== req.user.username) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        if (!chamado.comentarios) {
            chamado.comentarios = [];
        }

        const novoComentario = {
            id: generateId(),
            texto: comentario.trim(),
            usuario: req.user.nome,
            data: new Date().toISOString(),
            isNPD: req.user.setor === 'NPD'
        };

        chamado.comentarios.push(novoComentario);
        chamado.dataUltimaAtualizacao = new Date().toISOString();

        // Adicionar ao histórico
        chamado.historico.push({
            data: new Date().toISOString(),
            acao: 'Comentário adicionado',
            usuario: req.user.nome,
            detalhes: comentario.trim()
        });

        chamados[chamadoIndex] = chamado;
        await saveChamados(chamados);

        res.json({
            message: 'Comentário adicionado com sucesso',
            comentario: novoComentario
        });

    } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Estatísticas (dashboard)
app.get('/api/estatisticas', authenticateToken, async (req, res) => {
    try {
        const chamados = await readChamados();

        // Filtrar chamados baseado no usuário
        const chamadosFiltrados = req.user.setor === 'NPD'
            ? chamados
            : chamados.filter(c => c.usuario === req.user.username);

        const stats = {
            total: chamadosFiltrados.length,
            abertos: chamadosFiltrados.filter(c => c.status === 'aberto').length,
            andamento: chamadosFiltrados.filter(c => c.status === 'andamento').length,
            aguardando: chamadosFiltrados.filter(c => c.status === 'aguardando').length,
            resolvidos: chamadosFiltrados.filter(c => c.status === 'resolvido').length,
            fechados: chamadosFiltrados.filter(c => c.status === 'fechado').length
        };

        // Estatísticas por categoria (apenas para NPD)
        if (req.user.setor === 'NPD') {
            const categorias = {};
            chamados.forEach(c => {
                categorias[c.categoria] = (categorias[c.categoria] || 0) + 1;
            });
            stats.categorias = categorias;

            // Estatísticas por prioridade
            const prioridades = {};
            chamados.forEach(c => {
                prioridades[c.prioridade] = (prioridades[c.prioridade] || 0) + 1;
            });
            stats.prioridades = prioridades;
        }

        res.json(stats);

    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Sistema de Chamados UNISELVA'
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint não encontrado' });
});

// Initialize and start server
async function startServer() {
    try {
        await initializeData();

        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`📊 API disponível em http://localhost:${PORT}/api`);
            console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('Erro ao inicializar servidor:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;