// Sistema de Chamados - FUNDAÇÃO UNISELVA
class SistemaChamados {
    constructor() {
        this.currentUser = null;
        this.token = localStorage.getItem('token');
        this.apiUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3001/api' 
            : '/api';
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuthStatus();
        this.updateStats();
    }

    bindEvents() {
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
        const comentarioForm = document.getElementById('comentarioForm');
        
        // Modals
        const successModal = document.getElementById('successModal');
        const statusModal = document.getElementById('statusModal');
        const comentarioModal = document.getElementById('comentarioModal');
        const okBtn = document.getElementById('okBtn');
        const cancelarStatus = document.getElementById('cancelarStatus');
        const cancelarComentario = document.getElementById('cancelarComentario');
        
        // Close buttons
        const closeButtons = document.querySelectorAll('.close');

        // Event Listeners
        loginBtn?.addEventListener('click', () => this.showModal(loginModal));
        logoutBtn?.addEventListener('click', () => this.logout());
        loginForm?.addEventListener('submit', (e) => this.handleLogin(e));
        
        novoChamadoBtn?.addEventListener('click', () => this.showNovoChamado());
        meusChamadosBtn?.addEventListener('click', () => this.showMeusChamados());
        gerenciarChamadosBtn?.addEventListener('click', () => this.showGerenciarChamados());
        voltarDashboard?.addEventListener('click', () => this.showDashboard());
        voltarDashboardGerenciar?.addEventListener('click', () => this.showDashboard());
        
        chamadoForm?.addEventListener('submit', (e) => this.handleNovoChamado(e));
        statusForm?.addEventListener('submit', (e) => this.handleStatusUpdate(e));
        comentarioForm?.addEventListener('submit', (e) => this.handleComentario(e));
        
        okBtn?.addEventListener('click', () => {
            this.hideModal(successModal);
            this.showDashboard();
        });
        
        cancelarStatus?.addEventListener('click', () => this.hideModal(statusModal));
        cancelarComentario?.addEventListener('click', () => this.hideModal(comentarioModal));
        
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

        // Filtros
        const filtroStatus = document.getElementById('filtroStatus');
        const filtroCategoria = document.getElementById('filtroCategoria');
        const filtroPrioridade = document.getElementById('filtroPrioridade');

        filtroStatus?.addEventListener('change', () => this.applyFilters());
        filtroCategoria?.addEventListener('change', () => this.applyFilters());
        filtroPrioridade?.addEventListener('change', () => this.applyFilters());
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

    async handleLogin(e) {
        e.preventDefault();
        
        const usuario = document.getElementById('usuario').value;
        const senha = document.getElementById('senha').value;
        
        try {
            const response = await fetch(`${this.apiUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usuario, senha })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.currentUser = data.user;
                
                localStorage.setItem('token', this.token);
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                
                this.hideModal(document.getElementById('loginModal'));
                this.showDashboard();
                this.updateAuthUI();
                
                // Reset form
                document.getElementById('loginForm').reset();
            } else {
                alert(data.error || 'Erro ao fazer login');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            alert('Erro de conexão. Verifique sua internet e tente novamente.');
        }
    }

    logout() {
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        this.updateAuthUI();
        this.showWelcome();
    }

    checkAuthStatus() {
        const savedUser = localStorage.getItem('currentUser');
        const savedToken = localStorage.getItem('token');
        
        if (savedUser && savedToken) {
            this.currentUser = JSON.parse(savedUser);
            this.token = savedToken;
            this.showDashboard();
            this.updateAuthUI();
        } else {
            this.showWelcome();
        }
    }

    updateAuthUI() {
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const userWelcome = document.getElementById('userWelcome');
        const gerenciarChamadosBtn = document.getElementById('gerenciarChamadosBtn');
        
        if (this.currentUser) {
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-flex';
            if (userWelcome) {
                userWelcome.textContent = `Bem-vindo, ${this.currentUser.nome}`;
            }
            
            // Mostrar botão de gerenciar apenas para NPD
            if (gerenciarChamadosBtn) {
                gerenciarChamadosBtn.style.display = this.currentUser.setor === 'NPD' ? 'inline-flex' : 'none';
            }
        } else {
            loginBtn.style.display = 'inline-flex';
            logoutBtn.style.display = 'none';
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
        document.getElementById('welcomeSection').style.display = 'block';
    }

    showDashboard() {
        if (!this.currentUser) {
            this.showWelcome();
            return;
        }
        
        this.hideAllSections();
        document.getElementById('dashboardSection').style.display = 'block';
        this.loadChamados();
        this.updateStats();
    }

    showNovoChamado() {
        if (!this.currentUser) {
            this.showWelcome();
            return;
        }
        
        this.hideAllSections();
        document.getElementById('novoChamadoSection').style.display = 'block';
    }

    showMeusChamados() {
        this.showDashboard();
        // Scroll to chamados list
        document.querySelector('.chamados-container').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }

    showGerenciarChamados() {
        if (!this.currentUser || this.currentUser.setor !== 'NPD') {
            alert('Acesso negado. Apenas a equipe NPD pode gerenciar chamados.');
            return;
        }
        
        this.hideAllSections();
        document.getElementById('gerenciarChamadosSection').style.display = 'block';
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

    async handleNovoChamado(e) {
        e.preventDefault();
        
        if (!this.currentUser || !this.token) {
            alert('Você precisa estar logado para abrir um chamado!');
            return;
        }

        const formData = new FormData(e.target);
        const chamadoData = {
            titulo: formData.get('titulo'),
            descricao: formData.get('descricao'),
            categoria: formData.get('categoria'),
            prioridade: formData.get('prioridade'),
            setor: formData.get('setor'),
            telefone: formData.get('telefone')
        };

        try {
            const response = await fetch(`${this.apiUrl}/chamados`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(chamadoData)
            });

            const data = await response.json();

            if (response.ok) {
                // Show success modal
                document.getElementById('protocoloNumero').textContent = data.chamado.protocolo;
                this.showModal(document.getElementById('successModal'));
                
                // Reset form
                e.target.reset();
            } else {
                alert(data.error || 'Erro ao criar chamado');
            }
        } catch (error) {
            console.error('Erro ao criar chamado:', error);
            alert('Erro de conexão. Verifique sua internet e tente novamente.');
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    generateProtocolo() {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const day = String(new Date().getDate()).padStart(2, '0');
        const sequence = String(Date.now()).slice(-4);
        
        return `UNISELVA-${year}${month}${day}-${sequence}`;
    }

    async loadChamados() {
        if (!this.currentUser || !this.token) return;
        
        const chamadosList = document.getElementById('chamadosList');
        if (!chamadosList) return;
        
        try {
            const response = await fetch(`${this.apiUrl}/chamados`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const chamados = await response.json();
                
                if (chamados.length === 0) {
                    chamadosList.innerHTML = `
                        <div class="text-center" style="padding: 2rem; color: #6c757d;">
                            <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                            <p>Nenhum chamado encontrado.</p>
                        </div>
                    `;
                    return;
                }
                
                chamadosList.innerHTML = chamados.map(chamado => this.renderChamado(chamado)).join('');
            } else {
                console.error('Erro ao carregar chamados');
                chamadosList.innerHTML = `
                    <div class="text-center" style="padding: 2rem; color: #dc3545;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                        <p>Erro ao carregar chamados. Tente novamente.</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Erro ao carregar chamados:', error);
            chamadosList.innerHTML = `
                <div class="text-center" style="padding: 2rem; color: #dc3545;">
                    <i class="fas fa-wifi" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>Erro de conexão. Verifique sua internet.</p>
                </div>
            `;
        }
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

    async updateStats() {
        if (!this.currentUser || !this.token) return;
        
        try {
            const response = await fetch(`${this.apiUrl}/estatisticas`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const stats = await response.json();
                
                // Update DOM
                const totalElement = document.getElementById('totalChamados');
                const abertosElement = document.getElementById('chamadosAbertos');
                const resolvidosElement = document.getElementById('chamadosResolvidos');
                
                if (totalElement) totalElement.textContent = stats.total;
                if (abertosElement) abertosElement.textContent = stats.abertos + stats.andamento;
                if (resolvidosElement) resolvidosElement.textContent = stats.resolvidos + stats.fechados;
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    }

    // Método para testar conexão com API
    async testConnection() {
        try {
            const response = await fetch(`${this.apiUrl}/health`);
            const data = await response.json();
            console.log('Conexão com API:', data);
            this.updateConnectionStatus(true);
            return response.ok;
        } catch (error) {
            console.error('Erro de conexão com API:', error);
            this.updateConnectionStatus(false);
            return false;
        }
    }

    updateConnectionStatus(isOnline) {
        const statusCard = document.getElementById('connectionStatus');
        const icon = document.getElementById('connectionIcon');
        const text = document.getElementById('connectionText');
        
        if (!statusCard || !icon || !text) return;
        
        if (isOnline) {
            statusCard.style.background = 'linear-gradient(135deg, #d4edda, #c3e6cb)';
            icon.className = 'fas fa-wifi';
            icon.style.color = '#28a745';
            text.textContent = 'Online';
            text.style.color = '#155724';
        } else {
            statusCard.style.background = 'linear-gradient(135deg, #f8d7da, #f1b0b7)';
            icon.className = 'fas fa-wifi-slash';
            icon.style.color = '#dc3545';
            text.textContent = 'Offline';
            text.style.color = '#721c24';
        }
    }

    // Monitorar conexão periodicamente
    startConnectionMonitor() {
        setInterval(async () => {
            await this.testConnection();
        }, 30000); // Testa a cada 30 segundos
    }

    // Carregar chamados para gerenciar (NPD)
    async loadChamadosGerenciar() {
        if (!this.currentUser || !this.token || this.currentUser.setor !== 'NPD') return;
        
        const chamadosList = document.getElementById('chamadosGerenciarList');
        if (!chamadosList) return;
        
        try {
            const response = await fetch(`${this.apiUrl}/chamados`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const chamados = await response.json();
                
                if (chamados.length === 0) {
                    chamadosList.innerHTML = `
                        <div class="text-center" style="padding: 3rem; color: #6c757d;">
                            <i class="fas fa-inbox" style="font-size: 4rem; margin-bottom: 1rem;"></i>
                            <h3>Nenhum chamado encontrado</h3>
                            <p>Não há chamados para gerenciar no momento.</p>
                        </div>
                    `;
                    return;
                }
                
                chamadosList.innerHTML = chamados.map(chamado => this.renderChamadoGerenciar(chamado)).join('');
                this.bindGerenciarEvents();
            } else {
                console.error('Erro ao carregar chamados para gerenciar');
                chamadosList.innerHTML = `
                    <div class="alert alert-error">
                        <i class="fas fa-exclamation-triangle"></i>
                        Erro ao carregar chamados. Tente novamente.
                    </div>
                `;
            }
        } catch (error) {
            console.error('Erro ao carregar chamados para gerenciar:', error);
            chamadosList.innerHTML = `
                <div class="alert alert-error">
                    <i class="fas fa-wifi"></i>
                    Erro de conexão. Verifique sua internet.
                </div>
            `;
        }
    }

    // Renderizar chamado para gerenciar
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

        const comentarios = chamado.comentarios || [];
        const historico = chamado.historico || [];

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
                    <button class="btn btn-outline-success btn-sm add-comment-btn" data-id="${chamado.id}">
                        <i class="fas fa-comment"></i> Adicionar Comentário
                    </button>
                    <button class="btn btn-outline-warning btn-sm toggle-details-btn" data-id="${chamado.id}">
                        <i class="fas fa-eye"></i> Ver Detalhes
                    </button>
                </div>

                <div class="chamado-details" id="details-${chamado.id}" style="display: none;">
                    ${comentarios.length > 0 ? `
                        <div class="comentarios-section">
                            <h5><i class="fas fa-comments"></i> Comentários (${comentarios.length})</h5>
                            ${comentarios.map(comentario => `
                                <div class="comentario-item ${comentario.isNPD ? 'npd' : ''}">
                                    <div class="comentario-header">
                                        <span class="comentario-autor">
                                            ${comentario.usuario} ${comentario.isNPD ? '(NPD)' : ''}
                                        </span>
                                        <span class="comentario-data">
                                            ${new Date(comentario.data).toLocaleDateString('pt-BR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <p class="comentario-texto">${comentario.texto}</p>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    ${historico.length > 0 ? `
                        <div class="historico-section">
                            <h5><i class="fas fa-history"></i> Histórico (${historico.length})</h5>
                            ${historico.map(item => `
                                <div class="historico-item">
                                    <div class="historico-icon">
                                        <i class="fas fa-clock"></i>
                                    </div>
                                    <div class="historico-content">
                                        <div class="historico-acao">${item.acao}</div>
                                        <div class="historico-detalhes">${item.detalhes}</div>
                                        <div class="historico-data">
                                            ${item.usuario} - ${new Date(item.data).toLocaleDateString('pt-BR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Bind events para gerenciar chamados
    bindGerenciarEvents() {
        // Botões de atualizar status
        document.querySelectorAll('.update-status-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const chamadoId = e.target.closest('.update-status-btn').dataset.id;
                this.showStatusModal(chamadoId);
            });
        });

        // Botões de adicionar comentário
        document.querySelectorAll('.add-comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const chamadoId = e.target.closest('.add-comment-btn').dataset.id;
                this.showComentarioModal(chamadoId);
            });
        });

        // Botões de toggle detalhes
        document.querySelectorAll('.toggle-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const chamadoId = e.target.closest('.toggle-details-btn').dataset.id;
                const details = document.getElementById(`details-${chamadoId}`);
                const icon = e.target.querySelector('i');
                
                if (details.style.display === 'none') {
                    details.style.display = 'block';
                    icon.className = 'fas fa-eye-slash';
                    e.target.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar Detalhes';
                } else {
                    details.style.display = 'none';
                    icon.className = 'fas fa-eye';
                    e.target.innerHTML = '<i class="fas fa-eye"></i> Ver Detalhes';
                }target.innerHTML = '<i class="fas fa-eye"></i> Ver Detalhes';
                }
            });
        });
    }

    // Mostrar modal de status
    showStatusModal(chamadoId) {
        this.currentChamadoId = chamadoId;
        this.showModal(document.getElementById('statusModal'));
    }

    // Mostrar modal de comentário
    showComentarioModal(chamadoId) {
        this.currentChamadoId = chamadoId;
        this.showModal(document.getElementById('comentarioModal'));
    }

    // Handle status update
    async handleStatusUpdate(e) {
        e.preventDefault();
        
        if (!this.currentChamadoId || !this.token) return;

        const formData = new FormData(e.target);
        const statusData = {
            status: formData.get('status'),
            observacao: formData.get('observacao')
        };

        try {
            const response = await fetch(`${this.apiUrl}/chamados/${this.currentChamadoId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(statusData)
            });

            const data = await response.json();

            if (response.ok) {
                this.hideModal(document.getElementById('statusModal'));
                e.target.reset();
                this.loadChamadosGerenciar(); // Recarregar lista
                this.showAlert('Status atualizado com sucesso!', 'success');
            } else {
                this.showAlert(data.error || 'Erro ao atualizar status', 'error');
            }
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            this.showAlert('Erro de conexão. Tente novamente.', 'error');
        }
    }

    // Handle comentário
    async handleComentario(e) {
        e.preventDefault();
        
        if (!this.currentChamadoId || !this.token) return;

        const formData = new FormData(e.target);
        const comentarioData = {
            comentario: formData.get('comentario')
        };

        try {
            const response = await fetch(`${this.apiUrl}/chamados/${this.currentChamadoId}/comentarios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(comentarioData)
            });

            const data = await response.json();

            if (response.ok) {
                this.hideModal(document.getElementById('comentarioModal'));
                e.target.reset();
                this.loadChamadosGerenciar(); // Recarregar lista
                this.showAlert('Comentário adicionado com sucesso!', 'success');
            } else {
                this.showAlert(data.error || 'Erro ao adicionar comentário', 'error');
            }
        } catch (error) {
            console.error('Erro ao adicionar comentário:', error);
            this.showAlert('Erro de conexão. Tente novamente.', 'error');
        }
    }

    // Mostrar alerta
    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
            ${message}
        `;
        
        const container = document.querySelector('.gerenciar-container') || document.querySelector('.container');
        container.insertBefore(alertDiv, container.firstChild);
        
        // Remover após 5 segundos
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    // Aplicar filtros
    applyFilters() {
        const filtroStatus = document.getElementById('filtroStatus')?.value || '';
        const filtroCategoria = document.getElementById('filtroCategoria')?.value || '';
        const filtroPrioridade = document.getElementById('filtroPrioridade')?.value || '';

        const chamadosItems = document.querySelectorAll('.chamado-gerenciar-item');
        
        chamadosItems.forEach(item => {
            const statusElement = item.querySelector('.chamado-status-badge');
            const categoriaElement = item.querySelector('.info-value');
            const prioridadeElement = item.querySelector('.prioridade-badge');
            
            let showItem = true;

            // Filtro por status
            if (filtroStatus && statusElement) {
                const status = statusElement.className.includes('status-' + filtroStatus);
                if (!status) showItem = false;
            }

            // Filtro por categoria
            if (filtroCategoria && categoriaElement) {
                const categoria = item.textContent.includes(filtroCategoria);
                if (!categoria) showItem = false;
            }

            // Filtro por prioridade
            if (filtroPrioridade && prioridadeElement) {
                const prioridade = prioridadeElement.className.includes('prioridade-' + filtroPrioridade);
                if (!prioridade) showItem = false;
            }

            item.style.display = showItem ? 'block' : 'none';
        });
    }
}

// Initialize system when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const sistema = new SistemaChamados();
    
    // Test API connection
    const connected = await sistema.testConnection();
    if (!connected) {
        console.warn('API não está disponível. Funcionando em modo offline.');
    }
    
    // Start connection monitoring
    sistema.startConnectionMonitor();
    
    // Make sistema globally available for debugging
    window.sistemaChamados = sistema;
});

// Service Worker Registration (for PWA functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}