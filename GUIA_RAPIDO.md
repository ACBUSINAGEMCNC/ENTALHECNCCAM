# 🚀 GUIA RÁPIDO - Sistema de Instalação com Licença

## ✅ Sistema Implementado e Funcionando!

O seu aplicativo **ENTALHE CNC CAM** agora possui um sistema completo de licenciamento que transforma ele em um software instalável profissional.

---

## 🎯 O Que Foi Implementado

### 🔐 Sistema de Licenciamento
- ✅ Verificação automática na inicialização
- ✅ Interface gráfica para ativação
- ✅ Chaves vinculadas ao hardware da máquina
- ✅ Sistema de expiração configurável
- ✅ Proteção contra cópia/pirataria

### 📦 Sistema de Distribuição
- ✅ Gerador de chaves para clientes
- ✅ Empacotamento automático com PyInstaller
- ✅ Instalador automático para Windows
- ✅ Atalhos na área de trabalho e menu iniciar

---

## 🚀 Como Usar (Passo a Passo)

### Para Você (Desenvolvedor/Distribuidor):

#### 1️⃣ Gerar Chaves para Clientes
```bash
python generate_license.py
# Escolha opção 1, digite nome do cliente e dias de validade
```

#### 2️⃣ Criar o Instalador
```bash
python build_installer.py
# Aguarde o processo completar (pode demorar alguns minutos)
```

#### 3️⃣ Distribuir
1. Comprima a pasta `installer_package/`
2. Envie para o cliente junto com a chave gerada
3. Instrua o cliente a seguir os passos abaixo

### Para o Cliente (Usuário Final):

#### 1️⃣ Instalação
1. Extrair o arquivo recebido
2. Executar `install.bat` **como Administrador**
3. Aguardar a conclusão da instalação

#### 2️⃣ Primeira Execução
1. Abrir o programa pelo atalho criado
2. Digitar a chave de licença fornecida
3. Clicar "OK" para ativar

#### 3️⃣ Uso Normal
- Após ativação, o programa funciona normalmente
- Não precisa inserir a chave novamente
- Se a licença expirar, será solicitada nova chave

---

## 🔑 Exemplo de Chaves Geradas

Atualmente você tem **4 chaves válidas** no sistema:

1. **ENTALHE-07E77-1A0AE-81206** (Cliente Teste - 30 dias)
2. **ENTALHE-CDC26-7550D-FC507** (Cliente Demo - 90 dias)  
3. **ENTALHE-651EF-F0A5C-31B23** (Cliente Demonstração - 180 dias)
4. **ENTALHE-55FA5-A080B-EF7DB** (Teste Sistema - 1 dia)

---

## 🛠️ Comandos Úteis

### Verificar Sistema
```bash
python verificar_sistema.py
```

### Demonstração Completa
```bash
python demo_completo.py
```

### Testar Aplicativo
```bash
python launcher.py
```

### Gerar Chave Rápida
```bash
python create_test_key.py
```

---

## 📁 Arquivos Importantes

| Arquivo | Descrição |
|---------|-----------|
| `launcher.py` | Aplicativo principal com verificação de licença |
| `license_manager.py` | Sistema de gerenciamento de licenças |
| `generate_license.py` | Gerador interativo de chaves |
| `build_installer.py` | Criador do instalador |
| `valid_keys.json` | Base de dados de chaves válidas |
| `installer_package/` | Pacote final para distribuição |

---

## 🔒 Segurança

### Proteções Implementadas:
- 🔐 Chaves armazenadas como hash SHA256
- 🖥️ Vinculação ao hardware da máquina
- ⏰ Sistema de expiração automática
- 🚫 Proteção contra cópia de licenças
- 🔍 Validação local e segura

### ID da Sua Máquina:
`ac30237c35d0691a`

---

## 🎉 Próximos Passos

### Imediatos:
1. **Teste o sistema**: Execute `python launcher.py`
2. **Gere chaves**: Use `python generate_license.py`
3. **Crie o instalador**: Execute `python build_installer.py`

### Para Distribuição:
1. **Comprima** a pasta `installer_package/`
2. **Gere chaves específicas** para cada cliente
3. **Envie** o pacote + chave para os clientes
4. **Forneça suporte** usando este guia

---

## 📞 Suporte

### Problemas Comuns:

**"Chave inválida"**
- Verificar se foi digitada corretamente
- Confirmar se não expirou
- Gerar nova chave se necessário

**"Licença não é válida para esta máquina"**
- Chave foi ativada em outro computador
- Gerar nova chave específica para a máquina

**Erro na instalação**
- Executar como Administrador
- Verificar espaço em disco
- Desativar antivírus temporariamente

---

## 🏆 Resultado Final

Você agora tem um **sistema profissional de distribuição de software** que:

✅ **Protege** seu código contra pirataria  
✅ **Controla** quem pode usar o software  
✅ **Gerencia** licenças e expirações  
✅ **Facilita** a distribuição para clientes  
✅ **Profissionaliza** seu produto  

**Parabéns! Seu software está pronto para distribuição comercial! 🎉**
