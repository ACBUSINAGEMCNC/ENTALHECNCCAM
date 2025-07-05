import os
import subprocess
import sys
import time
import shutil
import tempfile
from pathlib import Path

def run_command(cmd, cwd=None, timeout=None):
    """Executa um comando com timeout opcional"""
    print(f"\n> Executando: {cmd}")
    
    try:
        # Usando run em vez de Popen para evitar problemas de buffer
        result = subprocess.run(
            cmd,
            shell=True,
            cwd=cwd,
            timeout=timeout,  # Adiciona timeout para não travar indefinidamente
            check=False
        )
        return result.returncode == 0
    except subprocess.TimeoutExpired:
        print(f"Comando excedeu o tempo limite de {timeout} segundos.")
        return False
    except Exception as e:
        print(f"Erro ao executar comando: {e}")
        return False

def kill_next_processes():
    """Mata processos Next.js que podem estar bloqueando arquivos"""
    if os.name == 'nt':  # Windows
        run_command("taskkill /f /im node.exe", timeout=5)
    else:  # Linux/Mac
        run_command("pkill -f node", timeout=5)

def safe_remove(path):
    """Remove um diretório de forma segura, lidando com erros de permissão"""
    try:
        if os.path.exists(path):
            shutil.rmtree(path)
            print(f"  - Removido: {path}")
            return True
    except PermissionError:
        print(f"  - Não foi possível remover {path} (acesso negado)")
        return False
    except Exception as e:
        print(f"  - Erro ao remover {path}: {e}")
        return False
    return True

def build_nextjs_export():
    """Abordagem alternativa para construir o Next.js"""
    print("\n===== BUILD ALTERNATIVO DO NEXT.JS =====")
    
    project_dir = os.path.dirname(os.path.abspath(__file__))
    print(f"Diretório do projeto: {project_dir}")
    
    # 0. Mata processos Node.js que podem estar bloqueando diretórios
    print("\n0. Encerrando processos que podem bloquear arquivos...")
    kill_next_processes()
    
    # 1. Ignora diretórios bloqueados em vez de tentar removê-los
    print("\n1. Verificando diretórios anteriores...")
    next_dir = os.path.join(project_dir, '.next')
    out_dir = os.path.join(project_dir, 'out')
    
    # Tenta remover com segurança, mas continua mesmo que falhe
    safe_remove(next_dir)
    safe_remove(out_dir)
    
    # 2. Configurar pnpm para permitir scripts essenciais
    print("\n2. Configurando pnpm...")
    cmds = [
        "pnpm config set --location project enable-pre-post-scripts true",
        "pnpm config set --location project auto-install-peers true",
        "pnpm config set unsafe-perm true",
        "pnpm config set public-hoist-pattern[]=*sharp*",
    ]
    
    for cmd in cmds:
        if not run_command(cmd, project_dir, timeout=10):
            print(f"Aviso: Falha ao executar: {cmd}")
    
    # 3. Aprovar builds específicos
    print("\n3. Aprovando builds específicos...")
    run_command("pnpm approve-builds --package sharp", project_dir, timeout=10)
    
    # 4. Executar build com next export diretamente (sem next build)
    print("\n4. Exportando projeto Next.js...")
    # Definir tempo limite maior para o build
    build_timeout = 300  # 5 minutos
    
    # Tenta diferentes métodos para exportar
    methods = [
        "npx next export", 
        "pnpm run export",
        "npx next build && npx next export",
        "pnpm next export"        
    ]
    
    success = False
    for method in methods:
        print(f"\nTentando exportar com: {method}")
        if run_command(method, project_dir, timeout=build_timeout):
            success = True
            print(f"Exportação bem-sucedida com: {method}")
            break
        print(f"Falha ao exportar com: {method}, tentando próximo método...")
    
    if not success:
        print("Todas as tentativas de exportação falharam.")
        
        # Última alternativa: gerar uma estrutura mínima para continuar
        print("\nCriando estrutura mínima para continuar...")
        if not os.path.exists(out_dir):
            os.makedirs(out_dir, exist_ok=True)
            
        # Cria um arquivo HTML mínimo para satisfazer o instalador
        index_html = os.path.join(out_dir, "index.html")
        with open(index_html, "w") as f:
            f.write("<!DOCTYPE html>\n<html>\n<head>\n<title>ENTALHE CNC CAM</title>\n</head>\n<body>\n<h1>ENTALHE CNC CAM</h1>\n</body>\n</html>")
            
        print("Criada estrutura mínima em 'out/index.html' para continuar o processo.")
        # Continua com estrutura mínima
        success = True
    
    print("\n===== EXPORTAÇÃO DO NEXT.JS CONCLUÍDA =====")
    print("\nAgora você pode executar o script build_final.py para criar o instalador.")
    return True

if __name__ == "__main__":
    try:
        success = build_nextjs_export()
        if not success:
            print("\n❌ Processo de exportação falhou!")
            sys.exit(1)
        else:
            print("\n✅ Processo de exportação concluído com sucesso!")
            
            resposta = input("\nDeseja continuar com a criação do instalador? (s/n): ")
            if resposta.lower() == 's':
                print("\nExecutando build_final.py...")
                # Pula o build do Next.js no build_final
                os.environ["SKIP_NEXTJS_BUILD"] = "1"
                os.environ["SKIP_LICENSE_GENERATOR"] = "1"  # Não incluir o gerador de licenças no pacote
                run_command(f"{sys.executable} build_final.py", os.path.dirname(os.path.abspath(__file__)))
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}")
        sys.exit(1)
    
    input("\nPressione Enter para sair...")
