# 🔄 Alternância de Banco de Dados via Interface

## 📋 Visão Geral

Sistema implementado para alternar entre bancos de dados de **desenvolvimento** e **produção** através de um botão no rodapé da aplicação.

## 🎯 Como Funciona

### Interface do Usuário

1. **Badge no Rodapé**:
   - 🟡 **DEV** (amarelo) - Ambiente de desenvolvimento
   - 🟢 **PROD** (verde) - Ambiente de produção
   - Clique no badge para abrir o modal de alternância

2. **Modal de Alternância**:
   - Mostra ambiente e banco atual
   - Dois botões: **Development** e **Production**
   - Feedback visual com mensagens de sucesso/erro
   - Alerta lembrando de reiniciar o servidor

### Fluxo de Trabalho

```
1. Usuário clica no badge [DEV] ou [PROD] no rodapé
                ↓
2. Modal abre mostrando opções
                ↓
3. Usuário escolhe o ambiente desejado
                ↓
4. Backend modifica o arquivo .env
                ↓
5. Modal mostra mensagem de sucesso + aviso para reiniciar
                ↓
6. Usuário reinicia o servidor backend manualmente
                ↓
7. Aplicação passa a usar o novo banco de dados
```

## 🔧 Implementação Técnica

### Backend

**Endpoint**: `POST /api/system/switch-environment`

```json
// Request
{
  "environment": "development" // ou "production"
}

// Response
{
  "success": true,
  "message": "Ambiente alterado para DEVELOPMENT",
  "new_environment": "development",
  "active_database": "sqlite:///./erp_dev.db",
  "requires_restart": true,
  "warning": "⚠️ REINICIE O SERVIDOR BACKEND para aplicar as mudanças!"
}
```

**Arquivo**: `backend/app/routes/system.py`

### Frontend

**Componente**: `Footer.tsx`
- Estado para gerenciar modal
- Chamadas ao systemService
- UI com badges clicáveis e modal interativo

**Service**: `systemService.ts`
- Método `switchEnvironment()` para alternar
- Interface TypeScript com tipos

## ⚠️ Importante

### Reiniciar o Servidor é Obrigatório!

A alternância modifica apenas o arquivo `.env`. Para que as mudanças tenham efeito:

1. **Pare o servidor backend** (Ctrl+C no terminal)
2. **Inicie novamente** (python run_server.py)
3. A nova configuração será carregada

### Por Que Não Reinicia Automaticamente?

- **Segurança**: Evita reinícios acidentais em produção
- **Controle**: Permite revisar mudanças antes de aplicar
- **Compatibilidade**: Funciona em qualquer ambiente de deploy

## 🎨 Interface Visual

### Rodapé Normal

```
© 2026 TAKT ERP - Todos os direitos reservados. [DEV 🔄] 🗄️ SQLite
```

### Modal Aberto

```
┌─────────────────────────────────────────┐
│ 🔄 Alternar Ambiente               [✕]  │
├─────────────────────────────────────────┤
│                                         │
│ Ambiente Atual: DEVELOPMENT             │
│ Banco Atual: SQLite                     │
│                                         │
│  [💻 Development]  [🚀 Production]      │
│                                         │
│ ℹ️ Importante: Após alternar, você deve │
│ reiniciar o servidor backend            │
│ manualmente para que as mudanças        │
│ tenham efeito.                          │
│                                         │
└─────────────────────────────────────────┘
              [Fechar]
```

## 🔒 Segurança

### Validações Implementadas

1. ✅ Verifica se arquivo `.env` existe
2. ✅ Valida valores do ambiente (apenas "development" ou "production")
3. ✅ Mascara senhas ao exibir URLs de banco
4. ✅ Trata erros com mensagens claras
5. ✅ Desabilita botão do ambiente atual (evita cliques desnecessários)

### Considerações

- **Acesso ao Endpoint**: Considere adicionar autenticação se necessário
- **Logs**: Todas as alternâncias podem ser logadas para auditoria
- **Backup**: Sempre tenha backup antes de alternar em produção

## 📊 Estados da Interface

| Estado | Badge | Cor | Ação |
|--------|-------|-----|------|
| Development Ativo | DEV 🔄 | 🟡 Amarelo | Pode alternar para PROD |
| Production Ativo | PROD 🔄 | 🟢 Verde | Pode alternar para DEV |
| Carregando | (spinner) | - | Aguardando resposta do servidor |
| Erro | Mensagem vermelha | 🔴 Vermelho | Mostra erro no modal |
| Sucesso | Mensagem verde | 🟢 Verde | Mostra sucesso + aviso |

## 🚀 Uso Recomendado

### Para Desenvolvedores

```bash
# 1. Trabalhe em development
[Clique no badge DEV no rodapé]
# (já está em DEV, não precisa alternar)

# 2. Quando precisar testar com dados de produção
[Clique no badge DEV → Selecione Production]
[Reinicie o servidor backend]

# 3. Após testes, volte para development
[Clique no badge PROD → Selecione Development]
[Reinicie o servidor backend]
```

### Para Deploy

```bash
# 1. No servidor de produção, configure o .env inicialmente
ENVIRONMENT=production

# 2. Se precisar fazer manutenção com dados de teste
[Use o modal para alternar para DEV temporariamente]

# 3. Após manutenção, volte para produção
[Use o modal para alternar de volta para PROD]
```

## 🔄 Alternativas

Se precisar alternar sem interface gráfica, use os scripts CLI:

```bash
# Via Python
python switch_environment.py dev
python switch_environment.py prod

# Via PowerShell
.\switch-env.ps1 dev
.\switch-env.ps1 prod
```

## 🐛 Solução de Problemas

### Modal não abre

**Causa**: Erro ao buscar informações do sistema
**Solução**: Verifique se o backend está rodando e o endpoint `/api/system/info` está acessível

### Botão não responde

**Causa**: Já está no ambiente selecionado
**Solução**: O botão fica desabilitado quando você já está no ambiente correspondente

### Mudança não aplicada

**Causa**: Servidor não foi reiniciado
**Solução**: Sempre reinicie o servidor backend após alternar

### Erro "Arquivo .env não encontrado"

**Causa**: Arquivo `.env` não existe
**Solução**: Copie `.env.example` para `.env` e configure as variáveis

## 📚 Arquivos Relacionados

- **Backend**:
  - `backend/app/routes/system.py` - Endpoints de sistema
  - `backend/app/config.py` - Configuração e leitura de ambiente
  - `backend/.env` - Arquivo de configuração

- **Frontend**:
  - `frontend/src/components/Footer.tsx` - Interface de alternância
  - `frontend/src/services/systemService.ts` - Service de comunicação
  - `frontend/src/index.css` - Estilos do modal e alerts

---

**💡 Dica**: Em ambientes de produção, considere desabilitar a alternância via interface ou adicionar autenticação adicional para evitar mudanças não autorizadas.
