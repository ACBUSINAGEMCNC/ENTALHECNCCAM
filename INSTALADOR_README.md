# ENTALHE CNC CAM - Sistema de Instalação com Licença

## 📋 Visão Geral

Este sistema transforma o aplicativo ENTALHE CNC CAM em um software instalável que requer uma chave de licença para funcionar. O sistema inclui:

- ✅ Verificação de licença na inicialização
- ✅ Interface gráfica para ativação
- ✅ Chaves vinculadas ao hardware da máquina
- ✅ Sistema de expiração de licenças
- ✅ Gerador de chaves para distribuidores
- ✅ Instalador automatizado

## 🔧 Como Funciona

### 1. Verificação de Licença
- O `launcher.py` verifica se existe uma licença válida antes de iniciar
- Se não houver licença, abre uma janela para inserir a chave
- A chave é validada contra o banco de dados `valid_keys.json`
- A licença é vinculada ao hardware da máquina (não pode ser copiada)

### 2. Geração de Chaves
- Use `generate_license.py` ou `LicenseGenerator.exe` para criar chaves
- Cada chave tem formato: `ENTALHE-XXXXX-XXXXX-XXXXX`
- Chaves podem ter data de expiração personalizada
- Todas as chaves são armazenadas com hash SHA256

### 3. Instalação
- O `build_installer.py` cria um pacote completo
- Inclui instalador automático (`install.bat`)
- Cria atalhos na área de trabalho e menu iniciar

## 🚀 Como Usar

### Para Desenvolvedores/Distribuidores:

#### 1. Preparar o Ambiente
```bash
# Instalar dependências Python
pip install -r requirements.txt

# Instalar dependências Node.js
pnpm install
```

#### 2. Gerar Chaves de Licença
```bash
# Modo interativo
python generate_license.py

# Ou usar o executável (após build)
LicenseGenerator.exe
```

#### 3. Criar o Instalador
```bash
# Build completo (Next.js + Python + Instalador)
python build_installer.py
```

#### 4. Distribuir
1. Comprima a pasta `installer_package/`
2. Gere uma chave específica para o cliente
3. Envie ambos para o cliente

### Para Usuários Finais:

#### 1. Instalação
1. Extraia o pacote recebido
2. Execute `install.bat` como **Administrador**
3. Aguarde a conclusão da instalação

#### 2. Primeira Execução
1. Execute o programa pelo atalho criado
2. Digite a chave de licença fornecida
3. Clique em "OK" para ativar

#### 3. Uso Normal
- Após a ativação, o programa iniciará normalmente
- A licença fica salva e não precisa ser inserida novamente
- Se a licença expirar, será solicitada uma nova chave

## 📁 Estrutura de Arquivos

```
ENTALHECNCCAM/
├── launcher.py              # Aplicativo principal com verificação de licença
├── license_manager.py       # Sistema de gerenciamento de licenças
├── generate_license.py      # Gerador de chaves (modo interativo)
├── create_test_key.py       # Criador de chave de teste
├── build_installer.py       # Script de build do instalador
├── valid_keys.json          # Base de dados de chaves válidas
├── requirements.txt         # Dependências Python
└── installer_package/       # Pacote final para distribuição
    ├── EntalheCNC_CAM.exe   # Aplicativo principal
    ├── LicenseGenerator.exe # Gerador de chaves
    ├── install.bat          # Instalador automático
    ├── valid_keys.json      # Base de chaves
    └── README_INSTALACAO.txt # Instruções para o usuário
```

## 🔐 Segurança

### Chaves de Licença
- Formato: `ENTALHE-XXXXX-XXXXX-XXXXX`
- Armazenadas como hash SHA256
- Vinculadas ao hardware da máquina
- Não podem ser reutilizadas em outras máquinas

### Validação
- Verificação local contra `valid_keys.json`
- ID único da máquina baseado em hardware
- Verificação de data de expiração
- Proteção contra cópia de licenças

## 🛠️ Comandos Úteis

### Gerar Chave de Teste
```bash
python create_test_key.py
```

### Validar Chave Específica
```bash
python license_manager.py validate ENTALHE-XXXXX-XXXXX-XXXXX
```

### Build Completo
```bash
python build_installer.py
```

### Testar Aplicativo
```bash
python launcher.py
```

## 📝 Exemplo de Uso

### 1. Criar Chave para Cliente
```bash
python generate_license.py
# Escolha opção 1
# Digite nome do cliente: "João Silva"
# Digite dias de validade: 365
# Resultado: ENTALHE-A1B2C-D3E4F-G5H6I
```

### 2. Distribuir para Cliente
1. Execute `python build_installer.py`
2. Comprima `installer_package/`
3. Envie junto com a chave: `ENTALHE-A1B2C-D3E4F-G5H6I`

### 3. Cliente Instala
1. Extrai o pacote
2. Executa `install.bat` como admin
3. Abre o programa
4. Insere a chave quando solicitado
5. Programa ativado e funcionando!

## ⚠️ Notas Importantes

- **Backup**: Sempre faça backup do `valid_keys.json`
- **Administrador**: A instalação requer privilégios de administrador
- **Hardware**: Chaves são vinculadas ao hardware - mudanças significativas podem invalidar a licença
- **Expiração**: Monitore as datas de expiração das chaves
- **Suporte**: Mantenha registro de quais chaves foram distribuídas para quais clientes

## 🆘 Solução de Problemas

### "Chave inválida"
- Verifique se a chave foi digitada corretamente
- Confirme se a chave não expirou
- Verifique se o arquivo `valid_keys.json` está presente

### "Licença não é válida para esta máquina"
- A chave foi ativada em outro computador
- Gere uma nova chave para esta máquina específica

### Erro na instalação
- Execute o `install.bat` como Administrador
- Verifique se há espaço suficiente no disco
- Desative temporariamente o antivírus

### Aplicativo não inicia
- Verifique se o Node.js está instalado
- Confirme se a porta 3000 está disponível
- Execute `pnpm install` no diretório de instalação

---

**Desenvolvido para ENTALHE CNC CAM**  
Sistema de licenciamento seguro e fácil de usar.
