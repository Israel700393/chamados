// Configurações do Sistema de Chamados UNISELVA
const CONFIG = {
    // Configurações da API
    api: {
        // URL base da API (deixe vazio para usar a mesma origem)
        baseUrl: '',
        // Porta da API para desenvolvimento local
        port: 3001,
        // Timeout para requisições (em milissegundos)
        timeout: 10000
    },

    // Configurações da empresa
    empresa: {
        nome: 'FUNDAÇÃO UNISELVA',
        departamento: 'NPD - Núcleo de Processamento de Dados',
        logo: 'fas fa-leaf', // Ícone FontAwesome
        cor: '#28a745' // Cor principal
    },

    // Configurações de autenticação
    auth: {
        // Tempo de expiração do token (em horas)
        tokenExpiration: 8,
        // Lembrar login
        rememberLogin: true
    },

    // Categorias de chamados
    categorias: [
        { value: 'hardware', label: 'Hardware', icon: 'fas fa-desktop' },
        { value: 'software', label: 'Software', icon: 'fas fa-code' },
        { value: 'rede', label: 'Rede/Internet', icon: 'fas fa-wifi' },
        { value: 'email', label: 'E-mail', icon: 'fas fa-envelope' },
        { value: 'sistema', label: 'Sistema Interno', icon: 'fas fa-cogs' },
        { value: 'impressora', label: 'Impressora', icon: 'fas fa-print' },
        { value: 'backup', label: 'Backup/Recuperação', icon: 'fas fa-hdd' },
        { value: 'telefonia', label: 'Telefonia', icon: 'fas fa-phone' },
        { value: 'acesso', label: 'Controle de Acesso', icon: 'fas fa-key' },
        { value: 'outros', label: 'Outros', icon: 'fas fa-question-circle' }
    ],

    // Níveis de prioridade
    prioridades: [
        { 
            value: 'baixa', 
            label: 'Baixa', 
            cor: '#28a745',
            icon: 'fas fa-arrow-down',
            sla: 72 // horas
        },
        { 
            value: 'media', 
            label: 'Média', 
            cor: '#ffc107',
            icon: 'fas fa-minus',
            sla: 24 // horas
        },
        { 
            value: 'alta', 
            label: 'Alta', 
            cor: '#fd7e14',
            icon: 'fas fa-arrow-up',
            sla: 8 // horas
        },
        { 
            value: 'critica', 
            label: 'Crítica', 
            cor: '#dc3545',
            icon: 'fas fa-exclamation-triangle',
            sla: 2 // horas
        }
    ],

    // Status dos chamados
    status: [
        { value: 'aberto', label: 'Aberto', cor: '#ffc107' },
        { value: 'andamento', label: 'Em Andamento', cor: '#17a2b8' },
        { value: 'aguardando', label: 'Aguardando Usuário', cor: '#6f42c1' },
        { value: 'resolvido', label: 'Resolvido', cor: '#28a745' },
        { value: 'fechado', label: 'Fechado', cor: '#6c757d' }
    ],

    // Setores da empresa
    setores: [
        { value: 'administracao', label: 'Administração' },
        { value: 'financeiro', label: 'Financeiro' },
        { value: 'rh', label: 'Recursos Humanos' },
        { value: 'projetos', label: 'Projetos' },
        { value: 'pesquisa', label: 'Pesquisa' },
        { value: 'diretoria', label: 'Diretoria' },
        { value: 'juridico', label: 'Jurídico' },
        { value: 'comunicacao', label: 'Comunicação' },
        { value: 'campo', label: 'Trabalho de Campo' },
        { value: 'outros', label: 'Outros' }
    ],

    // Configurações de interface
    ui: {
        // Tema (light/dark)
        theme: 'light',
        // Animações
        animations: true,
        // Notificações
        notifications: true,
        // Auto-refresh (em segundos)
        autoRefresh: 30,
        // Itens por página
        itemsPerPage: 10
    },

    // Configurações de notificação
    notifications: {
        // Notificações push (se suportado)
        push: true,
        // Som de notificação
        sound: true,
        // Notificar sobre novos chamados
        newTicket: true,
        // Notificar sobre mudanças de status
        statusChange: true
    },

    // Configurações de relatórios
    reports: {
        // Formatos disponíveis
        formats: ['pdf', 'excel', 'csv'],
        // Incluir gráficos
        charts: true,
        // Logo nos relatórios
        includeLogo: true
    },

    // Configurações de desenvolvimento
    development: {
        // Modo debug
        debug: false,
        // Logs detalhados
        verbose: false,
        // Dados de demonstração
        demoData: false
    }
};

// Exportar configurações
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.SISTEMA_CONFIG = CONFIG;
}