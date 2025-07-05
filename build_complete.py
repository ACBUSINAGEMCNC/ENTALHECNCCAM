import os
import subprocess
import sys
import time

def run_command(cmd, cwd=None):
    """Executa um comando e mostra a saída em tempo real"""
    print(f"\n> Executando: {cmd}")
    process = subprocess.Popen(
        cmd, 
        shell=True, 
        stdout=subprocess.PIPE, 
        stderr=subprocess.STDOUT,
        text=True,
        cwd=cwd
    )
    
    # Mostra a saída em tempo real
    for line in iter(process.stdout.readline, ''):
        sys.stdout.write(line)
        sys.stdout.flush()
        
    process.wait()
    return process.returncode == 0

def main():
    """Processo de build completo para o ENTALHE CNC CAM"""
    print("\n===== BUILD COMPLETO DO ENTALHE CNC CAM =====")
    
    # Diretório do projeto
    project_dir = os.path.dirname(os.path.abspath(__file__))
    print(f"Diretório do projeto: {project_dir}")
    
    # 1. Configurar pnpm para permitir scripts
    print("\n1. Configurando pnpm para permitir scripts do Electron...")
    cmds = [
        "pnpm config set --location project auto-install-peers true",
        "pnpm config set --location project strict-peer-dependencies false",
        "pnpm config set unsafe-perm true",
        "pnpm config set node-linker hoisted",
        "pnpm config set public-hoist-pattern[]=*electron*",
        "pnpm config set public-hoist-pattern[]=*node-gyp*",
        "pnpm config set --location project enable-pre-post-scripts true"
    ]
    
    for cmd in cmds:
        if not run_command(cmd, project_dir):
            print(f"Erro ao executar: {cmd}")
            return False
    
    # 2. Reinstalar dependências
    print("\n2. Reinstalando dependências...")
    if not run_command("pnpm install --force", project_dir):
        print("Erro ao reinstalar dependências.")
        return False
    
    # 3. Build do Next.js
    print("\n3. Construindo projeto Next.js...")
    if not run_command("pnpm run build", project_dir):
        print("Erro ao construir o projeto Next.js.")
        return False
    
    # 4. Continua com o build_final.py
    print("\n4. Executando build_final.py...")
    if not run_command(f"{sys.executable} build_final.py", project_dir):
        print("Erro ao executar build_final.py.")
        return False
    
    print("\n===== BUILD CONCLUÍDO COM SUCESSO =====")
    return True

if __name__ == "__main__":
    try:
        success = main()
        if not success:
            print("\n❌ Processo de build falhou!")
            sys.exit(1)
        else:
            print("\n✅ Processo de build concluído com sucesso!")
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}")
        sys.exit(1)
    
    input("\nPressione Enter para sair...")
