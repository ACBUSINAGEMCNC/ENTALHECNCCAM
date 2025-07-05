from PIL import Image
import os

# Caminho para o logo
logo_path = os.path.join('public', 'images', 'entalhy-logo.png')
icone_path = 'entalhe_icon.ico'

# Verifica se o logo existe
if not os.path.exists(logo_path):
    print(f"ERRO: Logo não encontrado em {logo_path}")
    exit(1)

try:
    # Abre a imagem
    img = Image.open(logo_path)
    
    # Converte para tamanhos de ícone (16x16, 32x32, 48x48, 64x64, 128x128, 256x256)
    icon_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    img.save(icone_path, sizes=icon_sizes)
    
    print(f"Ícone criado com sucesso: {icone_path}")
except Exception as e:
    print(f"Erro ao converter imagem para ícone: {e}")
    exit(1)
