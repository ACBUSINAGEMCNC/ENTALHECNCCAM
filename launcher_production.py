import webview
import subprocess
import time
import atexit
import signal
import platform
import sys
import os
import http.server
import socketserver
import threading
from license_manager import LicenseManager

if platform.system() == "Windows":
    import ctypes
    user32 = ctypes.windll.user32
    width = user32.GetSystemMetrics(0)
    height = user32.GetSystemMetrics(1)
else:
    # Valor aproximado para telas comuns em outros sistemas
    width, height = 1920, 1080

# --------------------
# Verificação de Licença
# --------------------
print("Verificando licença...")
license_manager = LicenseManager()
is_licensed, message = license_manager.check_license()

if not is_licensed:
    print(f"Licença inválida: {message}")
    print("Iniciando processo de ativação...")
    
    # Tenta ativar via GUI
    if not license_manager.activate_license_gui():
        print("Ativação cancelada ou falhou. Encerrando aplicação.")
        sys.exit(1)
    
    print("Licença ativada com sucesso!")
else:
    print("Licença válida. Iniciando aplicação...")

# --------------------
# Servidor HTTP para arquivos estáticos
# --------------------
PORT = 3000

# Determina o caminho para os arquivos estáticos
def get_static_dir():
    # Verifica se estamos executando como aplicativo compilado pelo PyInstaller
    if getattr(sys, 'frozen', False):
        # Se estamos em modo frozen (compilado), o diretório base é diferente
        if hasattr(sys, '_MEIPASS'):
            base_dir = sys._MEIPASS
        else:
            base_dir = os.path.dirname(sys.executable)
        
        # Tenta diferentes locais possíveis para a pasta out
        possible_dirs = [
            os.path.join(base_dir, "out"),
            os.path.join(os.path.dirname(base_dir), "out"),
            os.path.join(os.path.dirname(sys.executable), "out")
        ]
        
        for dir_path in possible_dirs:
            if os.path.exists(dir_path):
                print(f"Encontrou pasta 'out' em: {dir_path}")
                return dir_path
    
    # Modo de desenvolvimento ou pasta não encontrada nos locais específicos para PyInstaller
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")

static_dir = get_static_dir()

if not os.path.exists(static_dir):
    print(f"ERRO: Pasta 'out' não encontrada em {static_dir}")
    print("Certifique-se de que os arquivos estáticos foram copiados corretamente.")
    
    # Evita o uso de input() que causa erros quando compilado
    try:
        # Verifica se estamos em modo compiled/frozen
        if getattr(sys, 'frozen', False):
            # Se estiver em modo compilado, usa messagebox
            import tkinter as tk
            from tkinter import messagebox
            root = tk.Tk()
            root.withdraw()  # Esconde a janela principal
            messagebox.showerror("Erro", f"Pasta 'out' não encontrada em {static_dir}\n\nCertifique-se de que os arquivos estáticos foram copiados corretamente.")
            root.destroy()
        else:
            # Modo normal (não compilado)
            input("Pressione Enter para sair...")
    except Exception:
        # Falha silenciosa, apenas continue com o sys.exit
        pass
        
    sys.exit(1)

print(f"Servindo arquivos estáticos de: {static_dir}")

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=static_dir, **kwargs)
    
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def translate_path(self, path):
        """Traduz o caminho da URL para o sistema de arquivos.
        Corrige o prefixo /ENTALHECNCCAM/ removendo-o do caminho"""
        # Remover prefixo ENTALHECNCCAM se presente
        if '/ENTALHECNCCAM/' in path:
            print(f"Corrigindo caminho: {path}")
            path = path.replace('/ENTALHECNCCAM/', '/')
            print(f"Caminho corrigido: {path}")
            
        # Chama a implementação original após corrigir o caminho
        return super().translate_path(path)

def start_server():
    """Inicia o servidor HTTP em uma thread separada"""
    global httpd
    try:
        httpd = socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler)
        print(f"Servidor HTTP iniciado na porta {PORT}")
        httpd.serve_forever()
    except Exception as e:
        print(f"Erro ao iniciar servidor: {e}")

# Inicia o servidor em thread separada
print("Iniciando servidor HTTP em segundo plano...")
server_thread = threading.Thread(target=start_server, daemon=True)
server_thread.start()

# Aguarda o servidor iniciar com verificação
print("Aguardando servidor iniciar...")
max_wait = 15  # segundos máximos de espera
for i in range(max_wait):
    try:
        # Tenta conectar ao servidor para verificar se está rodando
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex(('127.0.0.1', PORT))
        sock.close()
        if result == 0:
            print(f"Servidor HTTP iniciado com sucesso na porta {PORT}")
            break
    except Exception as e:
        print(f"Tentativa {i+1}/{max_wait} de verificar servidor: {e}")
    time.sleep(1)
else:
    print("AVISO: Tempo limite excedido ao aguardar servidor HTTP iniciar")

# Função de limpeza
def _cleanup():
    global httpd
    try:
        if 'httpd' in globals():
            httpd.shutdown()
            httpd.server_close()
        print("Servidor HTTP encerrado.")
    except Exception as e:
        print(f"Erro ao encerrar servidor: {e}")

atexit.register(_cleanup)

# Classe API para interação entre JavaScript e Python
class Api:
    def save_file(self, content, filename="codigo_entalhy_cnc.nc"):
        """Salva o conteúdo em um arquivo escolhido pelo usuário"""
        try:
            # Usar o seletor de arquivos nativo do sistema
            # Formato simplificado sem filtros complexos para evitar erros
            try:
                file_path = window.create_file_dialog(webview.SAVE_DIALOG, 
                                                  directory='~', 
                                                  save_filename=filename)
            except Exception as e:
                print(f"Erro ao criar diálogo de arquivo: {str(e)}")
                # Tenta novamente sem especificar tipos de arquivo
                file_path = window.create_file_dialog(webview.SAVE_DIALOG, 
                                                  directory='~', 
                                                  save_filename=filename)
            
            if file_path:
                # Verifica se o arquivo tem extensão, se não, adiciona .nc
                if not file_path.lower().endswith(('.nc', '.gcode')):
                    file_path += '.nc'
                    
                with open(file_path, 'w') as f:
                    f.write(content)
                return {'success': True, 'message': f'Arquivo salvo em: {file_path}'}
            else:
                return {'success': False, 'message': 'Operação de salvamento cancelada pelo usuário'}
        except Exception as e:
            return {'success': False, 'message': f'Erro ao salvar arquivo: {str(e)}'}

# Cria e inicia a janela do webview
print("Iniciando interface gráfica...")
try:
    api = Api()
    window = webview.create_window(
        "ENTALHE CNC CAM",
        f"http://localhost:{PORT}",
        width=width,
        height=height,
        resizable=True,
        min_size=(800, 600),
        js_api=api  # Expõe a API para o JavaScript
    )
    
    # Adiciona handler para detectar quando a janela é fechada
    def on_closed():
        print("Janela fechada pelo usuário")
        _cleanup()
        
    window.events.closed += on_closed
    
    print("Iniciando loop principal da aplicação...")
    webview.start(debug=False)
    print("Aplicação encerrada normalmente.")
except Exception as e:
    print(f"ERRO ao iniciar interface gráfica: {e}")
    
    # Mostra mensagem de erro ao usuário
    try:
        import tkinter as tk
        from tkinter import messagebox
        root = tk.Tk()
        root.withdraw()
        messagebox.showerror("Erro", f"Falha ao iniciar a interface gráfica:\n\n{str(e)}")
        root.destroy()
    except:
        pass
    
    _cleanup()
    sys.exit(1)
