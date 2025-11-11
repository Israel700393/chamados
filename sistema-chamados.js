// Sistema de Chamados NPD - Fundação Uniselva
// Armazenamento Local
let currentUser = null;
let tickets = [];
let ticketCounter = 1;
const ADMIN_PASSWORD = 'npd2024'; // Senha padrão do admin

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    loadTheme();
    checkLogin();
    
    // Event Listeners
    document.getElementById('newTicketForm').addEventListener('submit', createTicket);
});

// Carregar dados do localStorage
function loadData() {
    const savedUser = localStorage.getItem('npd_currentUser');
    const savedTickets = localStorage.getItem('npd_tickets');
    const savedCounter = localStorage.getItem('npd_ticketCounter');
    
    if (savedUser) currentUser = JSON.parse(savedUser);
    if (savedTickets) tickets = JSON.parse(savedTickets);
    if (savedCounter) ticketCounter = parseInt(savedCounter);
}

// Salvar dados no localStorage
function saveData() {
    localStorage.setItem('npd_currentUser', JSON.stringify(currentUser));
    localStorage.setItem('npd_tickets', JSON.stringify(tickets));
    localStorage.setItem('npd_ticketCounter', ticketCounter.toString());
}

// Verificar login
function checkLogin() {
    if (currentUser) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        document.getElementById('userName').textContent = currentUser.name;
        
        // Mostrar badge de admin se for NPD
        const badge = document.getElementById('userBadge');
        if (currentUser.isAdmin) {
            badge.style.display = 'inline-block';
            // Esconder aba "Novo Chamado" para admin
            document.querySelectorAll('.tab-btn')[0].style.display = 'none';
            document.getElementById('novoTab').style.display = 'none';
            // Mostrar "Todos os Chamados" por padrão para admin
            showTab('todos');
        } else {
            badge.style.display = 'none';
            // Mostrar aba "Novo Chamado" para usuários normais
            document.querySelectorAll('.tab-btn')[0].style.display = 'block';
            document.getElementById('novoTab').style.display = 'block';
        }
        
        loadTickets();
    } else {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('mainContent').style.display = 'none';
    }
}

// Alternar entre abas de login
function switchLoginTab(tab) {
    const tabs = document.querySelectorAll('.login-tab');
    const forms = document.querySelectorAll('.login-form');
    
    tabs.forEach(t => t.classList.remove('active'));
    forms.forEach(f => f.classList.remove('active'));
    
    if (tab === 'user') {
        tabs[0].classList.add('active');
        document.getElementById('userLogin').classList.add('active');
    } else {
        tabs[1].classList.add('active');
        document.getElementById('adminLogin').classList.add('active');
    }
}

// Login
function login() {
    const name = document.getElementById('loginName').value.trim();
    const email = document.getElementById('loginEmail').value.trim();
    const department = document.getElementById('loginDepartment').value;
    
    if (!name || !email || !department) {
        Swal.fire({
            icon: 'warning',
            title: 'Atenção!',
            text: 'Por favor, preencha todos os campos!',
            confirmButtonColor: '#667eea'
        });
        return;
    }
    
    currentUser = {
        name: name,
        email: email,
        department: department,
        isAdmin: false,
        loginTime: new Date().toISOString()
    };
    
    saveData();
    
    Swal.fire({
        icon: 'success',
        title: 'Bem-vindo!',
        text: `Olá, ${name}!`,
        timer: 1500,
        showConfirmButton: false
    });
    
    setTimeout(() => {
        checkLogin();
    }, 1500);
}

// Login Admin
function adminLogin() {
    const name = document.getElementById('adminName').value.trim();
    const password = document.getElementById('adminPassword').value;
    
    if (!name || !password) {
        Swal.fire({
            icon: 'warning',
            title: 'Atenção!',
            text: 'Por favor, preencha todos os campos!',
            confirmButtonColor: '#667eea'
        });
        return;
    }
    
    if (password !== ADMIN_PASSWORD) {
        Swal.fire({
            icon: 'error',
            title: 'Acesso Negado!',
            text: 'Senha incorreta!',
            confirmButtonColor: '#667eea'
        });
        return;
    }
    
    currentUser = {
        name: name,
        email: 'npd@uniselva.com',
        department: 'NPD',
        isAdmin: true,
        loginTime: new Date().toISOString()
    };
    
    saveData();
    
    Swal.fire({
        icon: 'success',
        title: 'Bem-vindo Admin!',
        html: `Olá, <strong>${name}</strong>!<br>Você tem acesso total ao sistema.`,
        timer: 2000,
        showConfirmButton: false
    });
    
    setTimeout(() => {
        checkLogin();
    }, 2000);
}

// Logout
function logout() {
    Swal.fire({
        title: 'Deseja sair?',
        text: 'Você será desconectado do sistema',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#667eea',
        cancelButtonColor: '#ff4757',
        confirmButtonText: 'Sim, sair',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            currentUser = null;
            localStorage.removeItem('npd_currentUser');
            Swal.fire({
                icon: 'success',
                title: 'Até logo!',
                text: 'Você foi desconectado com sucesso',
                timer: 1500,
                showConfirmButton: false
            });
            setTimeout(() => {
                checkLogin();
            }, 1500);
        }
    });
}

// Criar novo chamado
function createTicket(e) {
    e.preventDefault();
    
    const ticket = {
        id: ticketCounter++,
        title: document.getElementById('ticketTitle').value,
        category: document.getElementById('ticketCategory').value,
        priority: document.getElementById('ticketPriority').value,
        description: document.getElementById('ticketDescription').value,
        status: 'Aberto',
        author: currentUser.name,
        authorEmail: currentUser.email,
        department: currentUser.department,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [{
            action: 'Chamado criado',
            user: currentUser.name,
            timestamp: new Date().toISOString(),
            details: `Chamado criado com prioridade ${document.getElementById('ticketPriority').value}`
        }],
        messages: [{
            author: currentUser.name,
            text: document.getElementById('ticketDescription').value,
            timestamp: new Date().toISOString(),
            isAuthor: true
        }]
    };
    
    tickets.unshift(ticket);
    saveData();
    
    // Limpar formulário
    document.getElementById('newTicketForm').reset();
    
    // Mostrar mensagem de sucesso
    Swal.fire({
        icon: 'success',
        title: 'Chamado Criado!',
        html: `Seu chamado <strong>#${ticket.id}</strong> foi criado com sucesso!`,
        confirmButtonColor: '#667eea',
        confirmButtonText: 'Ver Chamado'
    }).then(() => {
        // Ir para aba "Meus Chamados"
        showTab('meus');
        loadTickets();
    });
}

// Mostrar aba
function showTab(tabName) {
    // Remover active de todas as abas
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Ativar aba selecionada
    if (tabName === 'novo') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('novoTab').classList.add('active');
    } else if (tabName === 'meus') {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('meusTab').classList.add('active');
        loadMyTickets();
    } else if (tabName === 'todos') {
        document.querySelectorAll('.tab-btn')[2].classList.add('active');
        document.getElementById('todosTab').classList.add('active');
        loadAllTickets();
    }
}

// Carregar todos os chamados
function loadTickets() {
    loadMyTickets();
    loadAllTickets();
}

// Carregar meus chamados
function loadMyTickets() {
    const myTickets = tickets.filter(t => t.authorEmail === currentUser.email);
    const container = document.getElementById('myTicketsList');
    
    if (myTickets.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Você ainda não tem chamados.</p>';
        return;
    }
    
    container.innerHTML = myTickets.map(ticket => createTicketCard(ticket)).join('');
}

// Carregar todos os chamados
function loadAllTickets() {
    const container = document.getElementById('allTicketsList');
    
    if (tickets.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Nenhum chamado encontrado.</p>';
        return;
    }
    
    container.innerHTML = tickets.map(ticket => createTicketCard(ticket)).join('');
}

// Criar card de chamado
function createTicketCard(ticket) {
    const date = new Date(ticket.createdAt);
    const formattedDate = formatDateTime(date);
    
    return `
        <div class="ticket-card" onclick="openTicket(${ticket.id})">
            <div class="ticket-header">
                <div>
                    <div class="ticket-title">${ticket.title}</div>
                    <div class="ticket-id">#${ticket.id} - ${ticket.category}</div>
                </div>
                <div class="ticket-badges">
                    <span class="badge badge-status">${ticket.status}</span>
                    <span class="badge badge-priority ${ticket.priority}">${ticket.priority}</span>
                </div>
            </div>
            <div class="ticket-description">${ticket.description.substring(0, 150)}${ticket.description.length > 150 ? '...' : ''}</div>
            <div class="ticket-info">
                <span>👤 ${ticket.author}</span>
                <span>🏢 ${ticket.department}</span>
                <span>📅 ${formattedDate}</span>
                <span>💬 ${ticket.messages.length} mensagens</span>
            </div>
        </div>
    `;
}

// Abrir detalhes do chamado
function openTicket(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    const modal = document.getElementById('ticketModal');
    const detailsContainer = document.getElementById('ticketDetails');
    
    detailsContainer.innerHTML = `
        <div class="ticket-detail-header">
            <h2>${ticket.title}</h2>
            <p>Chamado #${ticket.id} - ${ticket.category}</p>
            <div style="margin-top: 10px;">
                <span class="badge badge-status">${ticket.status}</span>
                <span class="badge badge-priority ${ticket.priority}">${ticket.priority}</span>
            </div>
        </div>
        
        <div class="ticket-detail-body">
            <!-- Informações do Chamado -->
            <div class="detail-section">
                <h3>📋 Informações</h3>
                <p><strong>Solicitante:</strong> ${ticket.author} (${ticket.authorEmail})</p>
                <p><strong>Departamento:</strong> ${ticket.department}</p>
                <p><strong>Criado em:</strong> ${formatDateTime(new Date(ticket.createdAt))}</p>
                <p><strong>Última atualização:</strong> ${formatDateTime(new Date(ticket.updatedAt))}</p>
                <p><strong>Descrição:</strong></p>
                <p style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 10px;">${ticket.description}</p>
            </div>
            
            <!-- Atualizar Status -->
            <div class="detail-section">
                <h3>🔄 Atualizar Status</h3>
                ${currentUser.isAdmin ? `
                    <div class="status-update">
                        <select id="updateStatus" class="input-field">
                            <option value="Aberto" ${ticket.status === 'Aberto' ? 'selected' : ''}>Aberto</option>
                            <option value="Em Andamento" ${ticket.status === 'Em Andamento' ? 'selected' : ''}>Em Andamento</option>
                            <option value="Aguardando" ${ticket.status === 'Aguardando' ? 'selected' : ''}>Aguardando</option>
                            <option value="Resolvido" ${ticket.status === 'Resolvido' ? 'selected' : ''}>Resolvido</option>
                            <option value="Fechado" ${ticket.status === 'Fechado' ? 'selected' : ''}>Fechado</option>
                        </select>
                        <button class="btn-primary" onclick="updateTicketStatus(${ticket.id})">Atualizar Status</button>
                    </div>
                ` : `
                    <div class="permission-denied">
                        🔒 Apenas administradores do NPD podem atualizar o status dos chamados
                    </div>
                    <div class="status-update">
                        <p><strong>Status Atual:</strong> ${ticket.status}</p>
                    </div>
                `}
            </div>
            
            <!-- Chat -->
            <div class="detail-section">
                <h3>💬 Conversas (${ticket.messages.length})</h3>
                <div class="chat-container">
                    <div class="chat-messages" id="chatMessages">
                        ${ticket.messages.length > 0 ? ticket.messages.map(msg => {
                            const isOwn = msg.author === currentUser.name;
                            const msgDate = new Date(msg.timestamp);
                            return `
                                <div class="chat-message ${isOwn ? 'own' : 'other'}">
                                    <div class="chat-bubble">
                                        <div class="chat-author">${msg.author}</div>
                                        <div class="chat-text">${msg.text}</div>
                                        <div class="chat-time">${formatDateTime(msgDate)}</div>
                                    </div>
                                </div>
                            `;
                        }).join('') : `
                            <div class="chat-empty">
                                <div class="chat-empty-icon">💬</div>
                                <div>Nenhuma mensagem ainda</div>
                                <div style="font-size: 12px; margin-top: 5px;">Seja o primeiro a enviar uma mensagem!</div>
                            </div>
                        `}
                    </div>
                    <div class="chat-input-area">
                        <div class="chat-input-container">
                            <textarea 
                                id="chatInput" 
                                placeholder="Digite sua mensagem aqui..." 
                                onkeydown="handleChatKeyPress(event, ${ticket.id})"
                                oninput="autoResizeTextarea(this)"
                            ></textarea>
                            <button class="btn-primary" onclick="sendMessage(${ticket.id})">
                                <span>📤</span>
                                <span>Enviar</span>
                            </button>
                        </div>
                        <div class="chat-hint">
                            💡 Pressione <strong>Enter</strong> para enviar ou <strong>Shift + Enter</strong> para nova linha
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Histórico -->
            <div class="detail-section">
                <h3>📜 Histórico</h3>
                <div class="history-timeline">
                    ${ticket.history.map(item => `
                        <div class="history-item">
                            <div class="history-header">
                                <span class="history-action">${item.action}</span>
                                <span class="history-time">${formatDateTime(new Date(item.timestamp))}</span>
                            </div>
                            <div class="history-details">
                                Por: ${item.user}<br>
                                ${item.details}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    
    // Scroll para última mensagem
    setTimeout(() => {
        scrollToBottom();
    }, 100);
}

// Scroll para o final do chat
function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Fechar modal
function closeModal() {
    document.getElementById('ticketModal').style.display = 'none';
}

// Atualizar status do chamado
function updateTicketStatus(ticketId) {
    // Verificar se é admin
    if (!currentUser.isAdmin) {
        Swal.fire({
            icon: 'error',
            title: 'Acesso Negado!',
            text: 'Apenas administradores do NPD podem atualizar o status dos chamados.',
            confirmButtonColor: '#667eea'
        });
        return;
    }
    
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    const newStatus = document.getElementById('updateStatus').value;
    const oldStatus = ticket.status;
    
    if (newStatus === oldStatus) {
        Swal.fire({
            icon: 'info',
            title: 'Status Atual',
            text: `O status já está definido como "${newStatus}"`,
            confirmButtonColor: '#667eea'
        });
        return;
    }
    
    ticket.status = newStatus;
    ticket.updatedAt = new Date().toISOString();
    
    // Adicionar ao histórico
    ticket.history.unshift({
        action: 'Status atualizado',
        user: currentUser.name + ' (NPD)',
        timestamp: new Date().toISOString(),
        details: `Status alterado de "${oldStatus}" para "${newStatus}"`
    });
    
    saveData();
    
    Swal.fire({
        icon: 'success',
        title: 'Status Atualizado!',
        html: `Status alterado de <strong>"${oldStatus}"</strong> para <strong>"${newStatus}"</strong>`,
        confirmButtonColor: '#667eea',
        timer: 2000
    });
    
    // Reabrir o chamado para mostrar as mudanças
    setTimeout(() => {
        openTicket(ticketId);
        loadTickets();
    }, 500);
}

// Enviar mensagem
function sendMessage(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) {
        console.error('Ticket não encontrado:', ticketId);
        return;
    }
    
    const chatInput = document.getElementById('chatInput');
    if (!chatInput) {
        console.error('Input de chat não encontrado');
        return;
    }
    
    const messageText = chatInput.value.trim();
    
    if (!messageText) {
        Swal.fire({
            icon: 'warning',
            title: 'Atenção!',
            text: 'Digite uma mensagem antes de enviar!',
            confirmButtonColor: '#667eea',
            timer: 1500,
            showConfirmButton: false
        });
        return;
    }
    
    // Criar nova mensagem
    const message = {
        author: currentUser.name,
        authorEmail: currentUser.email,
        text: messageText,
        timestamp: new Date().toISOString(),
        isAuthor: ticket.authorEmail === currentUser.email
    };
    
    // Adicionar mensagem ao ticket
    ticket.messages.push(message);
    ticket.updatedAt = new Date().toISOString();
    
    // Adicionar ao histórico
    ticket.history.unshift({
        action: 'Nova mensagem',
        user: currentUser.name + (currentUser.isAdmin ? ' (NPD)' : ''),
        timestamp: new Date().toISOString(),
        details: `Mensagem adicionada ao chamado`
    });
    
    // Salvar no localStorage
    saveData();
    
    // Limpar input
    chatInput.value = '';
    
    // Adicionar mensagem ao chat visualmente
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) {
        console.error('Container de mensagens não encontrado');
        return;
    }
    
    const isOwn = message.author === currentUser.name;
    
    const messageHTML = `
        <div class="chat-message ${isOwn ? 'own' : 'other'}">
            <div class="chat-bubble">
                <div class="chat-author">${message.author}${currentUser.isAdmin && isOwn ? ' (NPD)' : ''}</div>
                <div class="chat-text">${escapeHtml(message.text)}</div>
                <div class="chat-time">${formatDateTime(new Date(message.timestamp))}</div>
            </div>
        </div>
    `;
    
    // Remover mensagem vazia se existir
    const emptyMessage = chatMessages.querySelector('.chat-empty');
    if (emptyMessage) {
        emptyMessage.remove();
    }
    
    // Adicionar nova mensagem
    chatMessages.insertAdjacentHTML('beforeend', messageHTML);
    
    // Scroll para a nova mensagem
    setTimeout(() => {
        scrollToBottom();
    }, 50);
    
    // Focar no input novamente
    chatInput.focus();
    
    // Atualizar contador de mensagens nos cards
    loadTickets();
    
    console.log('Mensagem enviada com sucesso:', message);
}

// Escapar HTML para prevenir XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Permitir enviar mensagem com Enter (Shift+Enter para nova linha)
function handleChatKeyPress(event, ticketId) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage(ticketId);
        return false;
    }
}

// Auto-resize do textarea
function autoResizeTextarea(textarea) {
    // Reset height to get correct scrollHeight
    textarea.style.height = '120px';
    
    // Calculate new height
    const newHeight = Math.max(120, Math.min(textarea.scrollHeight, 250));
    textarea.style.height = newHeight + 'px';
}

// Filtrar chamados
function filterTickets() {
    const statusFilter = document.getElementById('filterStatus').value;
    const priorityFilter = document.getElementById('filterPriority').value;
    
    let filteredTickets = [...tickets];
    
    if (statusFilter) {
        filteredTickets = filteredTickets.filter(t => t.status === statusFilter);
    }
    
    if (priorityFilter) {
        filteredTickets = filteredTickets.filter(t => t.priority === priorityFilter);
    }
    
    const container = document.getElementById('allTicketsList');
    
    if (filteredTickets.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Nenhum chamado encontrado com os filtros selecionados.</p>';
        return;
    }
    
    container.innerHTML = filteredTickets.map(ticket => createTicketCard(ticket)).join('');
}

// Formatar data e hora
function formatDateTime(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} às ${hours}:${minutes}`;
}

// Tema Dark/Light
function loadTheme() {
    const savedTheme = localStorage.getItem('npd_theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('themeToggle').textContent = '☀️';
    }
}

function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        themeToggle.textContent = '☀️';
        localStorage.setItem('npd_theme', 'dark');
        
        Swal.fire({
            icon: 'success',
            title: 'Modo Escuro Ativado',
            text: 'Tema alterado com sucesso!',
            timer: 1500,
            showConfirmButton: false,
            background: body.classList.contains('dark-mode') ? '#0f3460' : '#fff',
            color: body.classList.contains('dark-mode') ? '#fff' : '#333'
        });
    } else {
        themeToggle.textContent = '🌙';
        localStorage.setItem('npd_theme', 'light');
        
        Swal.fire({
            icon: 'success',
            title: 'Modo Claro Ativado',
            text: 'Tema alterado com sucesso!',
            timer: 1500,
            showConfirmButton: false
        });
    }
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('ticketModal');
    if (event.target === modal) {
        closeModal();
    }
}
