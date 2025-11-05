// Sistema de Chamados Funcional - FUNDAÇÃO UNISELVA
class SistemaChamadosFuncional {
    constructor() {
        this.currentUser = null;
        this.chamados = JSON.parse(localStorage.getItem('chamados_funcional')) || [];
        this.users = {
            'breno': { senha: 'admin123', nome: 'Breno', setor: 'NPD', role: 'admin' },
            'felix': { senha: 'npd2024', nome: 'Felix', setor: 'NPD', role: 'tecnico' },
            'beto.jr': { senha: 'beto1425', nome: 'Beto Jr', setor: 'NPD', role: 'admin' },
            'andre.santos': { senha: '123456', nome: 'Andre Santos', setor: 'NPD', role: 'admin' },
            'israel.rangel': { senha: 'israel123', nome: 'Israel Rangel', setor: 'Projetos', role: 'user' }
        };
        
        this.currentChamadoId = null;
        this.init();
    }

    init() {
        console.log('🚀 Inicializando Sistema de Chamados...');
        this.bindEvents();
        this.checkAuthStatus();
        this.createDemoData();
        this.updateStats();
        console.log('✅ Sistema inicializado com sucesso!');
    }

    bindEvents() {
        console.log('🔗 Configurando eventos...');
        
        // Login Modal
        const loginBtn = document.getElementById('loginBtn');
        const loginModal = document.getElementById('loginModal');
        const loginForm = document.getElementById('loginForm');
        const logoutBtn = document.getElementById('logoutBtn');
        
        // Navigation
        const novoChamadoBtn = document.getElementById('novoChamadoBtn');
        const meusChamadosBtn = document.getElementById('meusChamadosBtn');
        const gerenciarChamadosBtn = document.getElementById('gerenciarChamadosBtn');
        const voltarDashboard = document.getElementById('voltarDashboard');
        const voltarDashboardGerenciar = document.getElementById('voltarDashboardGerenciar');
        
        // Forms
        const chamadoForm = document.getElementById('chamadoForm');
        const statusForm = document.getElementById('statusForm');
        
        // Modals
        const successModal = document.getElementById('successModal');
        const statusModal = document.getElementById('statusModal');
        const okBtn = document.getElementById('okBtn');
        const cancelarStatus = document.getElementById('cancelarStatus');
        
        // Close buttons
        const closeButtons = document.querySelectorAll('.close');

        // Event Listeners
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                console.log('🔐 Abrindo modal de login...');
                this.showModal(loginModal);
            });
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                console.log('👋 Fazendo logout...');
                this.logout();
            });
        }
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                console.log('📝 Processando login...');
                this.handleLogin(e);
            });
        }
        
        if (novoChamadoBtn) {
            novoChamadoBtn.addEventListener('click', () => {
                console.log('➕ Abrindo formulário de novo chamado...');
                this.showNovoChamado();
            });
        }
        
        if (meusChamadosBtn) {
            meusChamadosBtn.addEventListener('click', () => {
                console.log('📋 Mostrando meus chamados...');
                this.showMeusChamados();
            });
        }
        
        if (gerenciarChamadosBtn) {
            gerenciarChamadosBtn.addEventListener('click', () => {
                console.log('⚙️ Abrindo gerenciamento de chamados...');
                this.showGerenciarChamados();
            });
        }
        
        if (voltarDashboard) {
            voltarDashboard.addEventListener('click', () => {
                console.log('🏠 Voltando ao dashboard...');
                this.showDashboard();
            });
        }
        
        if (voltarDashboardGerenciar) {
            voltarDashboardGerenciar.addEventListener('click', () => {
                console.log('🏠 Voltando ao dashboard...');
                this.showDashboard();
            });
        }
        
        if (chamadoForm) {
            chamadoForm.addEventListener('submit', (e) => {
                console.log('📤 Enviando novo chamado...');
                this.handleNovoChamado(e);
            });
        }
        
        if (statusForm) {
            statusForm.addEventListener('submit', (e) => {
                console.log('🔄 Atualizando status...');
                this.handleStatusUpdate(e);
            });
        }
        
        if (okBtn) {
            okBtn.addEventListener('click', () => {
                this.hideModal(successModal);
                this.showDashboard();
            });
        }
        
        if (cancelarStatus) {
            cancelarStatus.addEventListener('click', () => {
                this.hideModal(statusModal);
            });
        }
        
        // Close buttons
        closeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal);
            });
        });

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target);
            }
        });
        
        console.log('✅ Eventos configurados!');
    }

    showModal(modal) {
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal(modal) {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    handleLogin(e) {
        e.preventDefault();
        
        const usuario = document.getElementById('usuario').value.trim();
        const senha = document.getElementById('senha').value;
        
        console.log(`🔍 Tentando login para: ${usuario}`);
        
        if (this.users[usuario] && this.users[usuario].senha === senha) {
            this.currentUser = {
                username: usuario,
                ...this.users[usuario]
            };
            
            localStorage.setItem('currentUser_funcional', JSON.stringify(this.currentUser));
            
            this.hideModal(document.getElementById('loginModal'));
            this.showDashboard();
            this.updateAuthUI();
            
            // Reset form
            document.getElementById('loginForm').reset();
            
            this.showAlert(`Bem-vindo, ${this.currentUser.nome}!`, 'success');
            console.log('✅ Login realizado com sucesso!');
        } else {
            this.showAlert('Usuário ou senha incorretos!', 'error');
            console.log('❌ Login falhou!');
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser_funcional');
        this.updateAuthUI();
        this.showWelcome();
        this.showAlert('Logout realizado com sucesso!', 'success');
        console.log('👋 Logout realizado!');
    }

    checkAuthStatus() {
        const savedUser = localStorage.getItem('currentUser_funcional');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showDashboard();
            this.updateAuthUI();
            console.log(`🔐 Usuário logado: ${this.currentUser.nome}`);
        } else {
            this.showWelcome();
            console.log('👤 Nenhum usuário logado');
        }
    }

    updateAuthUI() {
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const userWelcome = document.getElementById('userWelcome');
        const gerenciarChamadosBtn = document.getElementById('gerenciarChamadosBtn');
        
        if (this.currentUser) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'inline-flex';
            if (userWelcome) {
                userWelcome.textContent = `Bem-vindo, ${this.currentUser.nome}`;
            }
            
            // Mostrar botão de gerenciar apenas para NPD
            if (gerenciarChamadosBtn) {
                gerenciarChamadosBtn.style.display = this.currentUser.setor === 'NPD' ? 'inline-flex' : 'none';
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'inline-flex';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (userWelcome) {
                userWelcome.textContent = '';
            }
            if (gerenciarChamadosBtn) {
                gerenciarChamadosBtn.style.display = 'none';
            }
        }
    }

    showWelcome() {
        this.hideAllSections();
        const welcomeSection = document.getElementById('welcomeSection');
        if (welcomeSection) {
            welcomeSection.style.display = 'block';
        }
    }

    showDashboard() {
        if (!this.currentUser) {
            this.showWelcome();
            return;
        }
        
        this.hideAllSections();
        const dashboardSection = document.getElementById('dashboardSection');
        if (dashboardSection) {
            dashboardSection.style.display = 'block';
        }
        this.loadChamados();
        this.updateStats();
    }

    showNovoChamado() {
        if (!this.currentUser) {
            this.showWelcome();
            return;
        }
        
        this.hideAllSections();
        const novoChamadoSection = document.getElementById('novoChamadoSection');
        if (novoChamadoSection) {
            novoChamadoSection.style.display = 'block';
        }
    }

    showMeusChamados() {
        this.showDashboard();
        // Scroll to chamados list
        setTimeout(() => {
            const container = document.querySelector('.chamados-container');
            if (container) {
                container.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    }

    showGerenciarChamados() {
        if (!this.currentUser || this.currentUser.setor !== 'NPD') {
            this.showAlert('Acesso negado. Apenas a equipe NPD pode gerenciar chamados.', 'error');
            return;
        }
        
        this.hideAllSections();
        const gerenciarSection = document.getElementById('gerenciarChamadosSection');
        if (gerenciarSection) {
            gerenciarSection.style.display = 'block';
        }
        this.loadChamadosGerenciar();
    }

    hideAllSections() {
        const sections = [
            'welcomeSection',
            'dashboardSection', 
            'novoChamadoSection',
            'gerenciarChamadosSection'
        ];
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'none';
            }
        });
    }

    handleNovoChamado(e) {
        e.preventDefault();
        
        if (!this.currentUser) {
            this.showAlert('Você precisa estar logado para abrir um chamado!', 'error');
            return;
        }

        // Verificar se todos os campos obrigatórios estão preenchidos
        const categoria = document.getElementById('categoria').value;
        const prioridade = document.getElementById('prioridade').value;
        const titulo = document.getElementById('titulo').value.trim();
        const descricao = document.getElementById('descricao').value.trim();
        const setor = document.getElementById('setor').value;
        const telefone = document.getElementById('telefone').value.trim();

        if (!categoria || !prioridade || !titulo || !descricao || !setor) {
            this.showAlert('Por favor, preencha todos os campos obrigatórios!', 'error');
            return;
        }

        const chamado = {
            id: this.generateId(),
            protocolo: this.generateProtocolo(),
            titulo: titulo,
            descricao: descricao,
            categoria: categoria,
            prioridade: prioridade,
            setor: setor,
            telefone: telefone,
            usuario: this.currentUser.username,
            nomeUsuario: this.currentUser.nome,
            status: 'aberto',
            dataAbertura: new Date().toISOString(),
            dataUltimaAtualizacao: new Date().toISOString(),
            historico: [{
                data: new Date().toISOString(),
                acao: 'Chamado criado',
                usuario: this.currentUser.nome,
                detalhes: 'Chamado aberto pelo usuário'
            }],
            comentarios: []
        };

        this.chamados.push(chamado);
        this.saveChamados();
        
        // Show success modal
        const protocoloElement = document.getElementById('protocoloNumero');
        if (protocoloElement) {
            protocoloElement.textContent = chamado.protocolo;
        }
        this.showModal(document.getElementById('successModal'));
        
        // Reset form
        e.target.reset();
        
        console.log('✅ Chamado criado:', chamado.protocolo);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    generateProtocolo() {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const day = String(new Date().getDate()).padStart(2, '0');
        const sequence = String(this.chamados.length + 1).padStart(4, '0');
        
        return `UNISELVA-${year}${month}${day}-${sequence}`;
    }

    saveChamados() {
        localStorage.setItem('chamados_funcional', JSON.stringify(this.chamados));
        console.log('💾 Chamados salvos no localStorage');
    }

    loadChamados() {
        if (!this.currentUser) return;
        
        const chamadosList = document.getElementById('chamadosList');
        if (!chamadosList) return;
        
        // Filter chamados for current user (NPD can see all)
        const userChamados = this.currentUser.setor === 'NPD' 
            ? this.chamados 
            : this.chamados.filter(c => c.usuario === this.currentUser.username);
        
        if (userChamados.length === 0) {
            chamadosList.innerHTML = `
                <div class="text-center" style="padding: 2rem; color: #6c757d;">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>Nenhum chamado encontrado.</p>
                    <button class="btn btn-success" onclick="window.sistemaChamados.showNovoChamado()">
                        <i class="fas fa-plus"></i> Criar Primeiro Chamado
                    </button>
                </div>
            `;
            return;
        }

        // Sort by date (newest first)
        userChamados.sort((a, b) => new Date(b.dataAbertura) - new Date(a.dataAbertura));
        
        chamadosList.innerHTML = userChamados.map(chamado => this.renderChamado(chamado)).join('');
        console.log(`📋 Carregados ${userChamados.length} chamados`);
    }

    renderChamado(chamado) {
        const dataFormatada = new Date(chamado.dataAbertura).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const statusClass = `status-${chamado.status.replace(' ', '-')}`;
        const statusText = {
            'aberto': 'Aberto',
            'andamento': 'Em Andamento',
            'aguardando': 'Aguardando Usuário',
            'resolvido': 'Resolvido',
            'fechado': 'Fechado'
        };

        const prioridadeIcon = {
            'baixa': 'fas fa-arrow-down text-success',
            'media': 'fas fa-minus text-warning',
            'alta': 'fas fa-arrow-up text-danger',
            'critica': 'fas fa-exclamation-triangle text-danger'
        };

        return `
            <div class="chamado-item">
                <div class="chamado-header">
                    <div class="chamado-titulo">
                        <i class="fas fa-ticket-alt"></i>
                        ${chamado.titulo}
                    </div>
                    <span class="chamado-status ${statusClass}">
                        ${statusText[chamado.status] || chamado.status}
                    </span>
                </div>
                <div class="chamado-info">
                    <div><strong>Protocolo:</strong> ${chamado.protocolo}</div>
                    <div><strong>Categoria:</strong> ${chamado.categoria}</div>
                    <div>
                        <strong>Prioridade:</strong> 
                        <i class="${prioridadeIcon[chamado.prioridade]}"></i>
                        ${chamado.prioridade}
                    </div>
                    <div><strong>Setor:</strong> ${chamado.setor}</div>
                    <div><strong>Data:</strong> ${dataFormatada}</div>
                    ${this.currentUser.setor === 'NPD' ? `<div><strong>Usuário:</strong> ${chamado.nomeUsuario}</div>` : ''}
                </div>
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e9ecef;">
                    <strong>Descrição:</strong>
                    <p style="margin-top: 0.5rem; color: #6c757d;">${chamado.descricao}</p>
                </div>
            </div>
        `;
    }

    loadChamadosGerenciar() {
        if (!this.currentUser || this.currentUser.setor !== 'NPD') return;
        
        const chamadosList = document.getElementById('chamadosGerenciarList');
        if (!chamadosList) return;
        
        if (this.chamados.length === 0) {
            chamadosList.innerHTML = `
                <div class="text-center" style="padding: 3rem; color: #6c757d;">
                    <i class="fas fa-inbox" style="font-size: 4rem; margin-bottom: 1rem;"></i>
                    <h3>Nenhum chamado encontrado</h3>
                    <p>Não há chamados para gerenciar no momento.</p>
                </div>
            `;
            return;
        }
        
        // Sort by priority and date
        const chamadosOrdenados = [...this.chamados].sort((a, b) => {
            const prioridadeOrder = { 'critica': 4, 'alta': 3, 'media': 2, 'baixa': 1 };
            const prioA = prioridadeOrder[a.prioridade] || 0;
            const prioB = prioridadeOrder[b.prioridade] || 0;
            
            if (prioA !== prioB) return prioB - prioA;
            return new Date(b.dataAbertura) - new Date(a.dataAbertura);
        });
        
        chamadosList.innerHTML = chamadosOrdenados.map(chamado => this.renderChamadoGerenciar(chamado)).join('');
        this.bindGerenciarEvents();
        console.log(`⚙️ Carregados ${chamadosOrdenados.length} chamados para gerenciar`);
    }

    renderChamadoGerenciar(chamado) {
        const dataFormatada = new Date(chamado.dataAbertura).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const statusClass = `status-${chamado.status}`;
        const statusText = {
            'aberto': 'Aberto',
            'andamento': 'Em Andamento',
            'aguardando': 'Aguardando Usuário',
            'resolvido': 'Resolvido',
            'fechado': 'Fechado'
        };

        const prioridadeClass = `prioridade-${chamado.prioridade}`;
        const prioridadeIcon = {
            'baixa': 'fas fa-arrow-down',
            'media': 'fas fa-minus',
            'alta': 'fas fa-arrow-up',
            'critica': 'fas fa-exclamation-triangle'
        };

        return `
            <div class="chamado-gerenciar-item" data-id="${chamado.id}">
                <div class="chamado-gerenciar-header">
                    <div class="chamado-gerenciar-titulo">
                        <h4>
                            <i class="fas fa-ticket-alt"></i>
                            ${chamado.titulo}
                        </h4>
                        <div class="protocolo">Protocolo: ${chamado.protocolo}</div>
                    </div>
                    <div class="chamado-status-badge ${statusClass}">
                        ${statusText[chamado.status]}
                    </div>
                </div>

                <div class="chamado-gerenciar-info">
                    <div class="info-item">
                        <div class="info-label">Usuário</div>
                        <div class="info-value">${chamado.nomeUsuario}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Categoria</div>
                        <div class="info-value">${chamado.categoria}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Prioridade</div>
                        <div class="info-value">
                            <span class="prioridade-badge ${prioridadeClass}">
                                <i class="${prioridadeIcon[chamado.prioridade]}"></i>
                                ${chamado.prioridade}
                            </span>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Setor</div>
                        <div class="info-value">${chamado.setor}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Data Abertura</div>
                        <div class="info-value">${dataFormatada}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Telefone</div>
                        <div class="info-value">${chamado.telefone || 'Não informado'}</div>
                    </div>
                </div>

                <div class="chamado-descricao">
                    <h5>Descrição do Problema</h5>
                    <p>${chamado.descricao}</p>
                </div>

                <div class="chamado-actions">
                    <button class="btn btn-outline-primary btn-sm update-status-btn" data-id="${chamado.id}">
                        <i class="fas fa-edit"></i> Atualizar Status
                    </button>
                </div>
            </div>
        `;
    }

    bindGerenciarEvents() {
        // Botões de atualizar status
        document.querySelectorAll('.update-status-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const chamadoId = e.target.closest('.update-status-btn').dataset.id;
                this.showStatusModal(chamadoId);
            });
        });
    }

    showStatusModal(chamadoId) {
        this.currentChamadoId = chamadoId;
        this.showModal(document.getElementById('statusModal'));
    }

    handleStatusUpdate(e) {
        e.preventDefault();
        
        if (!this.currentChamadoId) return;

        const novoStatus = document.getElementById('novoStatus').value;
        const observacao = document.getElementById('observacao').value || 'Sem observações';

        if (!novoStatus) {
            this.showAlert('Por favor, selecione um status!', 'error');
            return;
        }

        const chamadoIndex = this.chamados.findIndex(c => c.id === this.currentChamadoId);
        if (chamadoIndex === -1) {
            this.showAlert('Chamado não encontrado!', 'error');
            return;
        }

        const chamado = this.chamados[chamadoIndex];
        const statusAnterior = chamado.status;
        
        chamado.status = novoStatus;
        chamado.dataUltimaAtualizacao = new Date().toISOString();
        
        // Adicionar ao histórico
        chamado.historico.push({
            data: new Date().toISOString(),
            acao: `Status alterado de "${statusAnterior}" para "${novoStatus}"`,
            usuario: this.currentUser.nome,
            detalhes: observacao
        });

        this.chamados[chamadoIndex] = chamado;
        this.saveChamados();

        this.hideModal(document.getElementById('statusModal'));
        e.target.reset();
        this.loadChamadosGerenciar(); // Recarregar lista
        this.showAlert('Status atualizado com sucesso!', 'success');
        
        console.log(`🔄 Status do chamado ${chamado.protocolo} alterado para: ${novoStatus}`);
    }

    updateStats() {
        if (!this.currentUser) return;
        
        // Filter chamados for current user (NPD can see all)
        const userChamados = this.currentUser.setor === 'NPD' 
            ? this.chamados 
            : this.chamados.filter(c => c.usuario === this.currentUser.username);
        
        const total = userChamados.length;
        const abertos = userChamados.filter(c => c.status === 'aberto' || c.status === 'andamento').length;
        const resolvidos = userChamados.filter(c => c.status === 'resolvido' || c.status === 'fechado').length;
        
        // Update DOM
        const totalElement = document.getElementById('totalChamados');
        const abertosElement = document.getElementById('chamadosAbertos');
        const resolvidosElement = document.getElementById('chamadosResolvidos');
        
        if (totalElement) totalElement.textContent = total;
        if (abertosElement) abertosElement.textContent = abertos;
        if (resolvidosElement) resolvidosElement.textContent = resolvidos;
        
        console.log(`📊 Stats: Total: ${total}, Abertos: ${abertos}, Resolvidos: ${resolvidos}`);
    }

    // Mostrar alerta
    showAlert(message, type = 'success') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert-fixed alert-${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 'exclamation-triangle';
        alertDiv.innerHTML = `
            <i class="fas fa-${icon}" style="margin-right: 0.5rem;"></i>
            ${message}
        `;
        
        document.body.appendChild(alertDiv);
        
        // Remover após 4 segundos
        setTimeout(() => {
            alertDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => alertDiv.remove(), 300);
        }, 4000);
    }

    // Demo data for testing
    createDemoData() {
        if (this.chamados.length === 0) {
            const demoChamados = [
                {
                    id: 'demo1',
                    protocolo: 'UNISELVA-20241105-0001',
                    titulo: 'Computador não liga',
                    descricao: 'O computador da sala 101 não está ligando. Já verifiquei os cabos e a tomada. O LED da fonte não acende.',
                    categoria: 'hardware',
                    prioridade: 'alta',
                    setor: 'administracao',
                    telefone: '(65) 99999-9999',
                    usuario: 'israel.rangel',
                    nomeUsuario: 'Israel Rangel',
                    status: 'aberto',
                    dataAbertura: new Date(Date.now() - 86400000).toISOString(),
                    dataUltimaAtualizacao: new Date(Date.now() - 86400000).toISOString(),
                    historico: [{
                        data: new Date(Date.now() - 86400000).toISOString(),
                        acao: 'Chamado criado',
                        usuario: 'Israel Rangel',
                        detalhes: 'Chamado aberto pelo usuário'
                    }],
                    comentarios: []
                },
                {
                    id: 'demo2',
                    protocolo: 'UNISELVA-20241105-0002',
                    titulo: 'Problema no e-mail',
                    descricao: 'Não consigo enviar e-mails. Aparece erro de autenticação SMTP. Receber está funcionando normalmente.',
                    categoria: 'email',
                    prioridade: 'media',
                    setor: 'projetos',
                    telefone: 'Ramal 205',
                    usuario: 'israel.rangel',
                    nomeUsuario: 'Israel Rangel',
                    status: 'andamento',
                    dataAbertura: new Date(Date.now() - 172800000).toISOString(),
                    dataUltimaAtualizacao: new Date(Date.now() - 86400000).toISOString(),
                    historico: [
                        {
                            data: new Date(Date.now() - 172800000).toISOString(),
                            acao: 'Chamado criado',
                            usuario: 'Israel Rangel',
                            detalhes: 'Chamado aberto pelo usuário'
                        },
                        {
                            data: new Date(Date.now() - 86400000).toISOString(),
                            acao: 'Status alterado de "aberto" para "andamento"',
                            usuario: 'Breno',
                            detalhes: 'Iniciando verificação das configurações SMTP'
                        }
                    ],
                    comentarios: []
                }
            ];
            
            this.chamados = demoChamados;
            this.saveChamados();
            console.log('📝 Dados de demonstração criados');
        }
    }
}

// Add CSS for slide out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 DOM carregado, inicializando sistema...');
    const sistema = new SistemaChamadosFuncional();
    
    // Make sistema globally available for debugging
    window.sistemaChamados = sistema;
    
    console.log('🎉 Sistema de Chamados UNISELVA carregado com sucesso!');
    console.log('📋 Usuários disponíveis:');
    console.log('   NPD: breno/admin123, felix/npd2024');
    console.log('   Usuário: israel.rangel/israel123');
    console.log('💡 Abra o console para ver os logs detalhados');
});