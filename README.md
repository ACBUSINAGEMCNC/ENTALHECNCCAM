<div align="center">

# ENTALHY CNC

### Gerador de Código G para Usinagem de Entalhes

![Versão](https://img.shields.io/badge/versão-2.0.0-blue)
![Licença](https://img.shields.io/badge/licença-Proprietária-red)
![Plataforma](https://img.shields.io/badge/plataforma-Web-brightgreen)

</div>

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Instalação e Execução](#-instalação-e-execução)
- [Guia de Uso](#-guia-de-uso)
- [Parâmetros de Usinagem](#-parâmetros-de-usinagem)
- [Exemplos de Aplicação](#-exemplos-de-aplicação)
- [Solução de Problemas](#-solução-de-problemas)
- [Atualizações Recentes](#-atualizações-recentes)
- [Licença](#-licença)

## 🔍 Visão Geral

O **ENTALHY CNC** é uma aplicação web moderna e especializada para geração de código G (NC) para usinagem de entalhes e chavetas em peças cilíndricas. Desenvolvido para atender às necessidades de operadores e programadores CNC, o sistema oferece uma interface intuitiva, simulação visual em tempo real e geração precisa de código G otimizado para diferentes tipos de máquinas CNC.

Ideal para fabricação de engrenagens, eixos estriados, chavetas e outros componentes mecânicos que exigem entalhes precisos, o ENTALHY CNC elimina a necessidade de programação manual, reduzindo erros e aumentando a produtividade.

## ✨ Funcionalidades

- **🧮 Geração Avançada de Código G**
  - Criação automática de código G otimizado para usinagem de entalhes
  - Suporte a múltiplos passes com controle preciso de profundidade
  - Validação de parâmetros para evitar erros de programação

- **🎮 Simulação Visual Interativa**
  - Visualização em tempo real do processo de usinagem
  - Modos de visualização 2D e 3D com controles intuitivos
  - Ajuste de velocidade, zoom e ângulo de visualização

- **🌓 Interface Moderna e Adaptável**
  - Design responsivo para uso em diferentes dispositivos
  - Modo escuro/claro para redução do cansaço visual
  - Tooltips explicativos para cada parâmetro

- **💾 Exportação e Compartilhamento**
  - Salve o código G gerado em formato .nc compatível com máquinas CNC
  - Documentação detalhada dos parâmetros utilizados

## 🛠 Tecnologias

O ENTALHY CNC foi desenvolvido utilizando tecnologias modernas para garantir desempenho, usabilidade e manutenibilidade:

- **Frontend:**
  - React.js e Next.js para uma interface de usuário reativa e eficiente
  - TypeScript para tipagem estática e código mais robusto
  - Tailwind CSS para estilização moderna e responsiva

- **Visualização:**
  - Three.js para renderização 3D de alta performance
  - Canvas API para visualização 2D otimizada

- **Arquitetura:**
  - Padrão de projeto modular para melhor organização e manutenção
  - Context API para gerenciamento de estado
  - Componentes reutilizáveis para consistência da interface

## 🚀 Instalação e Execução

### Requisitos

- Node.js 18.0 ou superior
- npm ou pnpm

### Passos para Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/entalhy-cnc.git

# Entre no diretório do projeto
cd entalhy-cnc

# Instale as dependências
pnpm install

# Inicie o servidor de desenvolvimento
pnpm dev
```

### Acesso Online

A aplicação também pode ser acessada diretamente pelo navegador em [https://entalhy-cnc.vercel.app](https://entalhy-cnc.vercel.app) (exemplo), sem necessidade de instalação local. Ideal para uso em oficinas e ambientes de fabricação.

## 📖 Guia de Uso

### 1. Configure os Parâmetros de Usinagem

- Expanda as seções de parâmetros (Usinagem, Geometria da Peça, Ferramenta)
- Defina as dimensões da peça (diâmetros inicial e final)
- Configure a profundidade de corte, número de entalhes e demais parâmetros
- Observe os valores calculados automaticamente (raios, profundidade, deslocamento)

### 2. Gere o Código G

- Verifique se todos os parâmetros estão corretos
- Clique no botão "Gerar Código G"
- O código será exibido no painel direito e estará pronto para simulação

### 3. Simule o Processo de Usinagem

- Clique em "Iniciar Simulação" para visualizar o processo
- Use os controles para pausar, reiniciar ou ajustar a velocidade
- Alterne entre visualizações 2D e 3D conforme necessário
- Utilize os controles de zoom para examinar detalhes específicos

### 4. Exporte o Código G

- Após verificar a simulação, clique em "Salvar Código"
- O arquivo .nc será baixado automaticamente
- Transfira o arquivo para sua máquina CNC seguindo os procedimentos padrão

## 📐 Parâmetros de Usinagem

### Parâmetros Básicos

| Parâmetro | Descrição | Unidade | Valor Típico |
|-----------|-----------|---------|-------------|
| **Ponto Início Z** | Posição inicial da ferramenta no eixo Z | mm | 5.0 |
| **Profundidade Final Z-** | Profundidade máxima de corte no eixo Z | mm | -5.0 |
| **Número de Entalhes** | Quantidade de entalhes distribuídos ao redor da peça | - | 4 |
| **Avanço F** | Velocidade de avanço da ferramenta durante o corte | mm/min | 100 |
| **Material por Passe AP Y** | Quantidade de material removido em cada passe | mm | 1.0 |

### Geometria da Peça

| Parâmetro | Descrição | Unidade | Valor Típico |
|-----------|-----------|---------|-------------|
| **Diâmetro Inicial** | Diâmetro da peça antes da usinagem | mm | 30.0 |
| **Diâmetro Final** | Diâmetro da peça após a usinagem | mm | 40.0 |

### Parâmetros da Ferramenta

| Parâmetro | Descrição | Unidade | Valor Típico |
|-----------|-----------|---------|-------------|
| **Diâmetro da Ferramenta** | Tamanho da ferramenta de corte | mm | 8.0 |
| **Abertura da Chaveta X** | Largura total desejada para a chaveta | mm | 10.0 |
| **Lado do Recuo** | Direção do recuo após o corte (positivo/negativo) | - | Positivo |

## 🔍 Exemplos de Aplicação

### Exemplo 1: Chaveta Simples

```
Parâmetros:
- Diâmetro Inicial: 30mm
- Diâmetro Final: 40mm
- Número de Entalhes: 1
- Profundidade Final Z: -5mm
- Abertura da Chaveta: 8mm
```

Ideal para criar uma única chaveta em um eixo cilíndrico, como em acoplamentos mecânicos.

### Exemplo 2: Engrenagem de 8 Dentes

```
Parâmetros:
- Diâmetro Inicial: 40mm
- Diâmetro Final: 50mm
- Número de Entalhes: 8
- Profundidade Final Z: -10mm
- Abertura da Chaveta: 6mm
```

Perfeito para criar engrenagens de pequeno porte ou componentes estriados.

## ❓ Solução de Problemas

### Problemas Comuns e Soluções

| Problema | Possível Causa | Solução |
|----------|---------------|--------|
| **Código G não é gerado** | Parâmetros inválidos | Verifique se todos os campos estão preenchidos corretamente |
| **Simulação não inicia** | Código G não gerado | Gere o código G antes de tentar simular |
| **Visualização 3D não aparece** | Problema com WebGL | Tente usar um navegador mais recente ou ative a aceleração de hardware |
| **Erro na exportação do arquivo** | Permissões do navegador | Verifique se o navegador tem permissão para download de arquivos |

## 🆕 Atualizações Recentes

### Versão 2.0.0 (Maio 2025)
- Migração completa para React/Next.js com TypeScript
- Nova interface com suporte a tema escuro
- Simulação 3D aprimorada com controles de câmera
- Validação avançada de parâmetros

### Versão 1.5.0 (Janeiro 2025)
- Adicionado suporte para visualização 3D
- Melhorias na geração de código G
- Correções de bugs e otimizações de desempenho

## 📜 Licença

© 2025 ENTALHY CNC - Todos os direitos reservados

Este software é proprietário e seu uso está sujeito aos termos de licenciamento. Não é permitida a redistribuição, engenharia reversa ou uso comercial sem autorização expressa.
