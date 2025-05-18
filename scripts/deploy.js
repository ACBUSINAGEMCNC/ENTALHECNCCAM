const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Função para executar comandos
function runCommand(command) {
  console.log(`Executando: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Falha ao executar: ${command}`, error);
    process.exit(1);
  }
}

// Função principal de deploy
async function deploy() {
  try {
    // Construir o projeto
    console.log('Construindo o projeto...');
    runCommand('npm run build');

    // Verificar se a pasta out existe
    const outDir = path.join(process.cwd(), 'out');
    if (!fs.existsSync(outDir)) {
      console.error('A pasta "out" não foi criada. Verifique se a configuração do Next.js está correta.');
      process.exit(1);
    }

    // Criar arquivo .nojekyll na pasta out
    console.log('Criando arquivo .nojekyll...');
    fs.writeFileSync(path.join(outDir, '.nojekyll'), '');

    // Deploy para GitHub Pages
    console.log('Fazendo deploy para GitHub Pages...');
    runCommand('npx gh-pages -d out -t true');

    console.log('Deploy concluído com sucesso!');
    console.log('Seu site estará disponível em: https://acbusinagemcnc.github.io/ENTALHECNCCAM/');
  } catch (error) {
    console.error('Erro durante o deploy:', error);
    process.exit(1);
  }
}

// Executar a função de deploy
deploy();
